import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import {
  GAvatar, GBadge, GButton, GCard, GEmptyState, GInfoRow, GModal, GTag,
} from '@/shared/ui/gameUI';
import { useAuthStore } from '@/store/authStore';
import { useCharacterStore } from '@/store/characterStore';
import { usePlayerStore } from '@/store/playerStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { getAvatarPath, getRaceLabel, type RaceId } from '@/data/characters';
import {
  BRANCHES,
  BRANCHES_BY_PILLAR,
  PILLAR_IDS,
  PILLARS,
  RACE_BODY_CHILD_RU,
  RACE_PASSIVES,
  RACE_PILLAR_MODS,
  type BranchId,
  type PillarId,
} from '@/data/attributes';
import { SYNERGIES, type SynergyId } from '@/data/synergies';
import { getItem } from '@/data/items';
import type { EquipSlot, Equipment } from '@/data/types';
import { getItemVisual } from '@/shared/icons/itemIcons';
import {
  FREE_RESPEC_LIMIT,
  computeAttributeSnapshot,
  getLiveAttributes,
  remainingFreeRespecs,
  respecAttributes,
  spendBranchPoint,
  spendPillarPoint,
  spentBranchRanks,
  spentPillarRanks,
} from '@/lib/characterAttributes';
import { commitHeroAttributes } from '@/lib/heroPersist';

type HubModule = 'body' | 'branches' | 'gear' | 'synergies' | 'path';
type Detail =
  | { kind: 'pillar'; id: PillarId }
  | { kind: 'branch'; id: BranchId }
  | { kind: 'synergy'; id: SynergyId }
  | { kind: 'gear'; slot: EquipSlot };

const MODULES: { id: HubModule; icon: string; label: string }[] = [
  { id: 'body', icon: '🛡', label: 'Тело' },
  { id: 'branches', icon: '🌿', label: 'Ветви' },
  { id: 'gear', icon: '⚔', label: 'Снаряжение' },
  { id: 'synergies', icon: '⚡', label: 'Синергии' },
  { id: 'path', icon: '✦', label: 'Путь' },
];

const GEAR_SLOTS: { slot: EquipSlot; label: string }[] = [
  { slot: 'helm', label: 'Шлем' },
  { slot: 'cape', label: 'Плащ' },
  { slot: 'amulet', label: 'Шея' },
  { slot: 'quiver', label: 'Колчан' },
  { slot: 'weapon', label: 'Оружие' },
  { slot: 'platebody', label: 'Доспех' },
  { slot: 'shield', label: 'Щит' },
  { slot: 'platelegs', label: 'Поножи' },
  { slot: 'gloves', label: 'Перчатки' },
  { slot: 'boots', label: 'Сапоги' },
  { slot: 'ring', label: 'Кольцо' },
  { slot: 'passive', label: 'Талисман' },
];

function signed(value: number): string {
  const rounded = Math.round(value);
  if (rounded > 0) return `+${rounded}`;
  if (rounded < 0) return `−${Math.abs(rounded)}`;
  return '0';
}

function slotLabel(slot: EquipSlot): string {
  return GEAR_SLOTS.find(row => row.slot === slot)?.label ?? slot;
}

