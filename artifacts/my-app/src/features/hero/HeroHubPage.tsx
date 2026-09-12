import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import {
  GAvatar, GBadge, GButton, GEmptyState, GInfoRow, GModal, GProgressBar, GSlot, GTag,
} from '@/shared/ui/gameUI';
import { useAuthStore } from '@/store/authStore';
import { useCharacterStore } from '@/store/characterStore';
import { usePlayerStore } from '@/store/playerStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { getAvatarPath, getDollPath, getDollPath2x, getRaceLabel, type RaceId } from '@/data/characters';
import { iconUrl } from '@/lib/assetUrl';
import { getItemRarity } from '@/features/inventory/ItemIcon';
import { UniversalInfoModal } from '@/components/modals/UniversalInfoModal';
import { ATabs } from '@/shared/ui/kit/ATabs';
import {
  BRANCHES,
  BRANCH_IDS,
  DEEP_PASSIVES,
  HERO_HELP,
  PILLAR_IDS,
  PILLARS,
  SUBSTATS,
  SUBSTATS_BY_PILLAR,
  type BranchId,
  type NodeRef,
  type PassiveId,
  type PillarId,
} from '@/domain/attributes/attributes';
import { foldBonusesIntoRaw, sumEquipmentBonuses } from '@/domain/attributes/equipmentSubstats';
import {
  EQUIP_SLOT_ICON,
  HUB_NAV_ICON,
  PILLAR_ICON,
  SYNERGY_ICON,
} from '@/domain/attributes/attributeIcons';
import { SYNERGIES, type SynergyDef, type SynergyId } from '@/domain/attributes/synergies';
import { getItem } from '@/domain/items';
import { ItemCell } from '@/shared/ui/kit/ItemCell';
import type { EquipSlot, Equipment, Item } from '@/data/types';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { getLiveGearSets, loadGearSet, saveGearSet } from '@/domain/items/gearSets';
import {
  computeAttributeSnapshot,
  computeSubstatDisplays,
  getLiveAttributes,
  nodeBlockReason,
  nodeRank,
  respecBranchRanks,
  respecPillarRanks,
  spendBranchPoint,
  spendPillarPoint,
  substatDisplay,
  type SubstatDisplay,
} from '@/domain/attributes/characterAttributes';
import { NODE_RANK_CAP } from '@/data/balance/pillars';
import { BRANCH_EFFECTS } from '@/data/balance/branchEffects';
import { BRANCH_RANK_IN_PILLAR_POINTS } from '@/data/balance/substats';
import { xpToNextLevel } from '@/data/balance/xpRates';
import { commitGearSets, commitHeroAttributes } from '@/lib/heroPersist';
import { HeroBoard } from '@/features/hero/HeroBoard';
import { PATH_PLAQUE_SUBSTATS, PATH_SHEET_BY_PILLAR, formatStrikeRange } from '@/features/hero/heroReadout';
import { HeroSettingsModal } from '@/features/hero/HeroSettingsModal';

type HubModule = 'body' | 'gear' | 'synergies' | 'path';
type Detail =
  | { kind: 'pillar'; id: PillarId }
  | { kind: 'branch'; id: BranchId }
  | { kind: 'passive'; id: PassiveId }
  | { kind: 'synergy'; id: SynergyId }
  | { kind: 'gear'; slot: EquipSlot }
  | { kind: 'locked-slot' }
  | { kind: 'bag-item'; itemId: string };

const PORTRAIT = 64;

const MODULES: { id: HubModule; label: string }[] = [
  { id: 'body', label: 'Тело' },
  { id: 'gear', label: 'Экип' },
  { id: 'synergies', label: 'Нити' },
  { id: 'path', label: 'Путь' },
];

export interface EquipSlotDef {
  slot: EquipSlot | 'locked';
  label: string;
  locked?: boolean;
}

/** Слева 1-я колонка: боевая экипировка (7 слотов) */
const GEAR_LEFT_COL1: EquipSlotDef[] = [
  { slot: 'helm', label: 'Шлем' },
  { slot: 'platebody', label: 'Торс' },
  { slot: 'platelegs', label: 'Штаны' },
  { slot: 'boots', label: 'Обувь' },
  { slot: 'gloves', label: 'Перчатки' },
  { slot: 'weapon', label: 'Оружие' },
  { slot: 'shield', label: 'Щит' },
];

/**
 * Слева 2-я колонка: аксессуары и украшения (7 слотов).
 * Порядок — по договорённости с владельцем: браслеты стоят рядом со штанами
 * (строка 3), а плащ — в самой нижней ячейке, рядом со щитом.
 */
const GEAR_LEFT_COL2: EquipSlotDef[] = [
  { slot: 'amulet', label: 'Ожерелье' },
  { slot: 'belt', label: 'Пояс' },
  { slot: 'bracelet', label: 'Браслет 1' },
  { slot: 'bracelet2', label: 'Браслет 2' },
  { slot: 'ring', label: 'Кольцо 1' },
  { slot: 'ring2', label: 'Кольцо 2' },
  { slot: 'cape', label: 'Плащ' },
];

import { Swords, Shield, Sparkles, Package, Save, Lock, ChevronLeft, ChevronRight } from 'lucide-react';

type BagFilter = 'all' | 'weapon' | 'armor' | 'jewel';

const BAG_FILTERS: { id: BagFilter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'Всё', icon: Package },
  { id: 'weapon', label: 'Оружие', icon: Swords },
  { id: 'armor', label: 'Броня', icon: Shield },
  { id: 'jewel', label: 'Бижа', icon: Sparkles },
];

const WEAPON_CATS = new Set(['weapon', 'shield', 'quiver']);
const JEWEL_CATS = new Set(['amulet', 'ring', 'bracelet', 'ring2', 'bracelet2', 'passive']);

/** Категория предмета для фильтра сумки; null — не снаряжение. */
function bagFilterOf(item: Item): BagFilter | null {
  if (!item.equipSlot) return null;
  if (WEAPON_CATS.has(item.category) || item.equipSlot === 'weapon' || item.equipSlot === 'shield') return 'weapon';
  if (JEWEL_CATS.has(item.category) || ['amulet', 'ring', 'ring2', 'bracelet', 'bracelet2', 'passive'].includes(item.equipSlot)) return 'jewel';
  return 'armor';
}

const RARITY_RU: Record<ReturnType<typeof getItemRarity>, string> = {
  common: 'Обычный',
  uncommon: 'Необычный',
  rare: 'Редкий',
  epic: 'Эпический',
  legendary: 'Легендарный',
  mythic: 'Мифический',
};

const GEAR_LABEL: Record<EquipSlot, string> = {
  helm: 'Шлем',
  platebody: 'Торс',
  platelegs: 'Штаны',
  boots: 'Обувь',
  gloves: 'Перчатки',
  amulet: 'Амулет',
  ring: 'Кольцо',
  ring2: 'Кольцо',
  bracelet: 'Браслет',
  bracelet2: 'Браслет',
  belt: 'Пояс',
  cape: 'Плащ',
  quiver: 'Колчан',
  weapon: 'Правая рука',
  shield: 'Левая рука',
  passive: 'Талисман',
};

