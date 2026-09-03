import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import {
  GAvatar, GBadge, GButton, GEmptyState, GInfoRow, GModal, GSlot, GTag,
} from '@/shared/ui/gameUI';
import { TierBadge } from '@/shared/ui/kit/TierBadge';
import { useAuthStore } from '@/store/authStore';
import { useCharacterStore } from '@/store/characterStore';
import { usePlayerStore } from '@/store/playerStore';
import { useBankStore } from '@/store/bankStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { getAvatarPath, getDollPath, getDollPath2x, getRaceLabel, type RaceId } from '@/data/characters';
import { getItemRarity } from '@/components/ItemIcon';
import { getItemTier } from '@/components/modals/UniversalInfoModal';
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
} from '@/data/attributes';
import {
  EQUIP_SLOT_ICON,
  HUB_NAV_ICON,
  SYNERGY_ICON,
} from '@/data/attributeIcons';
import { SYNERGIES, type SynergyId } from '@/data/synergies';
import { getItem } from '@/data/items';
import type { EquipSlot, Equipment, Item } from '@/data/types';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { getLiveGearSets, loadGearSet, saveGearSet } from '@/lib/gearSets';
import { diffCombatStats, EQUIP_STAT_META, sumEquipmentStats, type EquipStatKey } from '@/lib/equipmentStats';
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
} from '@/lib/characterAttributes';
import { NODE_RANK_CAP } from '@/data/balance/pillars';
import { commitGearSets, commitHeroAttributes } from '@/lib/heroPersist';
import { HeroBoard } from '@/components/HeroBoard';

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

const STAT_BADGES: { key: EquipStatKey; label: string; icon: string }[] = [
  { key: 'attackBonus', label: 'Атака', icon: '⚔️' },
  { key: 'strengthBonus', label: 'Сила', icon: '⚡' },
  { key: 'defenceBonus', label: 'Защита', icon: '🛡️' },
  { key: 'rangedAttackBonus', label: 'Стрельба', icon: '🏹' },
  { key: 'magicAttackBonus', label: 'Магия', icon: '🔮' },
  { key: 'prayerBonus', label: 'Молитва', icon: '✨' },
];

type BagFilter = 'all' | 'weapon' | 'armor' | 'jewel';

const BAG_FILTERS: { id: BagFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'Всё', icon: '📦' },
  { id: 'weapon', label: 'Оружие', icon: '⚔️' },
  { id: 'armor', label: 'Броня', icon: '🛡️' },
  { id: 'jewel', label: 'Бижа', icon: '💍' },
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

