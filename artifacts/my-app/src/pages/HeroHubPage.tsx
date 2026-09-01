import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import {
  GAvatar, GBadge, GButton, GEmptyState, GInfoRow, GModal, GSlot, GTag,
} from '@/shared/ui/gameUI';
import { useAuthStore } from '@/store/authStore';
import { useCharacterStore } from '@/store/characterStore';
import { usePlayerStore } from '@/store/playerStore';
import { getAvatarPath, getRaceLabel, type RaceId } from '@/data/characters';
import {
  BRANCHES,
  PILLAR_OF_BRANCH,
  PILLARS,
  type BranchId,
  type PillarId,
} from '@/data/attributes';
import {
  EQUIP_SLOT_ICON,
  HUB_NAV_ICON,
  SYNERGY_ICON,
} from '@/data/attributeIcons';
import { SYNERGIES, type SynergyId } from '@/data/synergies';
import { getItem } from '@/data/items';
import type { EquipSlot, Equipment } from '@/data/types';
import { getItemVisual } from '@/shared/icons/itemIcons';
import {
  FREE_RESPEC_LIMIT,
  computeAttributeSnapshot,
  getLiveAttributes,
  remainingFreeRespecs,
  respecBranchRanks,
  respecPillarRanks,
  spendBranchPoint,
  spendPillarPoint,
  spentBranchRanks,
  spentPillarRanks,
} from '@/lib/characterAttributes';
import { commitHeroAttributes } from '@/lib/heroPersist';
import { HeroBoard } from '@/components/HeroBoard';

type HubModule = 'body' | 'gear' | 'synergies' | 'path';
type GearSet = 'armor' | 'jewels' | 'hands';
type Detail =
  | { kind: 'pillar'; id: PillarId }
  | { kind: 'branch'; id: BranchId }
  | { kind: 'synergy'; id: SynergyId }
  | { kind: 'gear'; slot: EquipSlot };

const TILE = 48;
const PORTRAIT = 64;

const MODULES: { id: HubModule; label: string }[] = [
  { id: 'body', label: 'Тело' },
  { id: 'gear', label: 'Экип' },
  { id: 'synergies', label: 'Нити' },
  { id: 'path', label: 'Путь' },
];

const GEAR_SETS: { id: GearSet; label: string }[] = [
  { id: 'armor', label: 'Броня' },
  { id: 'jewels', label: 'Украшения' },
  { id: 'hands', label: 'Руки' },
];

const GEAR_BY_SET: Record<GearSet, { slot: EquipSlot; label: string }[]> = {
  armor: [
    { slot: 'helm', label: 'Шлем' },
    { slot: 'platebody', label: 'Торс' },
    { slot: 'belt', label: 'Пояс' },
    { slot: 'gloves', label: 'Перчатки' },
    { slot: 'platelegs', label: 'Штаны' },
    { slot: 'boots', label: 'Обувь' },
  ],
  jewels: [
    { slot: 'amulet', label: 'Ожерелье' },
    { slot: 'ring', label: 'Кольцо' },
    { slot: 'ring2', label: 'Кольцо' },
    { slot: 'bracelet', label: 'Браслет' },
    { slot: 'bracelet2', label: 'Браслет' },
  ],
  hands: [
    { slot: 'weapon', label: 'Правая' },
    { slot: 'shield', label: 'Левая' },
  ],
};