function shownStat(value: number): number {
  return Math.round(value);
}

function signedStat(value: number): string {
  const n = shownStat(value);
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return '0';
}

/** Показ по типу стата: HP/урон как число, rating/percent — процентом. */
function formatSubstat(d: SubstatDisplay): string {
  const rounded = Math.round(d.value * 10) / 10;
  const num = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return d.unit === 'percent' ? `${num}%` : num;
}

/** Подпись прибавки от экипа к подхарактеристике (уже разница в единице показа). */
function gearBonusText(value: number, unit: string): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  const n = Math.abs(value);
  const rounded = Math.round(n * 10) / 10;
  const num = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return unit === 'percent' ? `${sign}${num}%` : `${sign}${num}`;
}

function rawBonusText(id: BranchId, value: number): string {
  const display = substatDisplay(id, Math.abs(value));
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  const rounded = Math.round(display.value * 10) / 10;
  const num = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return display.unit === 'percent' ? `${sign}${num}%` : `${sign}${num}`;
}

function itemBonusRows(item: Item | undefined): { id: BranchId; label: string; value: string; raw: number }[] {
  if (!item?.substatBonuses) return [];
  return (Object.entries(item.substatBonuses) as [BranchId, number][])
    .filter(([id, raw]) => BRANCH_IDS.includes(id) && typeof raw === 'number' && raw !== 0)
    .sort((a, b) => BRANCH_IDS.indexOf(a[0]) - BRANCH_IDS.indexOf(b[0]))
    .map(([id, raw]) => ({ id, label: BRANCHES[id].nameRu, value: rawBonusText(id, raw), raw }));
}

function diffItemSubstatBonuses(
  next: Item,
  prev: Item | undefined,
): { id: BranchId; label: string; from: string; to: string; delta: number; deltaText: string }[] {
  const ids = new Set<BranchId>();
  for (const [id, raw] of Object.entries(next.substatBonuses ?? {}) as [BranchId, number][]) {
    if (BRANCH_IDS.includes(id) && typeof raw === 'number' && raw !== 0) ids.add(id);
  }
  for (const [id, raw] of Object.entries(prev?.substatBonuses ?? {}) as [BranchId, number][]) {
    if (BRANCH_IDS.includes(id) && typeof raw === 'number' && raw !== 0) ids.add(id);
  }
  return [...ids]
    .sort((a, b) => BRANCH_IDS.indexOf(a) - BRANCH_IDS.indexOf(b))
    .map((id) => {
      const to = next.substatBonuses?.[id] ?? 0;
      const from = prev?.substatBonuses?.[id] ?? 0;
      const delta = to - from;
      return {
        id,
        label: BRANCHES[id].nameRu,
        from: rawBonusText(id, from),
        to: rawBonusText(id, to),
        delta,
        deltaText: rawBonusText(id, delta),
      };
    })
    .filter((row) => row.delta !== 0);
}

function isTwoHanded(itemId: string | null): boolean {
  return Boolean(itemId && getItem(itemId)?.twoHanded);
}

function slotVisual(itemId: string | null, slot: EquipSlot) {
  const visual = itemId ? getItemVisual(itemId) : null;
  return {
    src: visual?.type === 'image' ? visual.value : itemId ? undefined : EQUIP_SLOT_ICON[slot],
    emoji: visual?.type === 'emoji' ? visual.value : undefined,
  };
}

export function HeroHubPage() {
  const [, navigate] = useLocation();
  const isGuest = useAuthStore(s => s.isGuest);
  const active = useCharacterStore(s => s.activeCharacter);
  const equipment = usePlayerStore(s => s.equipment);
  const [moduleId, setModuleId] = useState<HubModule>('body');
  const [detail, setDetail] = useState<Detail | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [tick, setTick] = useState(0);

  const raceId: RaceId = active?.raceId ?? 'human';
  // Зависим от объекта active, а не только active.id: админ-сохранение
  // заменяет activeCharacter в characterStore, и после этого числа на экране
  // должны перечитаться из getLiveAttributes() (например, сохранённые из админки).
  const state = useMemo(() => getLiveAttributes(), [active, tick]);
  const snapshot = useMemo(
    () => computeAttributeSnapshot({ state, raceId }),
    [state, raceId],
  );

  // Складываем экип с телом: финальный блок 12 статов = столпы/ветви + экип.
  const gearTotals = useMemo(
    () => sumEquipmentBonuses(equipment, getItem).totals,
    [equipment],
  );
  const displaySnapshot = useMemo(() => {
    if (!snapshot) return snapshot;
    const substats = foldBonusesIntoRaw(snapshot.substats, gearTotals);
    return {
      ...snapshot,
      substats,
      substatDisplays: computeSubstatDisplays(substats),
    };
  }, [snapshot, gearTotals]);

  const applyState = (next: typeof state | null) => {
    if (!next) return;
    commitHeroAttributes(next);
    setTick(n => n + 1);
  };

  if (isGuest || !active) {
    return (
      <div className="hero-hub hero-hub--empty">
        <GEmptyState
          icon="🪞"
          title="Герой на аккаунте"
          description="Войди — числа тела будут здесь."
          action={{ label: 'К огню таверны', onClick: () => navigate('/login') }}
        />
      </div>
    );
  }

  return (
    <section className="hero-hub" aria-label="Герой">
      <header className="hero-hub__header">
        <div className="hero-hub__portrait">
          <GAvatar src={getAvatarPath(active.avatarId)} size={PORTRAIT} glow />
        </div>
        <div className="hero-hub__identity">
          <div className="hero-hub__name-row">
            <strong>{active.nickname}</strong>
            <span className="hero-level" title={`Уровень ${state.heroLevel}`}>
              {state.heroLevel}
            </span>
          </div>
          <span className="hero-chip">{getRaceLabel(raceId, 'ru')}</span>
        </div>
        <div
          className="hero-hub__xp"
          aria-label="Опыт до следующего уровня"
          title={xpToNextLevel(state.heroLevel) > 0
            ? `${Math.floor(state.heroXp)} / ${xpToNextLevel(state.heroLevel)}`
            : 'Максимум'}
        >
          <span>опыт</span>
          <GProgressBar
            value={xpToNextLevel(state.heroLevel) > 0
              ? Math.min(1, state.heroXp / xpToNextLevel(state.heroLevel))
              : 1}
            height={8}
            style={{ flex: 1 }}
          />
        </div>
        <div className="hero-hub__points" aria-label="Свободные очки">
          <span
            className="hero-point"
            data-ready={state.unspentPillarPoints > 0 ? 'true' : 'false'}
            title={`Очки столпов (каждый уровень): ${state.unspentPillarPoints}`}
          >
            <img src={HUB_NAV_ICON.body} alt="" decoding="async" />
            <b>{state.unspentPillarPoints}</b>
          </span>
          <span
            className="hero-point"
            data-ready={state.unspentBranchPoints > 0 ? 'true' : 'false'}
            title={`Очки пассивок (каждые 5 уровней): ${state.unspentBranchPoints}`}
          >
            <img src={HUB_NAV_ICON.branches} alt="" decoding="async" />
            <b>{state.unspentBranchPoints}</b>
          </span>
        </div>
        <button
          type="button"
          className="hero-hub__gear"
          title="Настройки персонажа"
          aria-label="Настройки персонажа"
          onClick={() => setSettingsOpen(true)}
        >
          ⚙
        </button>
      </header>

      <nav className="hero-hub__tabs" aria-label="Разделы героя">
        <ATabs
          tabs={MODULES.map((mod) => ({ id: mod.id, label: mod.label }))}
          activeId={moduleId}
          onChange={(id) => setModuleId(id as HubModule)}
          ariaLabel="Разделы героя"
        />
      </nav>

      <div className="hero-hub__panel">
        <button
          type="button"
          className="hero-info hero-info--pane"
          title="Об этом окне"
          aria-label="Об этом окне"
          onClick={() => setHelpOpen(true)}
        >
          i
        </button>
        {moduleId === 'body' && (
          <BodyModule
            snapshot={snapshot}
            canSpendBranch={state.unspentBranchPoints > 0}
            onOpenPillar={id => setDetail({ kind: 'pillar', id })}
            onOpenNode={ref => setDetail(
              ref.kind === 'branch'
                ? { kind: 'branch', id: ref.id }
                : { kind: 'passive', id: ref.id },
            )}
          />
        )}
        {moduleId === 'gear' && (
          <GearModule
            equipment={equipment}
            avatarId={active.avatarId}
            snapshot={snapshot}
            onGearSetsChanged={() => setTick(n => n + 1)}
          />
        )}
        {moduleId === 'synergies' && (
          <SynergiesModule
            snapshot={snapshot}
            onOpen={id => setDetail({ kind: 'synergy', id })}
          />
        )}
        {moduleId === 'path' && (
          <PathModule
            bodySnapshot={snapshot}
            finalSnapshot={displaySnapshot}
            gearTotals={gearTotals}
          />
        )}
      </div>

      <GModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title={MODULES.find(mod => mod.id === moduleId)?.label ?? ''}
        width={320}
      >
        <p className="hero-hint">{HERO_HELP[moduleId]}</p>
      </GModal>

      <HeroSettingsModal
        open={settingsOpen}
        state={state}
        onClose={() => setSettingsOpen(false)}
        onRespecPillars={() => applyState(respecPillarRanks(state))}
        onRespecBranches={() => applyState(respecBranchRanks(state))}
      />

      <HeroDetailModal
        detail={detail}
        snapshot={snapshot}
        equipment={equipment}
        canSpendPillar={state.unspentPillarPoints > 0}
        onClose={() => setDetail(null)}
        onSpendPillar={id => applyState(spendPillarPoint(state, id))}
        onSpendNode={ref => applyState(spendBranchPoint(state, ref))}
      />
    </section>
  );
}

