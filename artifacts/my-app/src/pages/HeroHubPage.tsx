import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import {
  GAvatar, GBadge, GButton, GEmptyState, GInfoRow, GModal, GSlot, GTag,
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
  type BranchId,
  type PillarId,
} from '@/data/attributes';
import {
  BRANCH_ICON,
  EQUIP_SLOT_ICON,
  HUB_NAV_ICON,
  PILLAR_ICON,
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

const TILE = 48;
const PORTRAIT = 96;

const MODULES: { id: HubModule; label: string }[] = [
  { id: 'body', label: 'Тело' },
  { id: 'branches', label: 'Ветви' },
  { id: 'gear', label: 'Экип' },
  { id: 'synergies', label: 'Нити' },
  { id: 'path', label: 'Путь' },
];

const GEAR_LAYOUT: (EquipSlot | null)[] = [
  null, 'helm', null,
  'cape', 'amulet', 'quiver',
  'weapon', 'platebody', 'shield',
  null, 'platelegs', null,
  'gloves', 'boots', 'ring',
  null, 'passive', null,
];

const GEAR_LABEL: Record<EquipSlot, string> = {
  helm: 'Шлем',
  cape: 'Плащ',
  amulet: 'Шея',
  quiver: 'Колчан',
  weapon: 'Оружие',
  platebody: 'Доспех',
  shield: 'Щит',
  platelegs: 'Поножи',
  gloves: 'Перчатки',
  boots: 'Сапоги',
  ring: 'Кольцо',
  passive: 'Талисман',
};

function signed(value: number): string {
  const rounded = Math.round(value);
  if (rounded > 0) return `+${rounded}`;
  if (rounded < 0) return `−${Math.abs(rounded)}`;
  return '0';
}

export function HeroHubPage() {
  const [, navigate] = useLocation();
  const isGuest = useAuthStore(s => s.isGuest);
  const active = useCharacterStore(s => s.activeCharacter);
  const equipment = usePlayerStore(s => s.equipment);
  const [moduleId, setModuleId] = useState<HubModule>('body');
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

  const pane = MODULES.find(mod => mod.id === moduleId);

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
        <GAvatar src={getAvatarPath(active.avatarId)} size={36} />
        <div className="hero-hub__identity">
          <strong>{active.nickname}</strong>
          <p>{getRaceLabel(raceId, 'ru')} · ур. {state.heroLevel}</p>
        </div>
        <div className="hero-hub__wallets">
          <GBadge variant="gold" size="sm">Столп {state.unspentPillarPoints}</GBadge>
          <GBadge variant="purple" size="sm">Ветвь {state.unspentBranchPoints}</GBadge>
        </div>
      </header>

      <div className="hero-hub__body">
        <div className="hero-hub__data">
          <h2 className="hero-hub__pane-title">{pane?.label}</h2>
          {moduleId === 'body' && (
            <BodyModule
              avatarSrc={getAvatarPath(active.avatarId)}
              snapshot={snapshot}
              onOpen={id => setDetail({ kind: 'pillar', id })}
            />
          )}
          {moduleId === 'branches' && (
            <BranchesModule
              snapshot={snapshot}
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
          {moduleId === 'path' && (
            <PathModule
              state={state}
              onRespec={() => applyState(respecAttributes(state))}
            />
          )}
        </div>

        <nav className="hero-hub__rail" aria-label="Разделы героя">
          {MODULES.map(mod => (
            <GSlot
              key={mod.id}
              src={HUB_NAV_ICON[mod.id]}
              size={TILE}
              selected={moduleId === mod.id}
              label={mod.label}
              title={mod.label}
              onClick={() => setModuleId(mod.id)}
            />
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
  avatarSrc, snapshot, onOpen,
}: {
  avatarSrc: string;
  snapshot: ReturnType<typeof computeAttributeSnapshot>;
  onOpen: (id: PillarId) => void;
}) {
  return (
    <div className="hero-hub-module">
      <div className="hero-hub-dial" aria-label="Столпы вокруг тела">
        <div className="hero-hub-dial__n">
          <GSlot
            src={PILLAR_ICON.fortitude}
            size={TILE}
            badge={signed(snapshot.finalPillars.fortitude)}
            title={PILLARS.fortitude.nameRu}
            onClick={() => onOpen('fortitude')}
          />
        </div>
        <div className="hero-hub-dial__w">
          <GSlot
            src={PILLAR_ICON.instinct}
            size={TILE}
            badge={signed(snapshot.finalPillars.instinct)}
            title={PILLARS.instinct.nameRu}
            onClick={() => onOpen('instinct')}
          />
        </div>
        <div className="hero-hub-dial__c">
          <GAvatar src={avatarSrc} size={PORTRAIT} glow />
        </div>
        <div className="hero-hub-dial__e">
          <GSlot
            src={PILLAR_ICON.might}
            size={TILE}
            badge={signed(snapshot.finalPillars.might)}
            title={PILLARS.might.nameRu}
            onClick={() => onOpen('might')}
          />
        </div>
        <div className="hero-hub-dial__s">
          <GSlot
            src={PILLAR_ICON.finesse}
            size={TILE}
            badge={signed(snapshot.finalPillars.finesse)}
            title={PILLARS.finesse.nameRu}
            onClick={() => onOpen('finesse')}
          />
        </div>
      </div>
    </div>
  );
}

function BranchesModule({
  snapshot, onOpenPillar, onOpenBranch,
}: {
  snapshot: ReturnType<typeof computeAttributeSnapshot>;
  onOpenPillar: (id: PillarId) => void;
  onOpenBranch: (id: BranchId) => void;
}) {
  return (
    <div className="hero-hub-module">
      <div className="hero-hub-web">
        {PILLAR_IDS.map(pillar => (
          <div key={pillar} className="hero-hub-cluster">
            <GSlot
              src={PILLAR_ICON[pillar]}
              size={TILE}
              selected
              badge={signed(snapshot.finalPillars[pillar])}
              title={PILLARS[pillar].nameRu}
              onClick={() => onOpenPillar(pillar)}
            />
            {BRANCHES_BY_PILLAR[pillar].map(branchId => (
              <GSlot
                key={branchId}
                src={BRANCH_ICON[branchId]}
                size={TILE}
                badge={snapshot.state.branchRanks[branchId] || undefined}
                title={BRANCHES[branchId].nameRu}
                onClick={() => onOpenBranch(branchId)}
              />
            ))}
          </div>
        ))}
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
      <div className="hero-hub-doll">
        {GEAR_LAYOUT.map((slot, i) => {
          if (!slot) return <div key={`e${i}`} className="hero-hub-doll__pad" />;
          const itemId = equipment[slot];
          const visual = itemId ? getItemVisual(itemId) : null;
          return (
            <GSlot
              key={slot}
              src={visual?.type === 'image' ? visual.value : itemId ? undefined : EQUIP_SLOT_ICON[slot]}
              emoji={visual?.type === 'emoji' ? visual.value : undefined}
              size={TILE}
              frame={itemId ? 'active' : 'empty'}
              title={GEAR_LABEL[slot]}
              onClick={() => onOpen(slot)}
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
    <div className="hero-hub-module">
      <div className="hero-hub-syn">
        {SYNERGIES.map(synergy => {
          const on = snapshot.activeSynergies.includes(synergy.id);
          return (
            <GSlot
              key={synergy.id}
              src={SYNERGY_ICON[synergy.id]}
              size={TILE}
              selected={on}
              badge={on ? '•' : undefined}
              title={synergy.nameRu}
              onClick={() => onOpen(synergy.id)}
            />
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
      <div className="hero-hub-path-grid">
        <div><span>Уровень</span><b>{state.heroLevel}</b></div>
        <div><span>Сброс</span><b>{left} / {FREE_RESPEC_LIMIT}</b></div>
      </div>
      <GButton
        variant="secondary"
        size="sm"
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
          : GEAR_LABEL[detail.slot];

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
