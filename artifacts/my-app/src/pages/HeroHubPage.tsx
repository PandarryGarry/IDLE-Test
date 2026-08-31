import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import {
  GAvatar, GBadge, GButton, GCard, GDivider, GEmptyState, GTag,
} from '@/shared/ui/gameUI';
import { useAuthStore } from '@/store/authStore';
import { useCharacterStore } from '@/store/characterStore';
import { usePlayerStore } from '@/store/playerStore';
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
import { SYNERGIES } from '@/data/synergies';
import { getItem } from '@/data/items';
import type { EquipSlot } from '@/data/types';
import {
  computeAttributeSnapshot,
  getLiveAttributes,
  respecAttributes,
  spendBranchPoint,
  spendPillarPoint,
  spentBranchRanks,
  spentPillarRanks,
} from '@/lib/characterAttributes';
import { commitHeroAttributes } from '@/lib/heroPersist';

type HubModule = 'body' | 'branches' | 'gear' | 'synergies' | 'path';

const MODULES: { id: HubModule; icon: string; label: string }[] = [
  { id: 'body', icon: '🛡', label: 'Тело' },
  { id: 'branches', icon: '🌿', label: 'Ветви' },
  { id: 'gear', icon: '⚔', label: 'Снаряжение' },
  { id: 'synergies', icon: '⚡', label: 'Синергии' },
  { id: 'path', icon: '✦', label: 'Путь' },
];

const GEAR_SLOTS: { slot: EquipSlot; label: string }[] = [
  { slot: 'helm', label: 'Шлем' },
  { slot: 'amulet', label: 'Амулет' },
  { slot: 'cape', label: 'Плащ' },
  { slot: 'weapon', label: 'Оружие' },
  { slot: 'platebody', label: 'Доспех' },
  { slot: 'shield', label: 'Щит' },
  { slot: 'gloves', label: 'Перчатки' },
  { slot: 'platelegs', label: 'Поножи' },
  { slot: 'boots', label: 'Сапоги' },
  { slot: 'ring', label: 'Кольцо' },
  { slot: 'quiver', label: 'Колчан' },
  { slot: 'passive', label: 'Талисман' },
];

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
  const [focusPillar, setFocusPillar] = useState<PillarId>('fortitude');
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
          title="Зеркало ложи закрыто"
          description="Герой живёт на аккаунте. Войди — и тело, ветви и путь будут здесь."
          action={{ label: 'К огню таверны', onClick: () => navigate('/login') }}
        />
      </div>
    );
  }

  return (
    <section className="hero-hub" aria-label="Герой">
      <header className="hero-hub__header">
        <GAvatar src={getAvatarPath(active.avatarId)} size={56} glow />
        <div className="hero-hub__identity">
          <span className="hero-hub__eyebrow">У зеркала ложи</span>
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
              canSpend={state.unspentPillarPoints > 0}
              onFocus={setFocusPillar}
              onSpend={pillar => applyState(spendPillarPoint(state, pillar))}
            />
          )}
          {moduleId === 'branches' && (
            <BranchesModule
              snapshot={snapshot}
              focus={focusPillar}
              canSpend={state.unspentBranchPoints > 0}
              onFocus={setFocusPillar}
              onSpend={branch => applyState(spendBranchPoint(state, branch))}
            />
          )}
          {moduleId === 'gear' && <GearModule equipment={equipment} />}
          {moduleId === 'synergies' && <SynergiesModule snapshot={snapshot} />}
          {moduleId === 'path' && (
            <PathModule
              state={state}
              onRespec={() => applyState(respecAttributes(state))}
            />
          )}
        </div>

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
                    if (moduleId !== 'branches') setModuleId('body');
                  }}
                  aria-label={PILLARS[id].nameRu}
                >
                  <span>{PILLARS[id].icon}</span>
                  <b>{signed(snapshot.finalPillars[id])}</b>
                </button>
              );
            })}
            <div className="hero-hub__portrait">
              <GAvatar src={getAvatarPath(active.avatarId)} size={168} glow borderColor="var(--border-accent)" />
            </div>
          </div>
          <p className="hero-hub__stage-copy">
            {snapshot.nextSynergy
              ? `Дальше: ${snapshot.nextSynergy.nameRu}`
              : snapshot.activeSynergies.length
                ? 'Все доступные нити зажжены.'
                : 'Нити синергий ещё спят.'}
          </p>
        </div>

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
    </section>
  );
}