export function HeroHubPage() {
  const [, navigate] = useLocation();
  const isGuest = useAuthStore(s => s.isGuest);
  const active = useCharacterStore(s => s.activeCharacter);
  const equipment = usePlayerStore(s => s.equipment);
  const [moduleId, setModuleId] = useState<HubModule>('body');
  const [focusPillar, setFocusPillar] = useState<PillarId>('fortitude');
  const [detail, setDetail] = useState<Detail | null>(null);
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
          description="Войди — тело, ветви и путь будут здесь."
          action={{ label: 'К огню таверны', onClick: () => navigate('/login') }}
        />
      </div>
    );
  }

  return (
    <section className={`hero-hub${moduleId === 'body' ? ' is-body' : ''}`} aria-label="Герой">
      <header className="hero-hub__header">
        <GAvatar src={getAvatarPath(active.avatarId)} size={44} glow />
        <div className="hero-hub__identity">
          <strong>{active.nickname}</strong>
          <p>
            {getRaceLabel(raceId, 'ru')} · ур. {state.heroLevel}
          </p>
        </div>
        <div className="hero-hub__wallets">
          <GBadge variant="gold">Столп {state.unspentPillarPoints}</GBadge>
          <GBadge variant="purple">Ветвь {state.unspentBranchPoints}</GBadge>
        </div>
      </header>

      <div className="hero-hub__body">
        <div className="hero-hub__data" key={moduleId}>
          {moduleId === 'body' && (
            <BodyModule
              raceId={raceId}
              snapshot={snapshot}
              focus={focusPillar}
              onOpen={id => {
                setFocusPillar(id);
                setDetail({ kind: 'pillar', id });
              }}
            />
          )}
          {moduleId === 'branches' && (
            <BranchesModule
              snapshot={snapshot}
              focus={focusPillar}
              onFocus={setFocusPillar}
              onOpen={id => setDetail({ kind: 'branch', id })}
            />
          )}
          {moduleId === 'gear' && (
            <GearModule
              equipment={equipment}
              onOpen={slot => setDetail({ kind: 'gear', slot })}
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
              state={state}
              onRespec={() => applyState(respecAttributes(state))}
            />
          )}
        </div>

        {moduleId === 'body' && (
          <div className="hero-hub__stage">
            <div className="hero-hub__figure">
              {PILLAR_IDS.map(id => {
                const heat = Math.min(1, Math.abs(snapshot.finalPillars[id]) / 40);
                return (
                  <button
                    key={id}
                    type="button"
                    className={`hero-hub__stone hero-hub__stone--${id}${focusPillar === id ? ' is-focus' : ''}`}
                    style={{ ['--stone-heat' as string]: String(heat) }}
                    onClick={() => {
                      setFocusPillar(id);
                      setDetail({ kind: 'pillar', id });
                    }}
                    aria-label={PILLARS[id].nameRu}
                  >
                    <span>{PILLARS[id].icon}</span>
                    <b>{signed(snapshot.finalPillars[id])}</b>
                  </button>
                );
              })}
              <div className="hero-hub__portrait">
                <GAvatar src={getAvatarPath(active.avatarId)} size={120} glow borderColor="var(--border-accent)" />
              </div>
            </div>
          </div>
        )}

        <nav className="hero-hub__rail" aria-label="Разделы героя">
          {MODULES.map(mod => (
            <button
              key={mod.id}
              type="button"
              className={`hero-hub__rail-btn${moduleId === mod.id ? ' is-active' : ''}`}
              onClick={() => setModuleId(mod.id)}
            >
              <span>{mod.icon}</span>
              <small>{mod.label}</small>
            </button>
          ))}
        </nav>
      </div>

      <HeroDetailModal
        detail={detail}
        raceId={raceId}
        snapshot={snapshot}
        equipment={equipment}
        canSpendPillar={state.unspentPillarPoints > 0}
        canSpendBranch={state.unspentBranchPoints > 0}
        onClose={() => setDetail(null)}
        onSpendPillar={id => applyState(spendPillarPoint(state, id))}
        onSpendBranch={id => applyState(spendBranchPoint(state, id))}
      />
    </section>
  );
}

function BodyModule({
  raceId, snapshot, focus, onOpen,
}: {
  raceId: RaceId;
  snapshot: ReturnType<typeof computeAttributeSnapshot>;
  focus: PillarId;
  onOpen: (id: PillarId) => void;
}) {
  const mods = RACE_PILLAR_MODS[raceId];
  return (
    <div className="hero-hub-module">
      <h2>Четыре столпа</h2>
      <p>{PILLARS[focus].childRu}</p>
      <div className="hero-hub-chip-grid hero-hub-chip-grid--2">
        {PILLAR_IDS.map(id => {
          const pillar = PILLARS[id];
          return (
            <GCard
              key={id}
              selected={focus === id}
              onClick={() => onOpen(id)}
              className="hero-hub-chip"
            >
              <span>{pillar.icon} {pillar.nameRu}</span>
              <b>{signed(snapshot.finalPillars[id])}</b>
            </GCard>
          );
        })}
      </div>
      <div className="hero-hub-legacy__mods">
        {mods.map(mod => (
          <GBadge key={mod.pillar} variant={mod.percent > 0 ? 'green' : 'red'} size="sm">
            {PILLARS[mod.pillar].nameRu} {mod.percent > 0 ? '+' : '−'}{Math.abs(mod.percent)}%
          </GBadge>
        ))}
      </div>
    </div>
  );
}

function BranchesModule({
  snapshot, focus, onFocus, onOpen,
}: {
  snapshot: ReturnType<typeof computeAttributeSnapshot>;
  focus: PillarId;
  onFocus: (id: PillarId) => void;
  onOpen: (id: BranchId) => void;
}) {
  return (
    <div className="hero-hub-module">
      <h2>Ветви · {PILLARS[focus].nameRu}</h2>
      <div className="hero-hub-pillar-tabs">
        {PILLAR_IDS.map(id => (
          <button
            key={id}
            type="button"
            className={focus === id ? 'is-active' : ''}
            onClick={() => onFocus(id)}
            aria-label={PILLARS[id].nameRu}
          >
            {PILLARS[id].icon}
          </button>
        ))}
      </div>
      <div className="hero-hub-chip-grid">
        {BRANCHES_BY_PILLAR[focus].map(branchId => {
          const branch = BRANCHES[branchId];
          return (
            <GCard
              key={branchId}
              onClick={() => onOpen(branchId)}
              className="hero-hub-chip"
            >
              <span>{branch.nameRu}</span>
              <GBadge variant="level" size="sm">{snapshot.state.branchRanks[branchId]}</GBadge>
            </GCard>
          );
        })}
      </div>
    </div>
  );
}