function formatSubstat(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(1);
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
        <GAvatar src={getAvatarPath(active.avatarId)} size={PORTRAIT} glow />
        <div className="hero-hub__identity">
          <div className="hero-hub__name-row">
            <strong>{active.nickname}</strong>
            <span className="hero-level" title={`Уровень ${state.heroLevel}`}>
              {state.heroLevel}
            </span>
          </div>
          <span className="hero-chip">{getRaceLabel(raceId, 'ru')}</span>
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
            onOpen={slot => setDetail(slot === 'locked' ? { kind: 'locked-slot' } : { kind: 'gear', slot })}
            onOpenBagItem={itemId => setDetail({ kind: 'bag-item', itemId })}
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

function GearModule({
  equipment, avatarId, onOpen, onOpenBagItem, onGearSetsChanged,
}: {
  equipment: Equipment;
  avatarId: string;
  onOpen: (slot: EquipSlot | 'locked') => void;
  onOpenBagItem: (itemId: string) => void;
  onGearSetsChanged: () => void;
}) {
  const bankItems = useBankStore(s => s.items);
  const notifyInfo = useNotificationsStore(s => s.notifyInfo);
  const [filter, setFilter] = useState<BagFilter>('all');
  const [page, setPage] = useState(0);
  const [saveOpen, setSaveOpen] = useState(false);

  const presets = getLiveGearSets().presets;
  const totals = useMemo(() => sumEquipmentStats(equipment), [equipment]);
  const twoHand = isTwoHanded(equipment.weapon);

  const saveSet = (index: number) => {
    const next = saveGearSet(index);
    if (!next) return;
    commitGearSets(next);
    onGearSetsChanged();
    setSaveOpen(false);
    notifyInfo(`Набор ${index + 1} сохранён`);
  };

  const loadSet = (index: number) => {
    const result = loadGearSet(index);
    if (!result.ok) {
      notifyInfo(result.reason === 'bag-full'
        ? 'Сумка заполнена — освободите места, чтобы надеть набор'
        : `Набор ${index + 1} пуст`);
      return;
    }
    onGearSetsChanged();
    notifyInfo(result.partial
      ? `Набор ${index + 1} надет. Часть предметов не найдена — их слоты не тронуты`
      : `Набор ${index + 1} надет`);
  };

  const handleFilterChange = (f: BagFilter) => {
    setFilter(f);
    setPage(0);
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

  const activeStats = STAT_BADGES.filter(
    s => ['attackBonus', 'strengthBonus', 'defenceBonus'].includes(s.key) || (totals[s.key] ?? 0) > 0
  );

  return (
    <div className="hero-sheet hero-gear2">
      {/* 1. Верхняя панель: наборы экипировки 1, 2, 3 и Сохранить */}
      <div className="hero-gear2__presets">
        <div className="hero-gear2__presets-group">
          {presets.map((preset, i) => (
            <button
              key={i}
              type="button"
              className={preset ? 'hero-set-chip is-filled' : 'hero-set-chip'}
              title={preset ? `Надеть «${preset.name}»` : `Набор ${i + 1} — пуст`}
              onClick={() => loadSet(i)}
            >
              {preset ? preset.name : `Набор ${i + 1}`}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="hero-set-chip hero-set-chip--save"
            aria-expanded={saveOpen}
            onClick={() => setSaveOpen(v => !v)}
          >
            💾 Сохранить
          </button>
          {saveOpen && (
            <div className="hero-gear2__sets-choose" role="menu">
              {presets.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className="hero-set-opt"
                  onClick={() => saveSet(i)}
                >
                  в набор {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Основной блок: Слева (2×7 надетых) | Центр (Манекен) | Справа (2×7 мини-сумка) */}
      <div className="hero-gear2__main">
        {/* Слева: 14 слотов надетых вещей (2 колонки по 7) */}
        <div className="hero-gear2__slots-col" role="group" aria-label="Надетая экипировка">
          <div className="hero-gear2__grid-7">
            {GEAR_LEFT_COL1.map(def => (
              <HeroEquipSlotCard
                key={def.slot}
                slotDef={def}
                equipment={equipment}
                twoHand={twoHand}
                onOpen={onOpen}
              />
            ))}
          </div>
          <div className="hero-gear2__grid-7">
            {GEAR_LEFT_COL2.map(def => (
              <HeroEquipSlotCard
                key={def.slot}
                slotDef={def}
                equipment={equipment}
                twoHand={twoHand}
                onOpen={onOpen}
              />
            ))}
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

        {/* Справа: Мини-инвентарь (кнопки сортировки + 2 колонки по 7) */}
        <div className="hero-gear2__inv-col" role="group" aria-label="Мини-инвентарь">
          <div className="hero-gear2__inv-head">
            <div className="hero-gear2__inv-filters" role="tablist">
              {BAG_FILTERS.map(f => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.id}
                  className={filter === f.id ? 'hero-gear2__filter-chip is-active' : 'hero-gear2__filter-chip'}
                  title={f.label}
                  onClick={() => handleFilterChange(f.id)}
                >
                  <span>{f.icon}</span>
                </button>
              ))}
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
                  ‹
                </button>
                <span>{safePage + 1}/{totalPages}</span>
                <button
                  type="button"
                  disabled={safePage >= totalPages - 1}
                  className="hero-gear2__pager-btn"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  title="Вперёд"
                >
                  ›
                </button>
              </div>
            )}
          </div>

          <div className="hero-gear2__inv-grid">
            {visibleBagItems.map(({ slot, item, equipSlot }) => (
              <HeroBagSlotCard
                key={slot.itemId}
                slot={slot}
                item={item}
                equipSlot={equipSlot}
                onOpen={onOpenBagItem}
              />
            ))}
            {Array.from({ length: emptyPlaceholders }).map((_, idx) => (
              <HeroBagSlotCard key={`empty-${idx}`} />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Снизу: Общие характеристики бонусов от экипировки */}
      <div className="hero-gear2__stats-bar">
        <div className="hero-gear2__stats-title">
          <span>Бонусы снаряжения</span>
        </div>
        <div className="hero-gear2__stats-grid">
          {activeStats.map(s => {
            const val = totals[s.key] ?? 0;
            return (
              <div key={s.key} className="hero-gear2__stat-card">
                <div className="hero-gear2__stat-meta">
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </div>
                <div className="hero-gear2__stat-circle">
                  {val > 0 ? `+${val}` : '0'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HeroEquipSlotCard({
  slotDef, equipment, twoHand, onOpen,
}: {
  slotDef: EquipSlotDef;
  equipment: Equipment;
  twoHand: boolean;
  onOpen: (slot: EquipSlot | 'locked') => void;
}) {
  if (slotDef.locked) {
    return (
      <GSlot
        size={38}
        frame="locked"
        emoji="🔒"
        title="Скоро — будущий слот"
        onClick={() => onOpen('locked')}
      />
    );
  }

  const slot = slotDef.slot as EquipSlot;
  const ghostLeft = slot === 'shield' && twoHand;
  const itemId = ghostLeft ? equipment.weapon : equipment[slot];
  const item = itemId ? getItem(itemId) : undefined;
  const visual = slotVisual(itemId, slot);
  const rarity = itemId && item ? getItemRarity(itemId, item.sellValue, item.equipSlot) : undefined;
  const tier = itemId && item ? getItemTier(itemId, item) : undefined;

  return (
    <GSlot
      size={38}
      src={visual.src}
      emoji={visual.emoji}
      frame={rarity as any}
      selected={Boolean(itemId) && !ghostLeft}
      dimmed={ghostLeft}
      badge={tier ? <TierBadge tier={tier} size="sm" /> : undefined}
      title={ghostLeft ? `${slotDef.label} · двуручное` : itemId && item ? `${item.name} (${slotDef.label})` : slotDef.label}
      onClick={() => onOpen(ghostLeft ? 'weapon' : slot)}
    />
  );
}

function HeroBagSlotCard({
  slot, item, equipSlot, onOpen,
}: {
  slot?: { itemId: string; quantity: number };
  item?: Item;
  equipSlot?: EquipSlot;
  onOpen?: (itemId: string) => void;
}) {
  if (!slot || !item || !equipSlot) {
    return (
      <div
        className="g-slot-empty"
        style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-slot)',
          border: '1px dashed var(--border-slot)',
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--border-slot)',
            opacity: 0.35,
          }}
        />
      </div>
    );
  }

  const visual = getItemVisual(item.id);
  const rarity = getItemRarity(item.id, item.sellValue, equipSlot);
  const tier = getItemTier(item.id, item);

  return (
    <GSlot
      size={38}
      src={visual.type === 'image' ? visual.value : undefined}
      emoji={visual.type === 'emoji' ? visual.value : undefined}
      frame={rarity as any}
      badge={tier ? <TierBadge tier={tier} size="sm" /> : undefined}
      title={`${item.name} · ${GEAR_LABEL[equipSlot] ?? equipSlot}`}
      onClick={() => onOpen?.(item.id)}
    />
  );
}

function SynergiesModule({
  snapshot, onOpen,
}: {
  snapshot: ReturnType<typeof computeAttributeSnapshot>;
  onOpen: (id: SynergyId) => void;
}) {
  return (
    <div className="hero-sheet">
      <div className="hero-threads">
        {SYNERGIES.map(synergy => {
          const on = snapshot.activeSynergies.includes(synergy.id);
          const reqs = Object.entries(synergy.requires) as [PillarId, number][];
          return (
            <button
              key={synergy.id}
              type="button"
              className="hero-thread"
              data-on={on ? 'true' : 'false'}
              onClick={() => onOpen(synergy.id)}
            >
              <span className="hero-thread__head">
                <img src={SYNERGY_ICON[synergy.id]} alt="" decoding="async" />
                <strong>{synergy.nameRu}</strong>
                <GBadge variant={on ? 'gold' : 'gray'} size="sm">{on ? 'горит' : 'спит'}</GBadge>
              </span>
              <span className="hero-thread__reqs">
                {reqs.map(([id, need]) => {
                  const have = snapshot.finalPillars[id];
                  const ratio = need > 0 ? Math.min(1, Math.max(0, have / need)) : 1;
                  return (
                    <span key={id} className="hero-req">
                      <span>{PILLARS[id].nameRu} {Math.round(have)}/{need}</span>
                      <span className="hero-meter" aria-hidden>
                        <i style={{ width: `${Math.round(ratio * 100)}%` }} />
                      </span>
                    </span>
                  );
                })}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PathModule({
  snapshot,
}: {
  snapshot: ReturnType<typeof computeAttributeSnapshot>;
}) {
  const state = snapshot.state;
  const spentP = spentPillarRanks(state);
  const spentB = spentBranchRanks(state);
  const left = remainingFreeRespecs(state);

  return (
    <div className="hero-sheet">
      <div className="hero-path-facts">
        <div><span>Уровень</span><b>{state.heroLevel}</b></div>
        <div><span>Столпы</span><b>{spentP} / {snapshot.earnedPillarPoints}</b></div>
        <div><span>Пассивки</span><b>{spentB} / {snapshot.earnedBranchPoints}</b></div>
        <div><span>Сброс</span><b>{left} / {FREE_RESPEC_LIMIT}</b></div>
      </div>
      <div className="hero-stats">
        {PILLAR_IDS.map(pillar => (
          <div key={pillar} className="hero-stats__block">
            <GInfoRow
              label={PILLARS[pillar].nameRu}
              value={String(shownStat(snapshot.finalPillars[pillar]))}
            />
            {SUBSTATS_BY_PILLAR[pillar].map(id => (
              <GInfoRow
                key={id}
                label={SUBSTATS[id].nameRu}
                value={formatSubstat(snapshot.substats[id])}
              />
            ))}
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
      <div className="hero-hub-modal">
        <GInfoRow label="Бесплатных сбросов" value={`${left} / ${FREE_RESPEC_LIMIT}`} />
        <GButton
          size="sm"
          fullWidth
          disabled={!canPillars}
          onClick={onRespecPillars}
        >
          {left < 1
            ? 'Сброс столпов — золото (цена не назначена)'
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
            ? 'Сброс пассивок — золото (цена не назначена)'
            : spentB === 0
              ? 'Пассивки: сбрасывать нечего'
              : 'Сбросить очки пассивок'}
        </GButton>
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
                value={formatSubstat(snapshot.substats[id])}
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
        const missing = Object.entries(synergy.requires)
          .filter(([id, need]) => snapshot.finalPillars[id as PillarId] < (need ?? 0));
        return (
          <div className="hero-hub-modal hero-hub-modal--card">
            <GBadge variant={on ? 'gold' : 'gray'}>{on ? 'горит' : 'спит'}</GBadge>
            <p>{synergy.childRu}</p>
            {on ? <p>{synergy.effectRu}</p> : (
              <p>
                Не хватает:{' '}
                {missing.map(([id, need]) => {
                  const have = snapshot.finalPillars[id as PillarId];
                  const gap = Math.ceil((need ?? 0) - have);
                  return `${PILLARS[id as PillarId].nameRu} ${gap}`;
                }).join(', ')}
              </p>
            )}
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