function BodyModule({
  raceId, snapshot, focus, canSpend, onFocus, onSpend,
}: {
  raceId: RaceId;
  snapshot: ReturnType<typeof computeAttributeSnapshot>;
  focus: PillarId;
  canSpend: boolean;
  onFocus: (id: PillarId) => void;
  onSpend: (id: PillarId) => void;
}) {
  const mods = RACE_PILLAR_MODS[raceId];
  const passive = RACE_PASSIVES[raceId];
  return (
    <div className="hero-hub-module">
      <h2>Четыре столпа</h2>
      <p>{PILLARS[focus].childRu}</p>
      <div className="hero-hub-pillars">
        {PILLAR_IDS.map(id => {
          const pillar = PILLARS[id];
          const active = focus === id;
          return (
            <GCard
              key={id}
              selected={active}
              onClick={() => onFocus(id)}
              className="hero-hub-pillar"
              style={{ padding: '0.7rem' }}
            >
              <div className="hero-hub-pillar__top">
                <strong>{pillar.icon} {pillar.nameRu}</strong>
                <b>{signed(snapshot.finalPillars[id])}</b>
              </div>
              <div className="hero-hub-pillar__src">
                <GTag color="gold">тело {signed(snapshot.racialImprint[id])}</GTag>
                <GTag color="brown">вложил {snapshot.state.pillarRanks[id]}</GTag>
              </div>
              {active && (
                <GButton
                  size="sm"
                  fullWidth
                  disabled={!canSpend}
                  onClick={() => onSpend(id)}
                >
                  {canSpend ? 'Положить очко столпа' : 'Очков столпа пока нет'}
                </GButton>
              )}
            </GCard>
          );
        })}
      </div>
      <GDivider label="Наследие" />
      <div className="hero-hub-legacy">
        <div className="hero-hub-legacy__mods">
          {mods.map(mod => (
            <GBadge key={mod.pillar} variant={mod.percent > 0 ? 'green' : 'red'} size="sm">
              {PILLARS[mod.pillar].nameRu} {mod.percent > 0 ? '+' : '−'}{Math.abs(mod.percent)}%
            </GBadge>
          ))}
        </div>
        <p>{RACE_BODY_CHILD_RU[raceId]}</p>
        <p>
          Пассив «{passive.nameRu}»: {passive.childRu} {passive.whenRu}
        </p>
      </div>
    </div>
  );
}

function BranchesModule({
  snapshot, focus, canSpend, onFocus, onSpend,
}: {
  snapshot: ReturnType<typeof computeAttributeSnapshot>;
  focus: PillarId;
  canSpend: boolean;
  onFocus: (id: PillarId) => void;
  onSpend: (id: BranchId) => void;
}) {
  return (
    <div className="hero-hub-module">
      <h2>Ветви · {PILLARS[focus].nameRu}</h2>
      <p>Раз в пять уровней выбираешь, чем именно ты хорош. Паутину не рисуем — пока список.</p>
      <div className="hero-hub-pillar-tabs">
        {PILLAR_IDS.map(id => (
          <button
            key={id}
            type="button"
            className={focus === id ? 'is-active' : ''}
            onClick={() => onFocus(id)}
          >
            {PILLARS[id].icon}
          </button>
        ))}
      </div>
      {BRANCHES_BY_PILLAR[focus].map(branchId => {
        const branch = BRANCHES[branchId];
        return (
          <GCard key={branchId} className="hero-hub-branch" style={{ padding: '0.75rem' }}>
            <div className="hero-hub-pillar__top">
              <strong>{branch.nameRu}</strong>
              <GBadge variant="level">{snapshot.state.branchRanks[branchId]}</GBadge>
            </div>
            <p>{branch.childRu}</p>
            <GButton size="sm" fullWidth disabled={!canSpend} onClick={() => onSpend(branchId)}>
              {canSpend ? 'Положить очко ветви' : 'Первое очко ветви — на 5-м уровне'}
            </GButton>
          </GCard>
        );
      })}
    </div>
  );
}

function GearModule({ equipment }: { equipment: Record<EquipSlot, string | null> }) {
  return (
    <div className="hero-hub-module">
      <h2>На теле</h2>
      <p>Сумка живёт отдельно. Здесь только то, что надето.</p>
      <div className="hero-hub-gear">
        {GEAR_SLOTS.map(({ slot, label }) => {
          const itemId = equipment[slot];
          const item = itemId ? getItem(itemId) : undefined;
          return (
            <div key={slot} className="hero-hub-gear__row">
              <span>{label}</span>
              <strong>{item?.name ?? 'пусто'}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SynergiesModule({ snapshot }: { snapshot: ReturnType<typeof computeAttributeSnapshot> }) {
  return (
    <div className="hero-hub-module">
      <h2>Нити</h2>
      <p>Синергия не меняет число столпа. Она живёт между двумя камнями.</p>
      {SYNERGIES.map(synergy => {
        const on = snapshot.activeSynergies.includes(synergy.id);
        const missing = !on
          ? Object.entries(synergy.requires).filter(([id, need]) => snapshot.finalPillars[id as PillarId] < (need ?? 0))
          : [];
        return (
          <GCard key={synergy.id} selected={on} className="hero-hub-synergy" hoverEffect={false} style={{ padding: '0.75rem' }}>
            <div className="hero-hub-pillar__top">
              <strong>{synergy.nameRu}</strong>
              <GBadge variant={on ? 'green' : 'gray'}>{on ? 'горит' : 'спит'}</GBadge>
            </div>
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
          </GCard>
        );
      })}
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
  const canFree = spent > 0 && !state.freeRespecUsed;
  return (
    <div className="hero-hub-module">
      <h2>Путь</h2>
      <p>Уровень героя растёт от всей жизни, не от «боевого Lvl». Кривая XP ещё не закрыта — полосы не рисуем.</p>
      <div className="hero-hub-path-grid">
        <div><span>Уровень</span><b>{state.heroLevel}</b></div>
        <div><span>Очко столпа</span><b>+1 за уровень</b></div>
        <div><span>Очко ветви</span><b>+1 / 5 ур.</b></div>
        <div><span>Свободный сброс</span><b>{state.freeRespecUsed ? 'уже был' : 'ещё есть'}</b></div>
      </div>
      <GButton
        variant="secondary"
        fullWidth
        disabled={!canFree}
        onClick={onRespec}
      >
        {state.freeRespecUsed
          ? 'Следующий сброс — за золото (цена не назначена)'
          : spent === 0
            ? 'Сбрасывать нечего'
            : 'Бесплатный сброс очков'}
      </GButton>
      <p>Энергия и репутация появятся, когда заживёт поход. Здесь их не обещаем.</p>
    </div>
  );
}

export default HeroHubPage;