function GearModule({
  equipment, onOpen,
}: {
  equipment: Equipment;
  onOpen: (slot: EquipSlot) => void;
}) {
  return (
    <div className="hero-hub-module">
      <h2>На теле</h2>
      <p>Сумка отдельно. Здесь только то, что надето.</p>
      <div className="hero-hub-doll">
        <div />
        <GearCell equipment={equipment} slot="helm" onOpen={onOpen} />
        <div />
        <GearCell equipment={equipment} slot="cape" onOpen={onOpen} />
        <GearCell equipment={equipment} slot="amulet" onOpen={onOpen} />
        <GearCell equipment={equipment} slot="quiver" onOpen={onOpen} />
        <GearCell equipment={equipment} slot="weapon" onOpen={onOpen} />
        <GearCell equipment={equipment} slot="platebody" onOpen={onOpen} />
        <GearCell equipment={equipment} slot="shield" onOpen={onOpen} />
        <div />
        <GearCell equipment={equipment} slot="platelegs" onOpen={onOpen} />
        <div />
        <GearCell equipment={equipment} slot="gloves" onOpen={onOpen} />
        <GearCell equipment={equipment} slot="boots" onOpen={onOpen} />
        <GearCell equipment={equipment} slot="ring" onOpen={onOpen} />
        <div />
        <GearCell equipment={equipment} slot="passive" onOpen={onOpen} />
        <div />
      </div>
    </div>
  );
}

function GearCell({
  equipment, slot, onOpen,
}: {
  equipment: Equipment;
  slot: EquipSlot;
  onOpen: (slot: EquipSlot) => void;
}) {
  const itemId = equipment[slot];
  const item = itemId ? getItem(itemId) : undefined;
  const visual = itemId ? getItemVisual(itemId) : null;
  const glyph = visual?.type === 'emoji' ? visual.value : item?.icon;
  return (
    <button type="button" className="hero-hub-doll__cell" onClick={() => onOpen(slot)}>
      <span className={`hero-hub-doll__slot${itemId ? ' is-filled' : ''}`}>
        {visual?.type === 'image' ? (
          <img src={visual.value} alt="" />
        ) : (
          <em>{glyph ?? ''}</em>
        )}
      </span>
      <small>{slotLabel(slot)}</small>
    </button>
  );
}

function SynergiesModule({
  snapshot, onOpen,
}: {
  snapshot: ReturnType<typeof computeAttributeSnapshot>;
  onOpen: (id: SynergyId) => void;
}) {
  return (
    <div className="hero-hub-module">
      <h2>Нити</h2>
      <div className="hero-hub-chip-grid hero-hub-chip-grid--2">
        {SYNERGIES.map(synergy => {
          const on = snapshot.activeSynergies.includes(synergy.id);
          return (
            <GCard
              key={synergy.id}
              selected={on}
              onClick={() => onOpen(synergy.id)}
              className="hero-hub-chip"
            >
              <span>{synergy.nameRu}</span>
              <GBadge variant={on ? 'green' : 'gray'} size="sm">{on ? 'горит' : 'спит'}</GBadge>
            </GCard>
          );
        })}
      </div>
    </div>
  );
}

function PathModule({
  state,
  onRespec,
}: {
  state: ReturnType<typeof getLiveAttributes>;
  onRespec: () => void;
}) {
  const spent = spentPillarRanks(state) + spentBranchRanks(state);
  const left = remainingFreeRespecs(state);
  const canFree = spent > 0 && left > 0;
  return (
    <div className="hero-hub-module">
      <h2>Путь</h2>
      <p>Уровень героя растёт от всей жизни. Кривую XP не рисуем — она ещё не закрыта.</p>
      <div className="hero-hub-path-grid">
        <div><span>Уровень</span><b>{state.heroLevel}</b></div>
        <div><span>Сброс</span><b>{left} / {FREE_RESPEC_LIMIT}</b></div>
      </div>
      <GButton
        variant="secondary"
        size="sm"
        fullWidth
        disabled={!canFree}
        onClick={onRespec}
      >
        {left < 1
          ? 'Следующий сброс — за золото (цена не назначена)'
          : spent === 0
            ? 'Сбрасывать нечего'
            : `Бесплатный сброс (${left} из ${FREE_RESPEC_LIMIT})`}
      </GButton>
    </div>
  );
}

