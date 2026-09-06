import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import {
  GAvatar, GBadge, GButton, GEmptyState, GInfoRow, GModal, GProgressBar, GSlot, GTag,
} from '@/shared/ui/gameUI';
import { TierBadge } from '@/shared/ui/kit/TierBadge';
import { useAuthStore } from '@/store/authStore';
import { useCharacterStore } from '@/store/characterStore';
import { usePlayerStore } from '@/store/playerStore';
import { useBankStore } from '@/store/bankStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { getAvatarPath, getDollPath, getDollPath2x, getRaceLabel, type RaceId } from '@/data/characters';
import { iconUrl } from '@/lib/assetUrl';
import { getItemRarity } from '@/features/bank/ItemIcon';
import { getItemTier, UniversalInfoModal } from '@/components/modals/UniversalInfoModal';
import { EquipSlotSilhouette } from '@/shared/icons/EquipSlotIcons';
import {
  BRANCHES,
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
import {
  EQUIP_SLOT_ICON,
  HUB_NAV_ICON,
  PILLAR_ICON,
  SYNERGY_ICON,
} from '@/domain/attributes/attributeIcons';
import { SYNERGIES, type SynergyDef, type SynergyId } from '@/domain/attributes/synergies';
import { getItem } from '@/domain/items/items';
import { formatNumber } from '@/lib/utils';
import type { EquipSlot, Equipment, Item } from '@/data/types';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { getLiveGearSets, loadGearSet, saveGearSet } from '@/domain/items/gearSets';
import { diffCombatStats, EQUIP_STAT_META, sumEquipmentStats, type EquipStatKey } from '@/domain/items/equipmentStats';
import {
  FREE_RESPEC_LIMIT,
  computeAttributeSnapshot,
  getLiveAttributes,
  nodeBlockReason,
  nodeRank,
  remainingFreeRespecs,
  respecBranchRanks,
  respecPillarRanks,
  spendBranchPoint,
  spendPillarPoint,
  spentBranchRanks,
  spentPillarRanks,
  type SubstatDisplay,
} from '@/domain/attributes/characterAttributes';
import { NODE_RANK_CAP } from '@/data/balance/pillars';
import { xpToNextLevel } from '@/data/balance/xpRates';
import { commitGearSets, commitHeroAttributes } from '@/lib/heroPersist';
import { HeroBoard } from '@/features/hero/HeroBoard';
import { CRIT_CHANCE_STUB, formatStrikeRange } from '@/features/hero/heroReadout';

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

/** Слева 2-я колонка: аксессуары и украшения (7 слотов, 14-й — будущий контент) */
const GEAR_LEFT_COL2: EquipSlotDef[] = [
  { slot: 'cape', label: 'Плащ' },
  { slot: 'belt', label: 'Пояс' },
  { slot: 'amulet', label: 'Амулет' },
  { slot: 'ring', label: 'Кольцо 1' },
  { slot: 'ring2', label: 'Кольцо 2' },
  { slot: 'bracelet', label: 'Браслет' },
  { slot: 'locked', label: 'Скоро', locked: true },
];

import { Swords, Zap, Shield, Sparkles, Package, Save, Lock, ChevronLeft, ChevronRight } from 'lucide-react';

const STAT_BADGES: { key: EquipStatKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'attackBonus', label: 'Атака', icon: Swords },
  { key: 'strengthBonus', label: 'Сила', icon: Zap },
  { key: 'defenceBonus', label: 'Защита', icon: Shield },
  { key: 'rangedAttackBonus', label: 'Стрельба', icon: Swords },
  { key: 'magicAttackBonus', label: 'Магия', icon: Sparkles },
  { key: 'prayerBonus', label: 'Молитва', icon: Sparkles },
];

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
  const state = useMemo(() => getLiveAttributes(), [active?.id, tick]);
  const snapshot = useMemo(
    () => computeAttributeSnapshot({ state, raceId }),
    [state, raceId],
  );

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
        {MODULES.map(mod => (
          <button
            key={mod.id}
            type="button"
            className={moduleId === mod.id ? 'hero-hub__tab is-on' : 'hero-hub__tab'}
            aria-pressed={moduleId === mod.id}
            onClick={() => setModuleId(mod.id)}
          >
            {mod.label}
          </button>
        ))}
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
            onGearSetsChanged={() => setTick(n => n + 1)}
          />
        )}
        {moduleId === 'synergies' && (
          <SynergiesModule
            snapshot={snapshot}
            onOpen={id => setDetail({ kind: 'synergy', id })}
          />
        )}
        {moduleId === 'path' && <PathModule snapshot={snapshot} />}
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