const GEAR_LABEL: Record<EquipSlot, string> = {
  helm: 'Шлем',
  platebody: 'Торс',
  platelegs: 'Штаны',
  boots: 'Обувь',
  gloves: 'Перчатки',
  amulet: 'Ожерелье',
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
            title={`Очки столпов: ${state.unspentPillarPoints}`}
          >
            <img src={HUB_NAV_ICON.body} alt="" decoding="async" />
            <b>{state.unspentPillarPoints}</b>
          </span>
          <span
            className="hero-point"
            data-ready={state.unspentBranchPoints > 0 ? 'true' : 'false'}
            title={`Очки ветвей: ${state.unspentBranchPoints}`}
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
        {moduleId === 'body' && (
          <BodyModule
            snapshot={snapshot}
            canSpendBranch={state.unspentBranchPoints > 0}
            onOpenPillar={id => setDetail({ kind: 'pillar', id })}
            onOpenBranch={id => setDetail({ kind: 'branch', id })}
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
        {moduleId === 'path' && <PathModule snapshot={snapshot} />}
      </div>

      <HeroSettingsModal
        open={settingsOpen}
        state={state}
        onClose={() => setSettingsOpen(false)}
        onRespecPillars={() => applyState(respecPillarRanks(state))}
        onRespecBranches={() => applyState(respecBranchRanks(state))}
      />

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
  snapshot, canSpendBranch, onOpenPillar, onOpenBranch,
}: {
  snapshot: ReturnType<typeof computeAttributeSnapshot>;
  canSpendBranch: boolean;
  onOpenPillar: (id: PillarId) => void;
  onOpenBranch: (id: BranchId) => void;
}) {
  return (
    <HeroBoard
      snapshot={snapshot}
      canSpendBranch={canSpendBranch}
      onOpenPillar={onOpenPillar}
      onOpenBranch={onOpenBranch}
    />
  );
}

function GearModule({
  equipment, onOpen,
}: {
  equipment: Equipment;
  onOpen: (slot: EquipSlot) => void;
}) {
  const [setId, setSetId] = useState<GearSet>('armor');
  const twoHand = isTwoHanded(equipment.weapon);

  return (
    <div className="hero-sheet">
      <div className="hero-gear-tabs" role="tablist" aria-label="Наборы экипа">
        {GEAR_SETS.map(set => (
          <button
            key={set.id}
            type="button"
            role="tab"
            aria-selected={setId === set.id}
            className={setId === set.id ? 'hero-hub__tab is-on' : 'hero-hub__tab'}
            onClick={() => setSetId(set.id)}
          >
            {set.label}
          </button>
        ))}
      </div>
      <div className={setId === 'hands' ? 'hero-gear-grid hero-gear-grid--hands' : 'hero-gear-grid'}>
        {GEAR_BY_SET[setId].map(({ slot, label }) => {
          const ghostLeft = slot === 'shield' && twoHand;
          const itemId = ghostLeft ? equipment.weapon : equipment[slot];
          const visual = slotVisual(itemId, slot);
          const openSlot: EquipSlot = ghostLeft ? 'weapon' : slot;
          return (
            <GSlot
              key={slot}
              src={visual.src}
              emoji={visual.emoji}
              size={TILE}
              selected={Boolean(itemId) && !ghostLeft}
              dimmed={ghostLeft}
              label={label}
              title={ghostLeft ? `${label} · двуручное` : label}
              onClick={() => onOpen(openSlot)}
            />
          );
        })}
      </div>
    </div>
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
        <div><span>Ветви</span><b>{spentB} / {snapshot.earnedBranchPoints}</b></div>
        <div><span>Сброс</span><b>{left} / {FREE_RESPEC_LIMIT}</b></div>
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
            ? 'Сброс ветвей — золото (цена не назначена)'
            : spentB === 0
              ? 'Ветви: сбрасывать нечего'
              : 'Сбросить очки ветвей'}
        </GButton>
      </div>
    </GModal>
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
  const title = !detail
    ? ''
    : detail.kind === 'pillar' ? PILLARS[detail.id].nameRu
      : detail.kind === 'branch' ? BRANCHES[detail.id].nameRu
        : detail.kind === 'synergy' ? (SYNERGIES.find(s => s.id === detail.id)?.nameRu ?? '')
          : GEAR_LABEL[detail.slot];

  const gearItemId = detail?.kind === 'gear' ? equipment[detail.slot] : null;
  const gearItem = gearItemId ? getItem(gearItemId) : undefined;
  const twoHand = detail?.kind === 'gear' && detail.slot === 'weapon' && isTwoHanded(gearItemId);

  const handleUnequip = () => {
    if (!detail || detail.kind !== 'gear' || !gearItemId) return;
    const removed = unequip(detail.slot);
    if (removed) onClose();
  };

  return (
    <GModal open={Boolean(detail)} onClose={onClose} title={title} width={340}>
      {detail?.kind === 'pillar' && (() => {
        const into = snapshot.state.pillarRanks[detail.id];
        const fromBranches = snapshot.invested[detail.id] - into;
        const raceN = shownStat(snapshot.racialImprint[detail.id]);
        const jobN = shownStat(snapshot.professionBonus[detail.id]);
        const total = shownStat(snapshot.finalPillars[detail.id]);
        return (
          <div className="hero-hub-modal">
            <p>{PILLARS[detail.id].childRu}</p>
            <GInfoRow label={PILLARS[detail.id].nameRu} value={String(total)} />
            <GInfoRow label="Раса" value={signedStat(raceN)} />
            <GInfoRow label="Вложил" value={signedStat(into)} />
            <GInfoRow label="Ветви" value={signedStat(fromBranches)} />
            {jobN !== 0 && <GInfoRow label="Ремесло" value={signedStat(jobN)} />}
            <GButton
              size="sm"
              fullWidth
              disabled={!canSpendPillar}
              onClick={() => onSpendPillar(detail.id)}
            >
              {canSpendPillar ? 'Положить очко столпа' : 'Очков столпа пока нет'}
            </GButton>
          </div>
        );
      })()}
      {detail?.kind === 'branch' && (() => {
        const rank = snapshot.state.branchRanks[detail.id] || 0;
        const pillar = PILLAR_OF_BRANCH[detail.id];
        return (
          <div className="hero-hub-modal">
            <p>{BRANCHES[detail.id].childRu}</p>
            <GInfoRow label="Ранг" value={String(rank)} />
            <GInfoRow label={`К ${PILLARS[pillar].nameRu}`} value={signedStat(rank)} />
            <GButton
              size="sm"
              fullWidth
              disabled={!canSpendBranch}
              onClick={() => onSpendBranch(detail.id)}
            >
              {canSpendBranch ? 'Положить очко ветви' : 'Первое очко ветви — на 5-м уровне'}
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
          <div className="hero-hub-modal">
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
              <GTag>{gearItem.name}</GTag>
              {twoHand && <p>Двуручное: занимает обе руки.</p>}
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