function HeroDetailModal({
  detail, raceId, snapshot, equipment,
  canSpendPillar, canSpendBranch,
  onClose, onSpendPillar, onSpendBranch,
}: {
  detail: Detail | null;
  raceId: RaceId;
  snapshot: ReturnType<typeof computeAttributeSnapshot>;
  equipment: Equipment;
  canSpendPillar: boolean;
  canSpendBranch: boolean;
  onClose: () => void;
  onSpendPillar: (id: PillarId) => void;
  onSpendBranch: (id: BranchId) => void;
}) {
  const unequip = usePlayerStore(s => s.unequipItem);
  const addItem = useInventoryStore(s => s.addItem);
  const title = !detail
    ? ''
    : detail.kind === 'pillar' ? PILLARS[detail.id].nameRu
      : detail.kind === 'branch' ? BRANCHES[detail.id].nameRu
        : detail.kind === 'synergy' ? (SYNERGIES.find(s => s.id === detail.id)?.nameRu ?? '')
          : slotLabel(detail.slot);

  const gearItemId = detail?.kind === 'gear' ? equipment[detail.slot] : null;
  const gearItem = gearItemId ? getItem(gearItemId) : undefined;

  const handleUnequip = () => {
    if (!detail || detail.kind !== 'gear' || !gearItemId) return;
    const removed = unequip(detail.slot);
    if (removed) addItem(removed, 1);
    onClose();
  };

  return (
    <GModal open={Boolean(detail)} onClose={onClose} title={title} width={340}>
      {detail?.kind === 'pillar' && (
        <div className="hero-hub-modal">
          <p>{PILLARS[detail.id].childRu}</p>
          <GInfoRow label="Итог" value={signed(snapshot.finalPillars[detail.id])} />
          <GInfoRow label="Тело" value={signed(snapshot.racialImprint[detail.id])} />
          <GInfoRow label="Вложил" value={String(snapshot.state.pillarRanks[detail.id])} />
          <p>{RACE_BODY_CHILD_RU[raceId]}</p>
          <p>Пассив «{RACE_PASSIVES[raceId].nameRu}»: {RACE_PASSIVES[raceId].childRu}</p>
          <GButton
            size="sm"
            fullWidth
            disabled={!canSpendPillar}
            onClick={() => onSpendPillar(detail.id)}
          >
            {canSpendPillar ? 'Положить очко столпа' : 'Очков столпа пока нет'}
          </GButton>
        </div>
      )}
      {detail?.kind === 'branch' && (
        <div className="hero-hub-modal">
          <p>{BRANCHES[detail.id].childRu}</p>
          <GInfoRow label="Ранг" value={String(snapshot.state.branchRanks[detail.id])} />
          <GButton
            size="sm"
            fullWidth
            disabled={!canSpendBranch}
            onClick={() => onSpendBranch(detail.id)}
          >
            {canSpendBranch ? 'Положить очко ветви' : 'Первое очко ветви — на 5-м уровне'}
          </GButton>
        </div>
      )}
      {detail?.kind === 'synergy' && (() => {
        const synergy = SYNERGIES.find(s => s.id === detail.id);
        if (!synergy) return null;
        const on = snapshot.activeSynergies.includes(synergy.id);
        const missing = Object.entries(synergy.requires)
          .filter(([id, need]) => snapshot.finalPillars[id as PillarId] < (need ?? 0));
        return (
          <div className="hero-hub-modal">
            <GBadge variant={on ? 'green' : 'gray'}>{on ? 'горит' : 'спит'}</GBadge>
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
              <GTag>{gearItem.name}</GTag>
              {gearItem.combatStats?.attackBonus != null && (
                <GInfoRow label="Атака" value={`+${gearItem.combatStats.attackBonus}`} />
              )}
              {gearItem.combatStats?.strengthBonus != null && (
                <GInfoRow label="Сила" value={`+${gearItem.combatStats.strengthBonus}`} />
              )}
              {gearItem.combatStats?.defenceBonus != null && (
                <GInfoRow label="Защита" value={`+${gearItem.combatStats.defenceBonus}`} />
              )}
              <GButton size="sm" fullWidth variant="secondary" onClick={handleUnequip}>
                Снять в сумку
              </GButton>
            </>
          ) : (
            <p>Слот пуст. Надеть можно из сумки.</p>
          )}
        </div>
      )}
    </GModal>
  );
}

export default HeroHubPage;