const RARITY_DOT: Record<string, string> = {
  common: '#8b4e20',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
  mythic: '#ef4444',
};

function GearModule({
  equipment, avatarId, onGearSetsChanged,
}: {
  equipment: Equipment;
  avatarId: string;
  onGearSetsChanged: () => void;
}) {
  const bankItems = useBankStore(s => s.items);
  const notifyInfo = useNotificationsStore(s => s.notifyInfo);
  const [filter, setFilter] = useState<BagFilter>('all');
  const [page, setPage] = useState(0);
  const [saveOpen, setSaveOpen] = useState(false);
  const [activeSetIndex, setActiveSetIndex] = useState<number | null>(null);
  const [selectedModalItemId, setSelectedModalItemId] = useState<string | null>(null);
  const [selectedBagItemId, setSelectedBagItemId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<EquipSlot | 'locked' | null>(null);

  const presets = getLiveGearSets().presets;
  const totals = useMemo(() => sumEquipmentStats(equipment), [equipment]);
  const twoHand = isTwoHanded(equipment.weapon);

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
    for (const s of bankItems) {
      if (s.quantity <= 0) continue;
      const item = getItem(s.itemId);
      const equipSlot = item?.equipSlot;
      if (!item || !equipSlot) continue;
      const itemFilter = bagFilterOf(item);
      if (filter !== 'all' && itemFilter !== filter) continue;
      out.push({ slot: { itemId: s.itemId, quantity: s.quantity }, item, equipSlot });
    }
    return out;
  }, [bankItems, filter]);

  const BAG_PAGE_SIZE = 14;
  const totalPages = Math.max(1, Math.ceil(bagItems.length / BAG_PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const visibleBagItems = bagItems.slice(safePage * BAG_PAGE_SIZE, (safePage + 1) * BAG_PAGE_SIZE);
  const emptyPlaceholders = Math.max(0, BAG_PAGE_SIZE - visibleBagItems.length);

  const handleEmptyBagSlotClick = () => {
    setSelectedBagItemId(null);
  };

  const activeStats = STAT_BADGES.filter(
    s => ['attackBonus', 'strengthBonus', 'defenceBonus'].includes(s.key) || (totals[s.key] ?? 0) > 0
  );

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
          {activeStats.map(s => {
            const val = totals[s.key] ?? 0;
            const IconComp = s.icon;
            return (
              <div key={s.key} className="hero-gear2__stat-card">
                <div className="hero-gear2__stat-meta">
                  <span className="hero-gear2__stat-icon">
                    <IconComp className="w-3.5 h-3.5 text-amber-400/90" />
                  </span>
                  <span className="hero-gear2__stat-label">{s.label}</span>
                </div>
                <span className={`hero-gear2__stat-val ${val === 0 ? 'is-zero' : ''}`}>
                  {val > 0 ? `+${val}` : val < 0 ? val : '0'}
                </span>
              </div>
            );
          })}
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
      <button
        type="button"
        onClick={() => onOpen('locked')}
        className={`hero-sq-slot hero-sq-slot--locked ${isSelected ? 'is-selected' : ''}`}
        title="Скоро — будущий слот"
      >
        <EquipSlotSilhouette slot="locked" className="hero-sq-slot__vector-icon" />
      </button>
    );
  }

  const slot = slotDef.slot as EquipSlot;
  const ghostLeft = slot === 'shield' && twoHand;
  const itemId = ghostLeft ? equipment.weapon : equipment[slot];
  const item = itemId ? getItem(itemId) : undefined;
  const rarity = itemId && item ? getItemRarity(itemId, item.sellValue, item.equipSlot) : 'common';
  const tier = itemId && item ? getItemTier(itemId, item) : undefined;

  if (!itemId) {
    return (
      <button
        type="button"
        onClick={() => onOpen(slot)}
        className={`hero-sq-slot hero-sq-slot--empty ${isSelected ? 'is-selected' : ''} ${isMatchingTarget ? 'is-matching-target' : ''}`}
        title={`Надеть: ${slotDef.label}`}
      >
        <EquipSlotSilhouette slot={slot} className="hero-sq-slot__vector-icon" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(ghostLeft ? 'weapon' : slot)}
      className={`hero-sq-slot hero-sq-slot--equipped ${ghostLeft ? 'is-dimmed' : ''} ${isSelected ? 'is-selected' : ''} ${isMatchingTarget ? 'is-matching-target' : ''}`}
      title={ghostLeft ? `${slotDef.label} · двуручное` : `${item?.name ?? ''} (${slotDef.label})`}
    >
      {tier && (
        <span className="hero-sq-slot__tier">
          {tier}
        </span>
      )}
      {rarity !== 'common' && (
        <span
          className="hero-sq-slot__dot"
          style={{ background: RARITY_DOT[rarity] || '#8b4e20' }}
        />
      )}
      <div className="hero-sq-slot__icon-wrap">
        <EquipSlotSilhouette slot={ghostLeft ? 'weapon' : slot} className="hero-sq-slot__vector-icon hero-sq-slot__vector-icon--filled" />
      </div>
    </button>
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
      <button
        type="button"
        onClick={onEmptyClick}
        className={`hero-sq-slot hero-sq-slot--empty-bag ${isSelected ? 'is-selected' : ''}`}
        title="Пустая ячейка"
      />
    );
  }

  const rarity = getItemRarity(item.id, item.sellValue, equipSlot);
  const tier = getItemTier(item.id, item);

  return (
    <button
      type="button"
      onClick={() => onOpen?.(item, equipSlot)}
      className={`hero-sq-slot hero-sq-slot--bag-item ${isSelected ? 'is-selected' : ''} ${isCompatible ? 'is-compatible' : ''}`}
      title={`${item.name} · ${GEAR_LABEL[equipSlot] ?? equipSlot}`}
    >
      {tier && (
        <span className="hero-sq-slot__tier">
          {tier}
        </span>
      )}
      {rarity !== 'common' && (
        <span
          className="hero-sq-slot__dot"
          style={{ background: RARITY_DOT[rarity] || '#8b4e20' }}
        />
      )}
      <div className="hero-sq-slot__icon-wrap">
        <EquipSlotSilhouette slot={equipSlot} className="hero-sq-slot__vector-icon hero-sq-slot__vector-icon--filled" />
      </div>
      {slot.quantity > 1 && (
        <span className="hero-sq-slot__qty">
          {formatNumber(slot.quantity)}
        </span>
      )}
    </button>
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
          <span className="hero-thread-summary__sub">связь между столпами</span>
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
            title="Пока нет активных нитей"
            description="Доведи два столпа до нужных чисел — и нить станет активной."
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
  snapshot,
}: {
  snapshot: ReturnType<typeof computeAttributeSnapshot>;
}) {
  const d = snapshot.substatDisplays;
  const plaques = [
    { id: 'health', label: 'Здоровье', value: formatSubstat(d.health) },
    { id: 'strike', label: 'Удар', value: formatStrikeRange(snapshot.substats.strike) },
    { id: 'armor', label: 'Броня', value: formatSubstat(d.armor) },
    { id: 'evasion', label: 'Уворот', value: formatSubstat(d.evasion) },
    { id: 'crit', label: 'Крит', value: `${CRIT_CHANCE_STUB}%` },
    { id: 'luck', label: 'Удача', value: formatSubstat(d.luck) },
  ] as const;

  return (
    <div className="hero-sheet">
      <div className="hero-readout" aria-label="Характеристики тела">
        {plaques.map(plaque => (
          <div key={plaque.id} className="hero-plaque">
            <span className="hero-plaque__label">{plaque.label}</span>
            <b className="hero-plaque__value">{plaque.value}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroSettingsModal({
  open, state, onClose, onRespecPillars, onRespecBranches,
}: {
  open: boolean;
  state: ReturnType<typeof getLiveAttributes>;
  onClose: () => void;
  onRespecPillars: () => void;
  onRespecBranches: () => void;
}) {
  const left = remainingFreeRespecs(state);
  const spentP = spentPillarRanks(state);
  const spentB = spentBranchRanks(state);
  const canPillars = left > 0 && spentP > 0;
  const canBranches = left > 0 && spentB > 0;

  return (
    <GModal open={open} onClose={onClose} title="Настройки персонажа" width={340}>
      <div className="hero-settings">
        <GInfoRow label="Бесплатных сбросов" value={`${left} / ${FREE_RESPEC_LIMIT}`} />
        <GButton
          size="sm"
          fullWidth
          disabled={!canPillars}
          onClick={onRespecPillars}
        >
          {left < 1
            ? 'Столпы — за золото'
            : spentP === 0
              ? 'Столпы: сбрасывать нечего'
              : 'Сбросить очки столпов'}
        </GButton>
        <GButton
          size="sm"
          fullWidth
          variant="secondary"
          disabled={!canBranches}
          onClick={onRespecBranches}
        >
          {left < 1
            ? 'Пассивки — за золото'
            : spentB === 0
              ? 'Пассивки: сбрасывать нечего'
              : 'Сбросить очки пассивок'}
        </GButton>
        <p className="hero-settings__hint">Дальше — за золото. Цена не назначена.</p>
      </div>
    </GModal>
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
      width={detail?.kind === 'bag-item' ? 320 : 280}
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
            <GInfoRow label={PILLARS[detail.id].nameRu} value={String(total)} />
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
              {canSpendPillar ? 'Положить очко' : 'Очков пока нет'}
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
        return (
          <div className="hero-hub-modal hero-hub-modal--card">
            <p>{info.childRu}</p>
            <GInfoRow label="Ранг" value={`${rank} из ${NODE_RANK_CAP}`} />
            <GInfoRow label="Эффект" value="не подключён" />
            <GButton
              size="sm"
              fullWidth
              disabled={Boolean(blocked)}
              onClick={() => onSpendNode(ref)}
            >
              {blocked ?? 'Положить очко пассивки'}
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
              <GBadge variant={on ? 'gold' : 'gray'} size="sm">{on ? 'активна' : 'неактивна'}</GBadge>
            </div>
            {synergy.childRu && <p className="hero-thread-detail__flavor">{synergy.childRu}</p>}
            <div className="hero-thread-detail__block">
              <span className="hero-thread-detail__lbl">что делает</span>
              <p className="hero-thread-detail__fx">{synergy.effectRu}</p>
            </div>
            <div className="hero-thread-detail__block">
              <span className="hero-thread-detail__lbl">чтобы зажечь</span>
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
                  ? 'Все столпы выполнены — нить активна.'
                  : `Осталось повысить: ${missing.map(([id, gap]) => `${PILLARS[id].nameRu} +${gap}`).join(', ')}`}
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
                <span className={`hero-item-card__tile is-${getItemRarity(gearItem.id, gearItem.sellValue, gearItem.equipSlot)}`}>
                  {slotVisual(gearItem.id, detail.slot).src ? (
                    <img src={slotVisual(gearItem.id, detail.slot).src} alt="" decoding="async" />
                  ) : (
                    <span>{slotVisual(gearItem.id, detail.slot).emoji}</span>
                  )}
                </span>
                <span className="hero-item-card__meta">
                  <strong>{gearItem.name}</strong>
                  <em className={`hero-item-rarity is-${getItemRarity(gearItem.id, gearItem.sellValue, gearItem.equipSlot)}`}>
                    {RARITY_RU[getItemRarity(gearItem.id, gearItem.sellValue, gearItem.equipSlot)]}
                  </em>
                  <small>{GEAR_LABEL[detail.slot]}</small>
                </span>
              </div>
              {gearItem.description && <p className="hero-item-desc">{gearItem.description}</p>}
              {twoHand && <p className="hero-item-note">Двуручное: занимает обе руки.</p>}
              {EQUIP_STAT_META
                .map(({ key, label }) => ({ key, label, value: gearItem.combatStats?.[key] ?? 0 }))
                .filter(r => r.value !== 0)
                .map(r => (
                  <GInfoRow key={r.key} label={r.label} value={r.value > 0 ? `+${r.value}` : String(r.value)} />
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
        const deltas = item.equipSlot ? diffCombatStats(item.id, equippedId) : [];
        const rarity = getItemRarity(item.id, item.sellValue, item.equipSlot);
        const visual = getItemVisual(item.id);

        const handleEquip = () => {
          if (!item.equipSlot) return;
          const oldItem = usePlayerStore.getState().equipItem(item.id, item.equipSlot);
          const bank = useBankStore.getState();
          bank.removeItem(item.id, 1);
          if (oldItem) bank.addItem(oldItem, 1);
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
            {EQUIP_STAT_META
              .map(({ key, label }) => ({ key, label, value: item.combatStats?.[key] ?? 0 }))
              .filter(r => r.value !== 0)
              .map(r => <GInfoRow key={r.key} label={r.label} value={`+${r.value}`} />)}
            {item.twoHanded && (
              <p className="hero-item-note">Двуручное: занимает обе руки, что в руках — уйдёт в сумку.</p>
            )}
            {equippedItem && deltas.length > 0 && (
              <div className="hero-cmp" aria-label="Сравнение с надетым">
                <p className="hero-cmp__vs">Сейчас надето: {equippedItem.name}</p>
                {deltas.map(d => (
                  <div
                    key={d.key}
                    className="hero-cmp-row"
                    data-delta={d.delta > 0 ? 'up' : d.delta < 0 ? 'down' : 'same'}
                  >
                    <span>{d.label}</span>
                    <span className="hero-cmp-row__vals">{d.from} → {d.to}</span>
                    <span className="hero-cmp-row__delta">
                      {d.delta > 0 ? `+${d.delta}` : d.delta < 0 ? `−${Math.abs(d.delta)}` : '0'}
                    </span>
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