function BodyModule({
  snapshot, canSpendBranch, onOpenPillar, onOpenNode,
}: {
  snapshot: ReturnType<typeof computeAttributeSnapshot>;
  canSpendBranch: boolean;
  onOpenPillar: (id: PillarId) => void;
  onOpenNode: (ref: NodeRef) => void;
}) {
  return (
    <HeroBoard
      snapshot={snapshot}
      canSpendBranch={canSpendBranch}
      onOpenPillar={onOpenPillar}
      onOpenNode={onOpenNode}
    />
  );
}

function GearModule({
  equipment, avatarId, snapshot, onGearSetsChanged,
}: {
  equipment: Equipment;
  avatarId: string;
  snapshot: ReturnType<typeof computeAttributeSnapshot>;
  onGearSetsChanged: () => void;
}) {
  const inventoryItems = useInventoryStore(s => s.items);
  const notifyInfo = useNotificationsStore(s => s.notifyInfo);
  const [filter, setFilter] = useState<BagFilter>('all');
  const [page, setPage] = useState(0);
  const [saveOpen, setSaveOpen] = useState(false);
  const [activeSetIndex, setActiveSetIndex] = useState<number | null>(null);
  const [selectedModalItemId, setSelectedModalItemId] = useState<string | null>(null);
  const [selectedBagItemId, setSelectedBagItemId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<EquipSlot | 'locked' | null>(null);

  const presets = getLiveGearSets().presets;
  const twoHand = isTwoHanded(equipment.weapon);

  // Реальный вклад экипа в 12 подхарактеристик (мост domain/attributes/equipmentSubstats).
  const gearTotals = useMemo(() => sumEquipmentBonuses(equipment, getItem).totals, [equipment]);
  const equipBonusLines = useMemo(() => {
    const combRaw = foldBonusesIntoRaw(snapshot.substats, gearTotals);
    const combDisplays = computeSubstatDisplays(combRaw);
    const lines: { id: BranchId; label: string; text: string; unit: string; title?: string }[] = [];
    for (const id of BRANCH_IDS) {
      const added = gearTotals[id];
      if (!added) continue;
      const comb = combDisplays[id];
      const base = snapshot.substatDisplays[id];
      const delta = comb.value - base.value;
      // Удар — «промежуточный урон» (gear.ts): плоское число не показываем,
      // только итоговый диапазон ±15% — как на листах «Тело»/«Путь».
      // Прибавка от снаряжения остаётся в подсказке ячейки.
      const text = id === 'strike'
        ? formatStrikeRange(combRaw.strike)
        : gearBonusText(delta, comb.unit);
      const title = id === 'strike'
        ? `Промежуточный урон: итог Удара со снаряжением, диапазон ±15% (от экипа ${gearBonusText(delta, comb.unit)})`
        : undefined;
      lines.push({ id, label: BRANCHES[id].nameRu, text, unit: comb.unit, title });
    }
    return lines;
  }, [snapshot, gearTotals]);

  const saveSet = (index: number) => {
    const next = saveGearSet(index);
    if (!next) return;
    commitGearSets(next);
    setActiveSetIndex(index);
    onGearSetsChanged();
    setSaveOpen(false);
  };

  const loadSet = (index: number) => {
    const result = loadGearSet(index);
    if (!result.ok) {
      if (result.reason === 'bag-full') {
        notifyInfo('Сумка заполнена — освободите места');
      }
      return;
    }
    setActiveSetIndex(index);
    onGearSetsChanged();
  };

  const handleFilterChange = (f: BagFilter) => {
    setFilter(f);
    setPage(0);
  };

  const handleEquipSlotClick = (slot: EquipSlot | 'locked') => {
    if (slot === 'locked') return;
    setSelectedSlot(slot);
    setSelectedBagItemId(null);
    const ghostLeft = slot === 'shield' && twoHand;
    const itemId = ghostLeft ? equipment.weapon : equipment[slot];
    if (itemId) {
      setSelectedModalItemId(itemId);
    } else {
      // Empty slot: filter mini-bag to relevant category
      if (['weapon', 'shield', 'quiver'].includes(slot)) {
        setFilter('weapon');
      } else if (['amulet', 'ring', 'ring2', 'bracelet', 'bracelet2', 'passive'].includes(slot)) {
        setFilter('jewel');
      } else {
        setFilter('armor');
      }
      setPage(0);
    }
  };

  const handleBagItemClick = (item: Item, equipSlot: EquipSlot) => {
    setSelectedBagItemId(item.id);
    setSelectedSlot(equipSlot);
    setSelectedModalItemId(item.id);
  };

  const bagItems = useMemo(() => {
    const out: {
      slot: { itemId: string; quantity: number };
      item: Item;
      equipSlot: EquipSlot;
    }[] = [];
    for (const s of inventoryItems) {
      if (s.quantity <= 0) continue;
      const item = getItem(s.itemId);
      const equipSlot = item?.equipSlot;
      if (!item || !equipSlot) continue;
      const itemFilter = bagFilterOf(item);
      if (filter !== 'all' && itemFilter !== filter) continue;
      out.push({ slot: { itemId: s.itemId, quantity: s.quantity }, item, equipSlot });
    }
    return out;
  }, [inventoryItems, filter]);

  const BAG_PAGE_SIZE = 14;
  const totalPages = Math.max(1, Math.ceil(bagItems.length / BAG_PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const visibleBagItems = bagItems.slice(safePage * BAG_PAGE_SIZE, (safePage + 1) * BAG_PAGE_SIZE);
  const emptyPlaceholders = Math.max(0, BAG_PAGE_SIZE - visibleBagItems.length);

  const handleEmptyBagSlotClick = () => {
    setSelectedBagItemId(null);
  };

  return (
    <div className="hero-sheet hero-gear2">
      {/* 1. Верхняя панель: Наборы слева, Заголовок в центре, Фильтры справа */}
      <div className="hero-gear2__header-bar">
        {/* Пресеты экипировки */}
        <div className="hero-gear2__presets-box">
          <div className="hero-gear2__preset-pills" role="tablist" aria-label="Наборы экипировки">
            {presets.map((preset, i) => (
              <button
                key={i}
                type="button"
                className={`hero-gear2__preset-pill ${activeSetIndex === i ? 'is-active' : ''} ${preset ? 'is-saved' : ''}`}
                title={preset ? `Надеть: ${preset.name}` : `Набор ${i + 1} (пуст)`}
                onClick={() => loadSet(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="hero-gear2__save-btn"
              aria-expanded={saveOpen}
              title="Сохранить текущую экипировку в набор"
              onClick={() => setSaveOpen(v => !v)}
            >
              <Save className="w-3.5 h-3.5" />
            </button>
            {saveOpen && (
              <div className="hero-gear2__sets-choose" role="menu">
                <span className="hero-gear2__sets-choose-title">Сохранить в:</span>
                {presets.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className="hero-set-opt"
                    onClick={() => saveSet(i)}
                  >
                    Набор {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Центр: заголовок */}
        <div className="hero-gear2__center-title">
          <span>Снаряжение</span>
        </div>

        {/* Фильтры мини-сумки */}
        <div className="hero-gear2__bag-controls">
          <div className="hero-gear2__filter-pills" role="tablist" aria-label="Фильтр предметов">
            {BAG_FILTERS.map(f => {
              const IconComp = f.icon;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.id}
                  className={`hero-gear2__filter-chip ${filter === f.id ? 'is-active' : ''}`}
                  title={f.label}
                  onClick={() => handleFilterChange(f.id)}
                >
                  <IconComp className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="hero-gear2__pager">
              <button
                type="button"
                disabled={safePage === 0}
                className="hero-gear2__pager-btn"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                title="Назад"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span>{safePage + 1}/{totalPages}</span>
              <button
                type="button"
                disabled={safePage >= totalPages - 1}
                className="hero-gear2__pager-btn"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                title="Вперёд"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Основной блок: Слева (2×7 надетых) | Центр (Манекен) | Справа (2×7 мини-сумка) */}
      <div className="hero-gear2__main">
        {/* Слева: 14 слотов надетых вещей (2 колонки по 7) */}
        <div className="hero-gear2__slots-col" role="group" aria-label="Надетая экипировка">
          <div className="hero-gear2__grid-7">
            {GEAR_LEFT_COL1.map(def => {
              const ghostLeft = def.slot === 'shield' && twoHand;
              const itemId = ghostLeft ? equipment.weapon : def.slot !== 'locked' ? equipment[def.slot] : null;
              const isSelected = selectedSlot === def.slot || (Boolean(itemId) && (selectedModalItemId === itemId || selectedBagItemId === itemId));
              const isMatchingTarget = Boolean(
                selectedBagItemId && def.slot !== 'locked' && (
                  selectedSlot === def.slot ||
                  (selectedSlot === 'ring' && (def.slot === 'ring' || def.slot === 'ring2')) ||
                  (selectedSlot === 'bracelet' && (def.slot === 'bracelet' || def.slot === 'bracelet2'))
                )
              );
              return (
                <HeroEquipSlotCard
                  key={def.slot}
                  slotDef={def}
                  equipment={equipment}
                  twoHand={twoHand}
                  isSelected={isSelected}
                  isMatchingTarget={isMatchingTarget}
                  onOpen={handleEquipSlotClick}
                />
              );
            })}
          </div>
          <div className="hero-gear2__grid-7">
            {GEAR_LEFT_COL2.map(def => {
              const ghostLeft = def.slot === 'shield' && twoHand;
              const itemId = ghostLeft ? equipment.weapon : def.slot !== 'locked' ? equipment[def.slot] : null;
              const isSelected = selectedSlot === def.slot || (Boolean(itemId) && (selectedModalItemId === itemId || selectedBagItemId === itemId));
              const isMatchingTarget = Boolean(
                selectedBagItemId && def.slot !== 'locked' && (
                  selectedSlot === def.slot ||
                  (selectedSlot === 'ring' && (def.slot === 'ring' || def.slot === 'ring2')) ||
                  (selectedSlot === 'bracelet' && (def.slot === 'bracelet' || def.slot === 'bracelet2'))
                )
              );
              return (
                <HeroEquipSlotCard
                  key={def.slot}
                  slotDef={def}
                  equipment={equipment}
                  twoHand={twoHand}
                  isSelected={isSelected}
                  isMatchingTarget={isMatchingTarget}
                  onOpen={handleEquipSlotClick}
                />
              );
            })}
          </div>
        </div>

        {/* Центр: Манекен героя */}
        <div className="hero-gear2__center">
          <div className="hero-gear2__doll">
            <img
              src={getDollPath(avatarId)}
              srcSet={`${getDollPath(avatarId)} 1x, ${getDollPath2x(avatarId)} 2x`}
              alt="Манекен героя"
              decoding="async"
            />
            <div className="hero-gear2__pedestal" />
          </div>
        </div>

        {/* Справа: Мини-инвентарь (2 колонки по 7) */}
        <div className="hero-gear2__inv-col" role="group" aria-label="Мини-инвентарь">
          <div className="hero-gear2__inv-grid">
            {visibleBagItems.map(({ slot, item, equipSlot }) => {
              const isSelected = selectedBagItemId === item.id || selectedModalItemId === item.id;
              const isCompatible = Boolean(selectedSlot && selectedSlot !== 'locked' && (
                equipSlot === selectedSlot ||
                (selectedSlot === 'shield' && (equipSlot === 'shield' || equipSlot === 'quiver')) ||
                ((selectedSlot === 'ring' || selectedSlot === 'ring2') && (equipSlot === 'ring' || equipSlot === 'ring2')) ||
                ((selectedSlot === 'bracelet' || selectedSlot === 'bracelet2') && (equipSlot === 'bracelet' || equipSlot === 'bracelet2'))
              ));
              return (
                <HeroBagSlotCard
                  key={slot.itemId}
                  slot={slot}
                  item={item}
                  equipSlot={equipSlot}
                  isSelected={isSelected}
                  isCompatible={isCompatible}
                  onOpen={handleBagItemClick}
                />
              );
            })}
            {Array.from({ length: emptyPlaceholders }).map((_, idx) => (
              <HeroBagSlotCard
                key={`empty-${idx}`}
                isSelected={selectedBagItemId === `empty-${idx}`}
                onEmptyClick={() => {
                  setSelectedBagItemId(`empty-${idx}`);
                  setSelectedSlot(null);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Снизу: Общие характеристики бонусов от экипировки */}
      <div className="hero-gear2__stats-bar">
        <div className="hero-gear2__stats-title">
          <div className="flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            <span>Бонусы снаряжения</span>
          </div>
        </div>
        <div className="hero-gear2__stats-grid">
          {equipBonusLines.length === 0 ? (
            <div className="hero-gear2__stats-note">
              Экип не даёт бонусов — надень предмет с характеристиками.
            </div>
          ) : (
            equipBonusLines.map(s => (
              <div key={s.id} className="hero-gear2__stat-card" title={s.title}>
                <div className="hero-gear2__stat-meta">
                  <span className="hero-gear2__stat-label">{s.label}</span>
                </div>
                <span className="hero-gear2__stat-val">{s.text}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Универсальное модальное окно информации и экипировки */}
      {selectedModalItemId && (
        <UniversalInfoModal
          itemId={selectedModalItemId}
          onClose={() => {
            setSelectedModalItemId(null);
          }}
        />
      )}
    </div>
  );
}

function HeroEquipSlotCard({
  slotDef, equipment, twoHand, isSelected, isMatchingTarget, onOpen,
}: {
  slotDef: EquipSlotDef;
  equipment: Equipment;
  twoHand: boolean;
  isSelected: boolean;
  isMatchingTarget?: boolean;
  onOpen: (slot: EquipSlot | 'locked') => void;
}) {
  if (slotDef.locked) {
    return (
      <ItemCell
        compact
        locked
        silhouette="locked"
        selected={isSelected}
        title="Скоро — будущий слот"
        onClick={() => onOpen('locked')}
      />
    );
  }

  const slot = slotDef.slot as EquipSlot;
  const ghostLeft = slot === 'shield' && twoHand;
  const itemId = ghostLeft ? equipment.weapon : equipment[slot];
  const item = itemId ? getItem(itemId) : undefined;

  if (!itemId || !item) {
    return (
      <ItemCell
        compact
        silhouette={slot}
        selected={isSelected}
        matchingTarget={isMatchingTarget}
        title={`Надеть: ${slotDef.label}`}
        onClick={() => onOpen(slot)}
      />
    );
  }

  return (
    <ItemCell
        compact
      item={item}
      dimmed={ghostLeft}
      selected={isSelected}
      matchingTarget={isMatchingTarget}
      title={ghostLeft ? `${slotDef.label} · двуручное` : `${item.name} (${slotDef.label})`}
      onClick={() => onOpen(ghostLeft ? 'weapon' : slot)}
    />
  );
}

function HeroBagSlotCard({
  slot, item, equipSlot, isSelected, isCompatible, onOpen, onEmptyClick,
}: {
  slot?: { itemId: string; quantity: number };
  item?: Item;
  equipSlot?: EquipSlot;
  isSelected?: boolean;
  isCompatible?: boolean;
  onOpen?: (item: Item, equipSlot: EquipSlot) => void;
  onEmptyClick?: () => void;
}) {
  if (!slot || !item || !equipSlot) {
    return (
      <ItemCell
        compact
        empty
        selected={isSelected}
        title="Пустая ячейка"
        onClick={onEmptyClick}
      />
    );
  }

  return (
    <ItemCell
        compact
      item={item}
      quantity={slot.quantity}
      selected={isSelected}
      compatible={isCompatible}
      title={`${item.name} · ${GEAR_LABEL[equipSlot] ?? equipSlot}`}
      onClick={() => onOpen?.(item, equipSlot)}
    />
  );
}

/* ── Нити · «Пульт» — плотная сетка 3×N ──────────────────────────────
   Карточка: крупная иконка-плитка (главное), под ней имя и тонкая полоса %.
   Шапка: «чернила по пергаменту» — заголовок + плитки столпов.
   Отсеки «Активные/Неактивные»; активные подсвечены, неактивные затемнены.
   Все 21 нить настоящие: 6 пар столпов x 3 яруса + 3 тройные.
   Палитра — только токены index.css (пергамент/тёмное дерево/каштан/золото/Cinzel).
────────────────────────────────────────────────────────────────────── */

function synergyReqs(s: SynergyDef): [PillarId, number][] {
  return Object.entries(s.requires) as [PillarId, number][];
}

/** Готовность по «узкому месту»: минимум из долей have/need по столпам. */
function synergyReadiness(s: SynergyDef, pillars: Record<PillarId, number>): number {
  const ratios = synergyReqs(s).map(([id, need]) => (need > 0 ? Math.min(1, pillars[id] / need) : 1));
  return ratios.length ? Math.min(...ratios) : 1;
}

/** Сколько очков столпов суммарно не хватает до открытия нити. */
function synergyDeficit(s: SynergyDef, pillars: Record<PillarId, number>): number {
  return synergyReqs(s).reduce((sum, [id, need]) => sum + Math.max(0, need - pillars[id]), 0);
}

/** «Ярус» нити — по верхнему порогу пары (50/30 → ниже, 70/40 → выше). */
function synergyRank(s: SynergyDef): number {
  const needs = synergyReqs(s).map(([, need]) => need);
  return needs.length ? Math.max(...needs) : 0;
}

function ThreadCard({
  icon, name, ratio, on, onOpen,
}: {
  icon: string;
  name: string;
  ratio: number;
  on: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className="hero-thread-card"
      data-on={on ? 'true' : 'false'}
      onClick={onOpen}
    >
      <span className="hero-thread-card__tile">
        <img className="hero-thread-card__icon" src={icon} alt="" decoding="async" />
      </span>
      <span className="hero-thread-card__foot">
        <span className="hero-thread-card__name">{name}</span>
        <span className="hero-thread-card__bar">
          <GProgressBar value={on ? 1 : ratio} height={4} style={{ flex: 1 }} />
          <em>{on ? '100%' : `${Math.round(ratio * 100)}%`}</em>
        </span>
      </span>
    </button>
  );
}

function SynergiesModule({
  snapshot, onOpen,
}: {
  snapshot: ReturnType<typeof computeAttributeSnapshot>;
  onOpen: (id: SynergyId) => void;
}) {
  const [tab, setTab] = useState<'active' | 'inactive'>('inactive');
  const pillars = snapshot.finalPillars;

  const active = SYNERGIES
    .filter(s => snapshot.activeSynergies.includes(s.id))
    .slice()
    .sort((a, b) => synergyRank(a) - synergyRank(b) || a.nameRu.localeCompare(b.nameRu, 'ru'));

  // Неактивные — ближайшие к открытию сверху (меньше всего очков не хватает).
  const sleeping = SYNERGIES
    .filter(s => !snapshot.activeSynergies.includes(s.id))
    .slice()
    .sort((a, b) => synergyDeficit(a, pillars) - synergyDeficit(b, pillars)
      || a.nameRu.localeCompare(b.nameRu, 'ru'));

  return (
    <div className="hero-sheet">
      <div className="hero-thread-summary">
        <div className="hero-thread-summary__l">
          <span className="hero-thread-summary__title"><i>✦</i> Нити</span>
          <span className="hero-thread-summary__sub">правило за пару столпов</span>
        </div>
        <div className="hero-thread-summary__pillars">
          {PILLAR_IDS.map(id => (
            <span key={id} className="hero-thread-summary__pill">
              <img src={PILLAR_ICON[id]} alt="" decoding="async" />
              <span className="hero-thread-summary__pillnum">{Math.round(pillars[id])}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="hero-thread-tabs" role="tablist" aria-label="Отсеки нитей">
        <button
          type="button"
          className={tab === 'active' ? 'is-on' : ''}
          aria-pressed={tab === 'active'}
          onClick={() => setTab('active')}
        >
          Активные <b>· {active.length}</b>
        </button>
        <button
          type="button"
          className={tab === 'inactive' ? 'is-on' : ''}
          aria-pressed={tab === 'inactive'}
          onClick={() => setTab('inactive')}
        >
          Неактивные <b>· {sleeping.length}</b>
        </button>
      </div>

      {tab === 'active' ? (
        active.length === 0 ? (
          <GEmptyState
            icon="✦"
            title="Нет активных нитей"
            description="Нить включается, когда итоговые очки столпов доходят до порога пары. Ярус I: 15/10."
          />
        ) : (
          <div className="hero-thread-grid">
            {active.map(s => (
              <ThreadCard
                key={s.id}
                icon={SYNERGY_ICON[s.id]}
                name={s.nameRu}
                ratio={1}
                on
                onOpen={() => onOpen(s.id)}
              />
            ))}
          </div>
        )
      ) : (
        <div className="hero-thread-grid">
          {sleeping.map(s => (
            <ThreadCard
              key={s.id}
              icon={SYNERGY_ICON[s.id]}
              name={s.nameRu}
              ratio={synergyReadiness(s, pillars)}
              on={false}
              onOpen={() => onOpen(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PathModule({
  bodySnapshot,
  finalSnapshot,
  gearTotals,
}: {
  bodySnapshot: ReturnType<typeof computeAttributeSnapshot>;
  finalSnapshot: ReturnType<typeof computeAttributeSnapshot>;
  gearTotals: Record<BranchId, number>;
}) {
  const d = finalSnapshot.substatDisplays;
  const plaqueLabel: Record<BranchId, string> = {
    health: 'HP',
    armor: 'Броня',
    will: 'Воля',
    strike: 'Урон',
    onslaught: 'Натиск',
    destruction: 'Пробой',
    tempo: 'Темп',
    evasion: 'Уворот',
    reaction: 'Руки',
    luck: 'Удача',
    resourcefulness: 'Находка',
    intuition: 'Опыт',
  };
  const plaques = PATH_PLAQUE_SUBSTATS.map((id) => ({
    id,
    label: plaqueLabel[id],
    value: id === 'strike'
      ? formatStrikeRange(finalSnapshot.substats.strike)
      : formatSubstat(d[id]),
  }));

  const sourceText = (id: BranchId): string => {
    const body = bodySnapshot.substatDisplays[id];
    const final = finalSnapshot.substatDisplays[id];
    const equipRaw = gearTotals[id] ?? 0;
    const equipDelta = final.value - body.value;
    const bodyPart = id === 'strike'
      ? `тело ${formatStrikeRange(bodySnapshot.substats.strike)}`
      : `тело ${formatSubstat(body)}`;
    const equipPart = equipRaw === 0
      ? 'экип 0'
      : id === 'strike'
        ? `экип ${rawBonusText(id, equipRaw)}`
        : `экип ${gearBonusText(equipDelta, final.unit)}`;
    return `${bodyPart} · ${equipPart}`;
  };

  return (
    <div className="hero-sheet">
      <div className="hero-readout" aria-label="Главные итоговые числа героя">
        {plaques.map(plaque => (
          <div
            key={plaque.id}
            className="hero-plaque"
            title={plaque.id === 'strike'
              ? 'Итоговый диапазон урона: тело + снаряжение, разброс ±15% от Удара.'
              : BRANCHES[plaque.id].ruleRu}
          >
            <span className="hero-plaque__label">{plaque.label}</span>
            <b className="hero-plaque__value">{plaque.value}</b>
          </div>
        ))}
      </div>
      <p className="hero-path-summary">
        Путь = тело + экип. Нити и глубинные пассивки пока не прибавляются к числам.
      </p>
      <div className="hero-path-more" aria-label="Итоговые характеристики по столпам">
        {PATH_SHEET_BY_PILLAR.map(group => (
          <section
            key={group.pillar}
            className="hero-path-pillar"
            data-pillar={group.pillar}
          >
            <header className="hero-path-pillar__head">
              <img src={PILLAR_ICON[group.pillar]} alt="" decoding="async" />
              <span>{PILLARS[group.pillar].nameRu}</span>
              <b>тело {Math.round(bodySnapshot.finalPillars[group.pillar])}</b>
            </header>
            {group.stats.map(id => {
              const value = id === 'strike'
                ? formatStrikeRange(finalSnapshot.substats.strike)
                : formatSubstat(d[id]);
              const equipRaw = gearTotals[id] ?? 0;
              return (
                <div key={id} className="hero-path-more__row" title={SUBSTATS[id].ruleRu}>
                  <div className="hero-path-more__row-main">
                    <span>{SUBSTATS[id].nameRu}</span>
                    <b>{value}</b>
                  </div>
                  <small className="hero-path-more__source" data-zero={equipRaw === 0 ? 'true' : 'false'}>
                    {sourceText(id)}
                  </small>
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}

function HeroDetailModal({
  detail, snapshot, equipment,
  canSpendPillar,
  onClose, onSpendPillar, onSpendNode,
}: {
  detail: Detail | null;
  snapshot: ReturnType<typeof computeAttributeSnapshot>;
  equipment: Equipment;
  canSpendPillar: boolean;
  onClose: () => void;
  onSpendPillar: (id: PillarId) => void;
  onSpendNode: (ref: NodeRef) => void;
}) {
  const unequip = usePlayerStore(s => s.unequipItem);
  const bagDetailItem = detail?.kind === 'bag-item' ? getItem(detail.itemId) : undefined;
  const title = !detail
    ? ''
    : detail.kind === 'pillar' ? PILLARS[detail.id].nameRu
      : detail.kind === 'branch' ? BRANCHES[detail.id].nameRu
        : detail.kind === 'passive' ? DEEP_PASSIVES[detail.id].nameRu
          : detail.kind === 'synergy' ? (SYNERGIES.find(s => s.id === detail.id)?.nameRu ?? '')
              : detail.kind === 'bag-item' ? (bagDetailItem?.name ?? '')
              : detail.kind === 'locked-slot' ? 'Будущий слот'
                : GEAR_LABEL[detail.slot];

  const gearItemId = detail?.kind === 'gear' ? equipment[detail.slot] : null;
  const gearItem = gearItemId ? getItem(gearItemId) : undefined;
  const twoHand = detail?.kind === 'gear' && detail.slot === 'weapon' && isTwoHanded(gearItemId);

  const handleUnequip = () => {
    if (!detail || detail.kind !== 'gear' || !gearItemId) return;
    const removed = unequip(detail.slot);
    if (removed) {
      useNotificationsStore.getState().notifyInfo(`Снято в сумку: ${gearItem?.name ?? ''}`);
      onClose();
    }
  };

  return (
    <GModal
      open={Boolean(detail)}
      onClose={onClose}
      title={title}
      width={detail?.kind === 'bag-item' || detail?.kind === 'branch' || detail?.kind === 'passive' || detail?.kind === 'pillar' || detail?.kind === 'synergy' ? 320 : 280}
    >
      {detail?.kind === 'locked-slot' && (
        <div className="hero-hub-modal hero-hub-modal--card" style={{ textAlign: 'center', padding: '12px 6px' }}>
          <span style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>🔒</span>
          <strong style={{ fontSize: 14, color: 'var(--text-gold)', display: 'block', fontFamily: 'var(--app-font-display)' }}>
            Будущий контент
          </strong>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 14px', lineHeight: 1.4 }}>
            Этот слот снаряжения станет доступен в следующих обновлениях мира Aethelia.
          </p>
          <GButton size="sm" fullWidth variant="secondary" onClick={onClose}>
            Понятно
          </GButton>
        </div>
      )}
      {detail?.kind === 'pillar' && (() => {
        const into = snapshot.state.pillarRanks[detail.id];
        const raceN = shownStat(snapshot.racialImprint[detail.id]);
        const jobN = shownStat(snapshot.professionBonus[detail.id]);
        const total = shownStat(snapshot.finalPillars[detail.id]);
        return (
          <div className="hero-hub-modal hero-hub-modal--card">
            <p className="hero-rule">{PILLARS[detail.id].ruleRu}</p>
            <GInfoRow label="Итого" value={String(total)} />
            <GInfoRow label="Раса" value={signedStat(raceN)} />
            <GInfoRow label="Вложил" value={signedStat(into)} />
            {jobN !== 0 && <GInfoRow label="Ремесло" value={signedStat(jobN)} />}
            {SUBSTATS_BY_PILLAR[detail.id].map(id => (
              <GInfoRow
                key={id}
                label={SUBSTATS[id].nameRu}
                value={formatSubstat(snapshot.substatDisplays[id])}
              />
            ))}
            <GButton
              size="sm"
              fullWidth
              disabled={!canSpendPillar}
              onClick={() => onSpendPillar(detail.id)}
            >
              {canSpendPillar ? 'Положить очко' : 'Очков столпа нет'}
            </GButton>
          </div>
        );
      })()}
      {(detail?.kind === 'branch' || detail?.kind === 'passive') && (() => {
        const ref: NodeRef = detail.kind === 'branch'
          ? { kind: 'branch', id: detail.id }
          : { kind: 'passive', id: detail.id };
        const info = detail.kind === 'branch' ? BRANCHES[detail.id] : DEEP_PASSIVES[detail.id];
        const rank = nodeRank(snapshot.state, ref);
        const blocked = nodeBlockReason(snapshot.state, ref);
        const branchFx = detail.kind === 'branch' ? BRANCH_EFFECTS[detail.id] : null;
        return (
          <div className="hero-hub-modal hero-hub-modal--card">
            <p className="hero-rule">{info.ruleRu}</p>
            <GInfoRow label="Ранг" value={`${rank} из ${NODE_RANK_CAP}`} />
            {detail.kind === 'branch' && (
              <>
                <GInfoRow
                  label="К телу"
                  value={`+${rank * BRANCH_RANK_IN_PILLAR_POINTS} оч. столпа к числу`}
                />
                {branchFx && (
                  <>
                    <p className="hero-rule">{branchFx.nameRu}. {branchFx.ruleRu}</p>
                    <GInfoRow label="На 3 ранге" value={branchFx.atMaxRu} />
                  </>
                )}
                <p className="hero-rule hero-rule--status">Число тела уже растёт. Выгода idle — не действует.</p>
              </>
            )}
            {detail.kind === 'passive' && (
              <p className="hero-rule hero-rule--status">Не действует: бой и idle не читают этот узел.</p>
            )}
            <GButton
              size="sm"
              fullWidth
              disabled={Boolean(blocked)}
              onClick={() => onSpendNode(ref)}
            >
              {blocked ?? 'Положить очко узла'}
            </GButton>
          </div>
        );
      })()}
      {detail?.kind === 'synergy' && (() => {
        const synergy = SYNERGIES.find(s => s.id === detail.id);
        if (!synergy) return null;
        const on = snapshot.activeSynergies.includes(synergy.id);
        const reqs = synergyReqs(synergy);
        const missing = reqs
          .filter(([id, need]) => snapshot.finalPillars[id] < need)
          .map(([id, need]) => [id, Math.ceil(need - snapshot.finalPillars[id])] as const);
        return (
          <div className="hero-thread-detail">
            <div className="hero-thread-detail__head">
              <img src={SYNERGY_ICON[synergy.id]} alt="" decoding="async" />
              <b>{synergy.nameRu}</b>
              <GBadge variant={on ? 'gold' : 'gray'} size="sm">
                {on ? 'порог закрыт' : 'порог не закрыт'}
              </GBadge>
            </div>
            <GInfoRow label="Ярус" value={['', 'I', 'II', 'III'][synergy.tier] ?? String(synergy.tier)} />
            <div className="hero-thread-detail__block">
              <span className="hero-thread-detail__lbl">правило</span>
              <p className="hero-thread-detail__fx">{synergy.effectRu}</p>
              <p className="hero-rule hero-rule--status">Не действует: бой и idle нить не применяют.</p>
            </div>
            <div className="hero-thread-detail__block">
              <span className="hero-thread-detail__lbl">порог столпов</span>
              <div className="hero-thread-detail__reqs">
                {reqs.map(([id, need]) => {
                  const have = snapshot.finalPillars[id];
                  const ok = have >= need;
                  const ratio = need > 0 ? Math.min(1, have / need) : 1;
                  return (
                    <div key={id} className="hero-thread-detail__req">
                      <img src={PILLAR_ICON[id]} alt="" decoding="async" />
                      <GProgressBar value={ratio} height={5} style={{ flex: 1 }} />
                      <span className="hero-thread-detail__val">
                        {Math.round(have)}/{need}{ok ? ' ✓' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="hero-thread-detail__hint" data-ok={on ? 'true' : 'false'}>
                {on
                  ? 'Порог закрыт. Эффект в бой и idle ещё не входит.'
                  : `Не хватает: ${missing.map(([id, gap]) => `${PILLARS[id].nameRu} +${gap}`).join(', ')}`}
              </p>
            </div>
          </div>
        );
      })()}
      {detail?.kind === 'gear' && (
        <div className="hero-hub-modal">
          {gearItem ? (
            <>
              <div className="hero-item-card">
                <span className={`hero-item-card__tile is-${getItemRarity(gearItem.id, gearItem.sellValue, gearItem.equipSlot, gearItem.tier)}`}>
                  {slotVisual(gearItem.id, detail.slot).src ? (
                    <img src={slotVisual(gearItem.id, detail.slot).src} alt="" decoding="async" />
                  ) : (
                    <span>{slotVisual(gearItem.id, detail.slot).emoji}</span>
                  )}
                </span>
                <span className="hero-item-card__meta">
                  <strong>{gearItem.name}</strong>
                  <em className={`hero-item-rarity is-${getItemRarity(gearItem.id, gearItem.sellValue, gearItem.equipSlot, gearItem.tier)}`}>
                    {RARITY_RU[getItemRarity(gearItem.id, gearItem.sellValue, gearItem.equipSlot, gearItem.tier)]}
                  </em>
                  <small>{GEAR_LABEL[detail.slot]}</small>
                </span>
              </div>
              {gearItem.description && <p className="hero-item-desc">{gearItem.description}</p>}
              {typeof gearItem.maxDurability === 'number' && gearItem.maxDurability > 0 && (
                <GInfoRow label="Прочность" value={`${gearItem.maxDurability}/${gearItem.maxDurability}`} />
              )}
              {twoHand && <p className="hero-item-note">Двуручное: занимает обе руки.</p>}
              {itemBonusRows(gearItem).map(r => (
                <GInfoRow key={r.id} label={r.label} value={r.value} />
              ))}
              <GButton size="sm" fullWidth variant="secondary" onClick={handleUnequip}>
                Снять в сумку
              </GButton>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                Слот «{GEAR_LABEL[detail.slot]}» пуст. Выберите предмет из мини-инвентаря справа.
              </p>
              <GButton size="sm" fullWidth variant="secondary" onClick={onClose}>
                Понятно
              </GButton>
            </div>
          )}
        </div>
      )}
      {detail?.kind === 'bag-item' && bagDetailItem && (() => {
        const item = bagDetailItem;
        const equippedId = item.equipSlot ? equipment[item.equipSlot] : null;
        const equippedItem = equippedId ? getItem(equippedId) : undefined;
        const deltas = item.equipSlot ? diffItemSubstatBonuses(item, equippedItem) : [];
        const rarity = getItemRarity(item.id, item.sellValue, item.equipSlot);
        const visual = getItemVisual(item.id);

        const handleEquip = () => {
          if (!item.equipSlot) return;
          const oldItem = usePlayerStore.getState().equipItem(item.id, item.equipSlot);
          const inventory = useInventoryStore.getState();
          inventory.removeItem(item.id, 1);
          if (oldItem) inventory.addItem(oldItem, 1);
          useNotificationsStore.getState().notifyInfo(`Экипировано: ${item.name}`);
          onClose();
        };

        return (
          <div className="hero-hub-modal hero-hub-modal--item">
            <div className="hero-item-card">
              <span className={`hero-item-card__tile is-${rarity}`}>
                {visual.type === 'image'
                  ? <img src={visual.value} alt="" decoding="async" />
                  : <span>{visual.value}</span>}
              </span>
              <span className="hero-item-card__meta">
                <strong>{item.name}</strong>
                <em className={`hero-item-rarity is-${rarity}`}>{RARITY_RU[rarity]}</em>
                {item.equipSlot && <small>{GEAR_LABEL[item.equipSlot]}</small>}
              </span>
            </div>
            {item.description && <p className="hero-item-desc">{item.description}</p>}
            {typeof item.maxDurability === 'number' && item.maxDurability > 0 && (
              <GInfoRow label="Прочность" value={`${item.maxDurability}/${item.maxDurability}`} />
            )}
            {itemBonusRows(item).map(r => (
              <GInfoRow key={r.id} label={r.label} value={r.value} />
            ))}
            {item.twoHanded && (
              <p className="hero-item-note">Двуручное: занимает обе руки, что в руках — уйдёт в сумку.</p>
            )}
            {equippedItem && deltas.length > 0 && (
              <div className="hero-cmp" aria-label="Сравнение с надетым">
                <p className="hero-cmp__vs">Сейчас надето: {equippedItem.name}</p>
                {deltas.map(d => (
                  <div
                    key={d.id}
                    className="hero-cmp-row"
                    data-delta={d.delta > 0 ? 'up' : d.delta < 0 ? 'down' : 'same'}
                  >
                    <span>{d.label}</span>
                    <span className="hero-cmp-row__vals">{d.from} → {d.to}</span>
                    <span className="hero-cmp-row__delta">{d.deltaText}</span>
                  </div>
                ))}
              </div>
            )}
            <GButton size="sm" fullWidth onClick={handleEquip}>
              Надеть
            </GButton>
          </div>
        );
      })()}
    </GModal>
  );
}

export default HeroHubPage;
