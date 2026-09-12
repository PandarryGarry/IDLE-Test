import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'wouter';
import { useShallow } from 'zustand/react/shallow';
import { liveCombatSnapshot, useCombatStore, type CombatEnemy, type CombatLogEntry } from '@/store/combatStore';
import { usePlayerStore } from '@/store/playerStore';
import { useCharacterStore } from '@/store/characterStore';
import { getLiveAttributes } from '@/domain/attributes/characterAttributes';
import { COMBAT_AREAS, MONSTERS_MAP, monsterIconPath } from '@/domain/combat/monsters';
import { ItemIcon } from '@/features/inventory/ItemIcon';
import { useInventoryStore } from '@/store/inventoryStore';
import { getItem } from '@/domain/items';
import type { Monster } from '@/data/types';
import { useTranslation } from '@/hooks/useTranslation';
import { iconUrl } from '@/lib/assetUrl';
import { formatNumber } from '@/lib/utils';
import { COMBAT_ENERGY, COMBAT_RISK, COMBAT_STRATEGIES } from '@/data/balance/combat';
import type { CombatStrategyId, CombatTacticId, FighterCombatStats, TargetPriority } from '@/domain/combat/combatModel';
import {
  Activity,
  Backpack,
  BookOpen,
  Bot,
  ChevronRight,
  Crosshair,
  Flag,
  Heart,
  History,
  Shield,
  Skull,
  Sparkles,
  Square,
  Sword,
  Timer,
  Utensils,
  Zap,
} from 'lucide-react';

const TACTIC_META: { id: CombatTacticId; icon: React.ReactNode; title: string; hint: string }[] = [
  { id: 'guard', icon: <Shield aria-hidden="true" />, title: 'Щит', hint: 'Срезает следующий опасный удар. Автоплан тратит его под тяжёлый телеграф.' },
  { id: 'maneuver', icon: <Zap aria-hidden="true" />, title: 'Манёвр', hint: 'Поднимает уворот на короткое окно и спасает от серии.' },
  { id: 'technique', icon: <Sword aria-hidden="true" />, title: 'Приём', hint: 'Мгновенный точный удар для добивания цели.' },
  { id: 'pierce', icon: <Crosshair aria-hidden="true" />, title: 'Пробой', hint: 'Мгновенный удар с игнором брони против стойких врагов.' },
];

const PRIORITIES: { id: TargetPriority; label: string; hint: string }[] = [
  { id: 'dangerous', label: 'Опасный', hint: 'Сначала враг с самым тяжёлым ближайшим таймером.' },
  { id: 'weakest', label: 'Слабый', hint: 'Быстро снимает лишние таймеры со стаи.' },
  { id: 'armored', label: 'Броня', hint: 'Фокус стойких целей, хорошо с Пробоем.' },
  { id: 'nearest', label: 'Ряд', hint: 'Бьёт слева направо без умного выбора.' },
  { id: 'auto', label: 'Авто', hint: 'Командирский выбор по угрозе и окнам.' },
];

const TRAIT_LABEL: Record<string, string> = {
  swift: 'быстрый',
  armored: 'броня',
  evasive: 'уход',
  venom: 'яд',
  pack: 'стая',
  boss: 'босс',
  elite: 'элита',
};

const ROLE_LABEL: Record<string, string> = {
  fodder: 'учебный',
  skirmisher: 'налётчик',
  bruiser: 'громила',
  sentinel: 'страж',
  controller: 'контроль',
  boss: 'босс',
};

type CombatScreenId = 'arena' | 'hunt' | 'bestiary' | 'report';

const COMBAT_SCREENS: { id: CombatScreenId; label: string; hint: string; icon: React.ReactNode }[] = [
  { id: 'arena', label: 'Арена', hint: 'Живой бой и ручные команды', icon: <Sword aria-hidden="true" /> },
  { id: 'hunt', label: 'Охота', hint: 'Район, цель, добыча и запас энергии', icon: <Flag aria-hidden="true" /> },
  { id: 'bestiary', label: 'Бестиарий', hint: 'Характеристики, роли и способности мобов', icon: <BookOpen aria-hidden="true" /> },
  { id: 'report', label: 'Отчёт', hint: 'Итоги последней вылазки', icon: <History aria-hidden="true" /> },
];

function pct(current: number, max: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.max(0, Math.min(100, (current / max) * 100));
}

function barStyle(value: number): React.CSSProperties {
  return { '--combat-bar': `${Math.max(0, Math.min(100, value))}%` } as React.CSSProperties;
}

function markerStyle(value: number): React.CSSProperties {
  return { '--combat-marker': `${Math.max(0, Math.min(100, value))}%` } as React.CSSProperties;
}

function seconds(ms: number): string {
  if (ms <= 0) return 'готово';
  return `${Math.ceil(ms / 1000)}с`;
}

function shortDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return min > 0 ? `${min}м ${sec}с` : `${sec}с`;
}

function riskClass(label?: string): string {
  if (label === 'safe') return 'is-safe';
  if (label === 'tense') return 'is-tense';
  if (label === 'danger') return 'is-danger';
  return '';
}

function progressToReady(timer: number, interval: number): number {
  if (interval <= 0) return 0;
  return 100 - pct(timer, interval);
}

function aliveEnemies(enemies: CombatEnemy[]): CombatEnemy[] {
  return enemies.filter(e => e.alive && e.hp > 0);
}

function foodQuantity(slots: { itemId: string; quantity: number }[]): number {
  return slots.reduce((sum, slot) => sum + ((getItem(slot.itemId)?.healAmount ?? 0) > 0 ? Math.max(0, slot.quantity) : 0), 0);
}

export function CombatPage() {
  const { t } = useTranslation();

  const {
    inCombat,
    combatLog,
    totalDamageDealt,
    totalDamageTaken,
    lastReport,
  } = useCombatStore(useShallow(s => ({
    inCombat: s.inCombat,
    combatLog: s.combatLog,
    totalDamageDealt: s.totalDamageDealt,
    totalDamageTaken: s.totalDamageTaken,
    lastReport: s.lastReport,
  })));

  const combatLogRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const [showLatest, setShowLatest] = useState(false);
  const [screen, setScreen] = useState<CombatScreenId>('hunt');

  useEffect(() => {
    if (inCombat) setScreen('arena');
  }, [inCombat]);

  useEffect(() => {
    if (!inCombat && lastReport) setScreen('report');
  }, [inCombat, lastReport]);

  const scrollLogToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = combatLogRef.current;
    if (!el) return;
    shouldStickToBottomRef.current = true;
    setShowLatest(false);
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    const el = combatLogRef.current;
    if (!el) return;
    if (shouldStickToBottomRef.current) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    } else {
      setShowLatest(true);
    }
  }, [combatLog]);

  const handleLogScroll = () => {
    const el = combatLogRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    shouldStickToBottomRef.current = atBottom;
    if (atBottom) setShowLatest(false);
  };

  return (
    <div className="a-page combat2-page">
      <div className="a-page__scroll combat2-scroll">
        <div className={`combat2-shell ${inCombat ? 'is-active' : 'is-idle'}`}>
          <header className="combat2-hub-head">
            <div>
              <p className="combat2-kicker">Боевая система</p>
              <h1>Тактические вылазки</h1>
              <span>Выберите район, изучите монстра и управляйте схваткой в отдельной арене.</span>
            </div>
            <EquipmentSummaryLink />
          </header>

          <nav className="combat2-screen-tabs" aria-label="Разделы боя">
            {COMBAT_SCREENS.map(item => (
              <button
                key={item.id}
                type="button"
                className={screen === item.id ? 'is-active' : ''}
                onClick={() => setScreen(item.id)}
                aria-pressed={screen === item.id}
                title={item.hint}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === 'report' && lastReport && <b aria-label="Есть новый отчёт" />}
              </button>
            ))}
          </nav>

          <main className="combat2-screen" aria-label={COMBAT_SCREENS.find(item => item.id === screen)?.label ?? 'Бой'}>
            {screen === 'arena' && (
              <div className="combat2-screen-stack">
                <CombatStage />
                {inCombat && <CombatCommandDeck />}
                <CombatLogPanel
                  tCombatLog={t('combat.log')}
                  logRef={combatLogRef}
                  onScroll={handleLogScroll}
                  showLatest={showLatest}
                  onLatest={() => scrollLogToBottom()}
                  logs={combatLog}
                  totalDamageDealt={totalDamageDealt}
                  totalDamageTaken={totalDamageTaken}
                />
                {inCombat ? <FoodPanel /> : <RecoveryPanel />}
              </div>
            )}

            {screen === 'hunt' && (
              <div className="combat2-screen-grid is-hunt">
                <PreparationPanel />
                <SortieStatusPanel />
              </div>
            )}

            {screen === 'bestiary' && <BestiaryPanel />}

            {screen === 'report' && (
              <div className="combat2-screen-grid">
                <SortieReportPanel />
                <PreparationPanel />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

const CombatStage = memo(function CombatStage() {
  const { t } = useTranslation();
  const {
    inCombat,
    activeAreaId,
    currentMonster,
    enemies,
    selectedEnemyId,
    currentTargetId,
    playerHp,
    playerMaxHp,
    playerStats,
    playerAttackTimer,
    playerGuardMs,
    playerManeuverMs,
    killCount,
    waveCount,
    stopCombat,
    selectEnemy,
  } = useCombatStore(useShallow(s => ({
    inCombat: s.inCombat,
    activeAreaId: s.activeAreaId,
    currentMonster: s.currentMonster,
    enemies: s.enemies,
    selectedEnemyId: s.selectedEnemyId,
    currentTargetId: s.currentTargetId,
    playerHp: s.playerHp,
    playerMaxHp: s.playerMaxHp,
    playerStats: s.playerStats,
    playerAttackTimer: s.playerAttackTimer,
    playerGuardMs: s.playerGuardMs,
    playerManeuverMs: s.playerManeuverMs,
    killCount: s.killCount,
    waveCount: s.waveCount,
    stopCombat: s.stopCombat,
    selectEnemy: s.selectEnemy,
  })));
  const activeCharacter = useCharacterStore(s => s.activeCharacter);
  const heroLevel = useMemo(() => getLiveAttributes().heroLevel, [activeCharacter]);
  const areaName = activeAreaId ? COMBAT_AREAS.find(a => a.id === activeAreaId)?.name : null;

  if (!inCombat) {
    return (
      <section className="combat2-card combat2-empty-stage">
        <div className="combat2-empty-orb">⚔️</div>
        <div>
          <p className="combat2-kicker">Тактическая вылазка</p>
          <h1>Выберите зону и план</h1>
          <p>
            Теперь бой идёт как авто-схватка с ручными окнами: читайте намерения врагов,
            ставьте приоритет цели и вмешивайтесь Щитом, Манёвром, Приёмом или Пробоем.
          </p>
        </div>
      </section>
    );
  }

  const liveEnemies = aliveEnemies(enemies);
  const activeEnemyName = currentMonster?.name ?? liveEnemies[0]?.name ?? 'враг';

  return (
    <section className="combat2-card combat2-stage">
      <div className="combat2-stage-head">
        <div>
          <p className="combat2-kicker">{areaName ?? 'Вылазка'} · волна {waveCount}</p>
          <h1><Sword aria-hidden="true" /> Бой с {activeEnemyName}</h1>
        </div>
        <div className="combat2-stage-actions">
          <span className="combat2-pill"><Skull aria-hidden="true" /> Побед: {formatNumber(killCount)}</span>
          <button type="button" className="combat2-stop" onClick={() => stopCombat()}>
            <Square aria-hidden="true" /> {t('combat.stop')}
          </button>
        </div>
      </div>

      <MobileQuickTactics />
      <div className="combat2-duel-grid">
        <HeroCombatCard
          heroLevel={heroLevel}
          playerHp={playerHp}
          playerMaxHp={playerMaxHp}
          stats={playerStats}
          attackTimer={playerAttackTimer}
          guardMs={playerGuardMs}
          maneuverMs={playerManeuverMs}
        />
        <div className="combat2-vs" aria-hidden="true">
          <span>VS</span>
        </div>
        <EnemyPack
          enemies={liveEnemies}
          selectedEnemyId={selectedEnemyId}
          currentTargetId={currentTargetId}
          onSelect={selectEnemy}
        />
      </div>

      <CombatTimeline
        enemies={liveEnemies}
        playerTimer={playerAttackTimer}
        playerInterval={playerStats?.attackIntervalMs ?? 1}
      />
    </section>
  );
});

function HeroCombatCard({
  heroLevel,
  playerHp,
  playerMaxHp,
  stats,
  attackTimer,
  guardMs,
  maneuverMs,
}: {
  heroLevel: number;
  playerHp: number;
  playerMaxHp: number;
  stats: FighterCombatStats | null;
  attackTimer: number;
  guardMs: number;
  maneuverMs: number;
}) {
  return (
    <article className="combat2-fighter combat2-hero">
      <div className="combat2-fighter-top">
        <div>
          <p className="combat2-kicker">Герой</p>
          <h2>Вы · ур. {heroLevel}</h2>
        </div>
        <span className="combat2-avatar"><Shield aria-hidden="true" /></span>
      </div>
      <HealthBar current={playerHp} max={playerMaxHp} tone="hero" />
      <div className="combat2-castbar">
        <div className="combat2-castbar-label">
          <span><Zap aria-hidden="true" /> Темп удара</span>
          <b>{seconds(attackTimer)}</b>
        </div>
        <div className="combat2-mini-track"><span style={barStyle(progressToReady(attackTimer, stats?.attackIntervalMs ?? 1))} /></div>
      </div>
      <div className="combat2-stat-grid">
        <MiniStat label="Урон" value={stats ? `${stats.damageMin}–${stats.damageMax}` : '—'} />
        <MiniStat label="Броня" value={stats ? `${Math.round(stats.armorPct)}%` : '—'} />
        <MiniStat label="Уворот" value={stats ? `${Math.round(stats.evasionPct)}%` : '—'} />
        <MiniStat label="Крит" value={stats ? `${Math.round(stats.critChancePct)}%` : '—'} />
      </div>
      <div className="combat2-status-row">
        <span className={guardMs > 0 ? 'is-on' : ''}>Щит {guardMs > 0 ? seconds(guardMs) : 'нет'}</span>
        <span className={maneuverMs > 0 ? 'is-on' : ''}>Манёвр {maneuverMs > 0 ? seconds(maneuverMs) : 'нет'}</span>
      </div>
    </article>
  );
}

function EnemyPack({
  enemies,
  selectedEnemyId,
  currentTargetId,
  onSelect,
}: {
  enemies: CombatEnemy[];
  selectedEnemyId: string | null;
  currentTargetId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="combat2-pack" aria-label="Вражеская линия">
      <div className="combat2-pack-head">
        <div>
          <p className="combat2-kicker">Цели</p>
          <h2>Стая {enemies.length > 1 ? `×${enemies.length}` : ''}</h2>
        </div>
        <Crosshair aria-hidden="true" />
      </div>
      <div className="combat2-enemy-list">
        {enemies.map(enemy => (
          <EnemyCard
            key={enemy.instanceId}
            enemy={enemy}
            selected={(currentTargetId ?? selectedEnemyId) === enemy.instanceId}
            onSelect={() => onSelect(selectedEnemyId === enemy.instanceId ? null : enemy.instanceId)}
          />
        ))}
      </div>
    </div>
  );
}

function MonsterPortrait({ monsterId, isBoss = false }: { monsterId: string; isBoss?: boolean }) {
  return (
    <span className={`combat2-avatar combat2-monster-portrait ${isBoss ? 'is-boss' : ''}`}>
      <img src={iconUrl(monsterIconPath(monsterId))} alt="" loading="lazy" decoding="async" />
    </span>
  );
}

function EnemyCard({ enemy, selected, onSelect }: { enemy: CombatEnemy; selected: boolean; onSelect: () => void }) {
  const firstAbility = enemy.abilities?.find(ability => ability.intent === enemy.intent.kind) ?? enemy.abilities?.[0];
  return (
    <button type="button" className={`combat2-enemy ${selected ? 'is-selected' : ''}`} onClick={onSelect}>
      <div className="combat2-enemy-main">
        <MonsterPortrait monsterId={enemy.monsterId} isBoss={enemy.isBoss} />
        <div className="combat2-enemy-copy">
          <div className="combat2-enemy-title">
            <b>{enemy.name}</b>
            <span>ур. {enemy.combatLevel}</span>
          </div>
          <HealthBar current={enemy.hp} max={enemy.maxHp} tone="enemy" compact />
        </div>
      </div>
      <div className="combat2-intent-row">
        <span className="combat2-intent-icon">{enemy.intent.icon}</span>
        <span>
          <b>{firstAbility?.name ?? enemy.intent.label}</b>
          <small>{seconds(enemy.attackTimer)} · {firstAbility?.counterplay ?? enemy.intent.hint}</small>
        </span>
      </div>
      <div className="combat2-traits">
        {enemy.isBoss && <span className="is-boss-phase">фаза {enemy.bossPhase}</span>}
        {enemy.traits.slice(0, enemy.isBoss ? 3 : 4).map(trait => <span key={trait}>{TRAIT_LABEL[trait] ?? trait}</span>)}
      </div>
    </button>
  );
}

function HealthBar({ current, max, tone, compact = false }: { current: number; max: number; tone: 'hero' | 'enemy'; compact?: boolean }) {
  return (
    <div className={`combat2-health ${compact ? 'is-compact' : ''}`}>
      <div className="combat2-health-label">
        <span><Heart aria-hidden="true" /> ОЗ</span>
        <b>{formatNumber(current)} / {formatNumber(max)}</b>
      </div>
      <div className={`combat2-health-track is-${tone}`}>
        <span style={barStyle(pct(current, max))} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="combat2-mini-stat">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function CombatTimeline({ enemies, playerTimer, playerInterval }: { enemies: CombatEnemy[]; playerTimer: number; playerInterval: number }) {
  return (
    <div className="combat2-timeline" aria-label="Шкала действий">
      <div className="combat2-timeline-head">
        <span><Timer aria-hidden="true" /> Шкала действий</span>
        <b>чем правее маркер, тем ближе действие</b>
      </div>
      <div className="combat2-timeline-track">
        <span className="combat2-time-marker is-hero" style={markerStyle(progressToReady(playerTimer, playerInterval))}>Вы</span>
        {enemies.map(enemy => (
          <span
            key={enemy.instanceId}
            className={`combat2-time-marker ${enemy.intent.kind === 'heavy' ? 'is-danger' : ''}`}
            style={markerStyle(progressToReady(enemy.attackTimer, enemy.attackInterval))}
            title={`${enemy.name}: ${enemy.intent.label}`}
          >
            {enemy.intent.icon}
          </span>
        ))}
      </div>
    </div>
  );
}

const MobileQuickTactics = memo(function MobileQuickTactics() {
  const { tacticCooldowns, performTactic } = useCombatStore(useShallow(s => ({
    tacticCooldowns: s.tacticCooldowns,
    performTactic: s.performTactic,
  })));

  return (
    <div className="combat2-quick" aria-label="Быстрые команды">
      {TACTIC_META.map(tactic => {
        const cd = tacticCooldowns[tactic.id];
        const ready = cd <= 0;
        return (
          <button
            key={tactic.id}
            type="button"
            className={`combat2-quick-btn ${ready ? 'is-ready' : 'is-cooldown'}`}
            onClick={() => performTactic(tactic.id)}
            disabled={!ready}
            title={tactic.hint}
          >
            <span>{tactic.icon}</span>
            <b>{tactic.title}</b>
            <small>{ready ? 'готово' : seconds(cd)}</small>
          </button>
        );
      })}
    </div>
  );
});

const CombatCommandDeck = memo(function CombatCommandDeck() {
  const {
    autoEat,
    autoLoot,
    autoPlan,
    strategy,
    targetPriority,
    tacticCooldowns,
    setAutoEat,
    setAutoLoot,
    setAutoPlan,
    setStrategy,
    setTargetPriority,
    performTactic,
  } = useCombatStore(useShallow(s => ({
    autoEat: s.autoEat,
    autoLoot: s.autoLoot,
    autoPlan: s.autoPlan,
    strategy: s.strategy,
    targetPriority: s.targetPriority,
    tacticCooldowns: s.tacticCooldowns,
    setAutoEat: s.setAutoEat,
    setAutoLoot: s.setAutoLoot,
    setAutoPlan: s.setAutoPlan,
    setStrategy: s.setStrategy,
    setTargetPriority: s.setTargetPriority,
    performTactic: s.performTactic,
  })));

  return (
    <section className="combat2-card combat2-command">
      <div className="combat2-section-head">
        <div>
          <p className="combat2-kicker">Командирский слой</p>
          <h2><Bot aria-hidden="true" /> Автобой с вмешательством</h2>
        </div>
        <label className="combat2-toggle">
          <input type="checkbox" checked={autoPlan} onChange={e => setAutoPlan(e.target.checked)} />
          <span>Автоплан</span>
        </label>
      </div>

      <div className="combat2-tactics">
        {TACTIC_META.map(tactic => {
          const cd = tacticCooldowns[tactic.id];
          const ready = cd <= 0;
          return (
            <button
              key={tactic.id}
              type="button"
              className={`combat2-tactic ${ready ? 'is-ready' : 'is-cooldown'}`}
              onClick={() => performTactic(tactic.id)}
              disabled={!ready}
              title={tactic.hint}
            >
              <span className="combat2-tactic-icon">{tactic.icon}</span>
              <span>
                <b>{tactic.title}</b>
                <small>{ready ? tactic.hint : seconds(cd)}</small>
              </span>
            </button>
          );
        })}
      </div>

      <div className="combat2-command-grid">
        <CommandGroup title="Стратегия" icon={<Flag aria-hidden="true" />}>
          {(Object.keys(COMBAT_STRATEGIES) as CombatStrategyId[]).map(id => (
            <button
              key={id}
              type="button"
              className={`combat2-chip ${strategy === id ? 'is-active' : ''}`}
              onClick={() => setStrategy(id)}
            >
              {COMBAT_STRATEGIES[id].label}
            </button>
          ))}
        </CommandGroup>

        <CommandGroup title="Фокус цели" icon={<Crosshair aria-hidden="true" />}>
          {PRIORITIES.map(priority => (
            <button
              key={priority.id}
              type="button"
              className={`combat2-chip ${targetPriority === priority.id ? 'is-active' : ''}`}
              onClick={() => setTargetPriority(priority.id)}
              title={priority.hint}
            >
              {priority.label}
            </button>
          ))}
        </CommandGroup>

        <CommandGroup title="Автоматизация" icon={<Activity aria-hidden="true" />}>
          <label className="combat2-toggle is-small">
            <input type="checkbox" checked={autoEat} onChange={e => setAutoEat(e.target.checked)} />
            <span>Авто-еда</span>
          </label>
          <label className="combat2-toggle is-small">
            <input type="checkbox" checked={autoLoot} onChange={e => setAutoLoot(e.target.checked)} />
            <span>Авто-лут</span>
          </label>
        </CommandGroup>
      </div>
    </section>
  );
});

function CommandGroup({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="combat2-command-group">
      <h3>{icon}{title}</h3>
      <div className="combat2-chip-row">{children}</div>
    </div>
  );
}

function SortieStatusPanel() {
  const {
    inCombat,
    activeAreaId,
    sortieMonsterId,
    killCount,
    waveCount,
    playerHp,
    playerMaxHp,
    sortieEnergyCurrent,
    sortieEnergyMax,
    energyDrainMs,
    strategy,
    restAtCamp,
  } = useCombatStore(useShallow(s => ({
    inCombat: s.inCombat,
    activeAreaId: s.activeAreaId,
    sortieMonsterId: s.sortieMonsterId,
    killCount: s.killCount,
    waveCount: s.waveCount,
    playerHp: s.playerHp,
    playerMaxHp: s.playerMaxHp,
    sortieEnergyCurrent: s.sortieEnergyCurrent,
    sortieEnergyMax: s.sortieEnergyMax,
    energyDrainMs: s.energyDrainMs,
    strategy: s.strategy,
    restAtCamp: s.restAtCamp,
  })));
  const activeCharacter = useCharacterStore(s => s.activeCharacter);
  const equipment = usePlayerStore(s => s.equipment);
  const liveAttributes = useMemo(() => getLiveAttributes(), [activeCharacter, sortieEnergyCurrent, sortieEnergyMax]);
  const liveHero = useMemo(() => liveCombatSnapshot(strategy), [activeCharacter, equipment, strategy]);
  const area = activeAreaId ? COMBAT_AREAS.find(item => item.id === activeAreaId) : COMBAT_AREAS[0];
  const target = sortieMonsterId ? MONSTERS_MAP[sortieMonsterId] : null;
  const energyCurrent = inCombat ? sortieEnergyCurrent : liveAttributes.energy.current;
  const energyMax = inCombat ? sortieEnergyMax : liveAttributes.energy.max;
  const displayHpMax = inCombat ? playerMaxHp : liveHero.maxHp;
  const displayHp = inCombat
    ? playerHp
    : (playerMaxHp === liveHero.maxHp && playerHp > 0 ? playerHp : liveHero.maxHp);
  const drainLeftMs = inCombat
    ? Math.max(0, COMBAT_ENERGY.drainIntervalMs - (energyDrainMs % COMBAT_ENERGY.drainIntervalMs))
    : 0;
  const expectedDurationMs = Math.max(0, energyCurrent) * COMBAT_ENERGY.drainIntervalMs;
  const previewMonsters = area
    ? (target ? [target] : area.monsterIds.map(id => MONSTERS_MAP[id]).filter((monster): monster is Monster => Boolean(monster)))
    : [];
  const dropIds = Array.from(new Set(previewMonsters.flatMap(monster => monster.drops.map(drop => drop.itemId)))).slice(0, 5);

  return (
    <section className="combat2-card combat2-sortie-status">
      <div className="combat2-section-head">
        <div>
          <p className="combat2-kicker">Статус вылазки</p>
          <h2><Timer aria-hidden="true" /> Район, цель и запас</h2>
        </div>
        <span className="combat2-pill">{inCombat ? 'в бою' : 'лагерь'}</span>
      </div>

      <div className="combat2-status-hero">
        <div>
          <span>Район</span>
          <b>{area?.name ?? 'не выбран'}</b>
        </div>
        <div>
          <span>Цель</span>
          <b>{target?.name ?? 'смешанная охота'}</b>
        </div>
        <div>
          <span>ОЗ</span>
          <b>{formatNumber(displayHp)} / {formatNumber(displayHpMax || 1)}</b>
        </div>
        <div>
          <span>Победы</span>
          <b>{formatNumber(killCount)} · волна {formatNumber(waveCount)}</b>
        </div>
      </div>

      <div className="combat2-energy-block">
        <div className="combat2-health-label">
          <span><Zap aria-hidden="true" /> Энергия вылазки</span>
          <b>{formatNumber(energyCurrent)} / {formatNumber(energyMax)}</b>
        </div>
        <div className="combat2-health-track is-energy">
          <span style={barStyle(pct(energyCurrent, energyMax))} />
        </div>
        <p>
          Хватит примерно на <b>{shortDuration(expectedDurationMs)}</b>
          {inCombat ? <> · следующий расход через <b>{shortDuration(drainLeftMs)}</b></> : <> · старт стоит {COMBAT_ENERGY.startCost} ед.</>}
        </p>
      </div>

      <div className="combat2-loot-preview">
        <span>Ожидаемая добыча:</span>
        <div>
          {dropIds.map(itemId => <ItemIcon key={itemId} itemId={itemId} size="sm" showTooltip={false} />)}
          {dropIds.length === 0 && <small>нет данных</small>}
        </div>
      </div>

      <button type="button" className="combat2-rest-btn" onClick={restAtCamp} disabled={inCombat}>
        <Heart aria-hidden="true" /> {inCombat ? 'Передышка после боя' : 'Передышка в лагере'}
      </button>
    </section>
  );
}

const PreparationPanel = memo(function PreparationPanel() {
  const {
    inCombat,
    activeAreaId,
    strategy,
    startCombat,
    stopCombat,
    getRiskForecast,
  } = useCombatStore(useShallow(s => ({
    inCombat: s.inCombat,
    activeAreaId: s.activeAreaId,
    strategy: s.strategy,
    startCombat: s.startCombat,
    stopCombat: s.stopCombat,
    getRiskForecast: s.getRiskForecast,
  })));
  const activeCharacter = useCharacterStore(s => s.activeCharacter);
  const inventoryItems = useInventoryStore(s => s.items);
  const heroLevel = useMemo(() => getLiveAttributes().heroLevel, [activeCharacter]);
  const foodCount = useMemo(() => foodQuantity(inventoryItems), [inventoryItems]);

  const handleAreaClick = (areaId: string, minLevel = 1, monsterId?: string) => {
    if (heroLevel < minLevel) return;
    if (inCombat) stopCombat();
    startCombat(areaId, monsterId);
  };

  return (
    <section className="combat2-card combat2-prep">
      <div className="combat2-section-head">
        <div>
          <p className="combat2-kicker">Подготовка</p>
          <h2><Backpack aria-hidden="true" /> План вылазки</h2>
        </div>
        <span className="combat2-pill">Еда: {foodCount}</span>
      </div>

      <div className="combat2-prep-note">
        <Sparkles aria-hidden="true" />
        <span>Стратегия сейчас: <b>{COMBAT_STRATEGIES[strategy].label}</b>. Прогноз считает стаю, телеграфы и запас еды.</span>
      </div>

      <div className="combat2-area-list">
        {COMBAT_AREAS.map(area => {
          const locked = heroLevel < (area.combatLevelRequired ?? 1);
          const active = activeAreaId === area.id;
          const risk = getRiskForecast(area.id);
          return (
            <article
              key={area.id}
              role="button"
              tabIndex={locked ? -1 : 0}
              className={`combat2-area ${active ? 'is-active' : ''} ${locked ? 'is-locked' : ''}`}
              onClick={() => handleAreaClick(area.id, area.combatLevelRequired ?? 1)}
              onKeyDown={event => {
                if (!locked && (event.key === 'Enter' || event.key === ' ')) handleAreaClick(area.id, area.combatLevelRequired ?? 1);
              }}
              aria-disabled={locked}
            >
              <div className="combat2-area-top">
                <div>
                  <h3>{area.name}</h3>
                  <p>{area.description}</p>
                </div>
                <span className={`combat2-risk ${riskClass(risk?.label)}`}>
                  {locked ? `ур. ${area.combatLevelRequired}` : `${risk?.title ?? '—'} ${risk?.score ?? ''}`}
                </span>
              </div>
              <div className="combat2-area-roster">
                {area.monsterIds.map(id => {
                  const monster = MONSTERS_MAP[id];
                  if (!monster) return null;
                  return (
                    <MonsterRosterChip
                      key={id}
                      monsterId={id}
                      disabled={locked}
                      onHunt={(event) => {
                        event.stopPropagation();
                        handleAreaClick(area.id, area.combatLevelRequired ?? 1, id);
                      }}
                    />
                  );
                })}
              </div>
              {risk && !locked && (
                <div className="combat2-area-why">
                  <span>Idle: ~{risk.safeIdleMinutes >= COMBAT_RISK.safeIdleInfinityMinutes ? '∞' : risk.safeIdleMinutes} мин</span>
                  <ChevronRight aria-hidden="true" />
                  <span>{risk.reasons[0]}</span>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
});

function MonsterRosterChip({
  monsterId,
  disabled = false,
  onHunt,
}: {
  monsterId: string;
  disabled?: boolean;
  onHunt?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const monster = MONSTERS_MAP[monsterId];
  if (!monster) return null;
  const traits = (monster.traits ?? []).slice(0, 2).map(trait => TRAIT_LABEL[trait] ?? trait).join(' · ');
  const title = [monster.description, monster.abilities?.[0]?.counterplay].filter(Boolean).join(' ');
  return (
    <button type="button" className="combat2-roster-chip" title={title} onClick={onHunt} disabled={disabled}>
      <img src={iconUrl(monsterIconPath(monster))} alt="" loading="lazy" decoding="async" />
      <span>
        <b>{monster.name}</b>
        <small>{ROLE_LABEL[monster.role ?? ''] ?? 'моб'} · ур. {monster.combatLevel}{traits ? ` · ${traits}` : ''}</small>
      </span>
      <em>цель</em>
    </button>
  );
}

function BestiaryPanel() {
  const [areaFilter, setAreaFilter] = useState<string>(COMBAT_AREAS[0]?.id ?? 'all');
  const selectedArea = COMBAT_AREAS.find(area => area.id === areaFilter) ?? COMBAT_AREAS[0];
  const monsters = selectedArea
    ? selectedArea.monsterIds.map(id => MONSTERS_MAP[id]).filter((monster): monster is Monster => Boolean(monster))
    : [];

  return (
    <section className="combat2-card combat2-bestiary">
      <div className="combat2-section-head">
        <div>
          <p className="combat2-kicker">Разведка</p>
          <h2><BookOpen aria-hidden="true" /> Бестиарий района</h2>
        </div>
        <span className="combat2-pill">{monsters.length} целей</span>
      </div>

      <div className="combat2-bestiary-tabs" role="tablist" aria-label="Районы бестиария">
        {COMBAT_AREAS.map(area => (
          <button
            key={area.id}
            type="button"
            className={areaFilter === area.id ? 'is-active' : ''}
            onClick={() => setAreaFilter(area.id)}
          >
            {area.name}
          </button>
        ))}
      </div>

      <div className="combat2-bestiary-grid">
        {monsters.map(monster => <MonsterIntelCard key={monster.id} monster={monster} />)}
      </div>
    </section>
  );
}

function MonsterIntelCard({ monster }: { monster: Monster }) {
  const traits = monster.traits ?? [];
  const drops = monster.drops.slice(0, 4);
  return (
    <article className="combat2-intel-card">
      <div className="combat2-intel-top">
        <MonsterPortrait monsterId={monster.id} isBoss={monster.isBoss} />
        <div>
          <p className="combat2-kicker">{ROLE_LABEL[monster.role ?? ''] ?? 'моб'} · ур. {monster.combatLevel}</p>
          <h3>{monster.name}</h3>
          <span>{monster.description}</span>
        </div>
      </div>

      <div className="combat2-stat-grid">
        <MiniStat label="ОЗ" value={formatNumber(monster.maxHp)} />
        <MiniStat label="Урон" value={`до ${formatNumber(monster.maxHit)}`} />
        <MiniStat label="Атака" value={formatNumber(monster.attackLevel)} />
        <MiniStat label="Защита" value={formatNumber(monster.defenceLevel)} />
      </div>

      <div className="combat2-traits is-intel">
        {traits.length === 0 && <span>без трюков</span>}
        {traits.map(trait => <span key={trait}>{TRAIT_LABEL[trait] ?? trait}</span>)}
      </div>

      <div className="combat2-ability-list">
        {(monster.abilities ?? []).map(ability => (
          <div key={ability.id}>
            <b>{ability.name}</b>
            <span>{ability.description}</span>
            <small>{ability.counterplay}</small>
          </div>
        ))}
      </div>

      <div className="combat2-intel-drops">
        <span>Добыча</span>
        <div>
          {drops.map(drop => {
            const item = getItem(drop.itemId);
            return (
              <small key={drop.itemId}>
                <ItemIcon itemId={drop.itemId} size="sm" showTooltip={false} />
                {item?.name ?? drop.itemId} · {Math.round(drop.chance * 100)}%
              </small>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function SortieReportPanel() {
  const report = useCombatStore(s => s.lastReport);
  if (!report) {
    return (
      <section className="combat2-card combat2-report">
        <div className="combat2-section-head">
          <div>
            <p className="combat2-kicker">Idle отчёт</p>
            <h2><History aria-hidden="true" /> Пока пусто</h2>
          </div>
        </div>
        <p className="combat2-report-summary">Завершите вылазку вручную, по усталости или после поражения — здесь появятся победы, добыча и подсказки.</p>
      </section>
    );
  }
  const lootEntries = Object.entries(report.loot).slice(0, 6);

  return (
    <section className="combat2-card combat2-report">
      <div className="combat2-section-head">
        <div>
          <p className="combat2-kicker">Idle отчёт</p>
          <h2><History aria-hidden="true" /> Что произошло</h2>
        </div>
        <span className="combat2-pill">{shortDuration(report.durationMs)}</span>
      </div>
      <p className="combat2-report-summary">{report.summary}</p>
      <div className="combat2-report-grid">
        <MiniStat label="Побед" value={formatNumber(report.kills)} />
        <MiniStat label="Волн" value={formatNumber(report.waves)} />
        <MiniStat label="Опыт" value={`+${formatNumber(report.xp)}`} />
        <MiniStat label="Монеты" value={`+${formatNumber(report.gp)}`} />
      </div>
      {lootEntries.length > 0 && (
        <div className="combat2-report-loot">
          {lootEntries.map(([itemId, qty]) => (
            <span key={itemId}>
              <ItemIcon itemId={itemId} size="sm" quantity={qty} showTooltip={false} />
              ×{qty}
            </span>
          ))}
        </div>
      )}
      <ul className="combat2-report-notes">
        {report.notes.slice(0, 3).map(note => <li key={note}>{note}</li>)}
      </ul>
    </section>
  );
}

function CombatLogPanel({
  tCombatLog,
  logRef,
  onScroll,
  showLatest,
  onLatest,
  logs,
  totalDamageDealt,
  totalDamageTaken,
}: {
  tCombatLog: string;
  logRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  showLatest: boolean;
  onLatest: () => void;
  logs: CombatLogEntry[];
  totalDamageDealt: number;
  totalDamageTaken: number;
}) {
  return (
    <section className="combat2-card combat2-log-card">
      <div className="combat2-section-head">
        <div>
          <p className="combat2-kicker">Хроника</p>
          <h2><History aria-hidden="true" /> {tCombatLog}</h2>
        </div>
        <div className="combat2-log-stats">
          <span>Урон <b>{formatNumber(totalDamageDealt)}</b></span>
          <span>Вход <b>{formatNumber(totalDamageTaken)}</b></span>
        </div>
      </div>
      <div ref={logRef} onScroll={onScroll} className="combat2-log-list">
        {logs.length === 0 && <div className="combat2-log-empty">События боя появятся здесь.</div>}
        {logs.slice().reverse().map(log => (
          <div key={log.id} className={`combat2-log-entry is-${log.type}`}>
            <time>{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</time>
            <span>{log.message}</span>
          </div>
        ))}
      </div>
      {showLatest && (
        <button type="button" className="combat2-latest" onClick={onLatest}>К последним событиям</button>
      )}
    </section>
  );
}

function RecoveryPanel() {
  const { strategy, sortieEnergyCurrent, sortieEnergyMax, restAtCamp } = useCombatStore(useShallow(s => ({
    strategy: s.strategy,
    sortieEnergyCurrent: s.sortieEnergyCurrent,
    sortieEnergyMax: s.sortieEnergyMax,
    restAtCamp: s.restAtCamp,
  })));
  const activeCharacter = useCharacterStore(s => s.activeCharacter);
  const equipment = usePlayerStore(s => s.equipment);
  const attributes = useMemo(() => getLiveAttributes(), [activeCharacter, sortieEnergyCurrent, sortieEnergyMax]);
  const hero = useMemo(() => liveCombatSnapshot(strategy), [activeCharacter, equipment, strategy]);
  return (
    <section className="combat2-card combat2-recovery">
      <div className="combat2-section-head is-compact">
        <div>
          <p className="combat2-kicker">Восстановление</p>
          <h2><Heart aria-hidden="true" /> Лагерь</h2>
        </div>
      </div>
      <p>После уровня ОЗ восстанавливаются в бою. В лагере можно полностью привести героя в порядок перед новой вылазкой.</p>
      <div className="combat2-report-grid">
        <MiniStat label="ОЗ после отдыха" value={formatNumber(hero.maxHp)} />
        <MiniStat label="Энергия" value={`${formatNumber(attributes.energy.current)} / ${formatNumber(attributes.energy.max)}`} />
      </div>
      <button type="button" className="combat2-rest-btn" onClick={restAtCamp}>
        <Heart aria-hidden="true" /> Передышка в лагере
      </button>
    </section>
  );
}

const FoodPanel = memo(function FoodPanel() {
  const eatFood = useCombatStore(s => s.eatFood);
  const inventoryItems = useInventoryStore(s => s.items);

  const foodItems = inventoryItems
    .map(s => ({ slot: s, item: getItem(s.itemId) }))
    .filter(({ item }) => item && item.healAmount && item.healAmount > 0);

  return (
    <section className="combat2-card combat2-food">
      <div className="combat2-section-head is-compact">
        <div>
          <p className="combat2-kicker">Пояс</p>
          <h2><Utensils aria-hidden="true" /> Быстрая еда</h2>
        </div>
      </div>
      <div className="combat2-food-row">
        {foodItems.map(({ slot, item }) => (
          <button key={slot.itemId} type="button" onClick={() => eatFood(slot.itemId)} className="combat2-food-btn">
            <ItemIcon itemId={slot.itemId} size="sm" quantity={slot.quantity} showTooltip={false} />
            <span>
              <b>{item?.name}</b>
              <small>+{item?.healAmount} ОЗ</small>
            </span>
          </button>
        ))}
        {foodItems.length === 0 && <p className="combat2-food-empty">Еды нет. Возьмите провизию перед опасной зоной.</p>}
      </div>
    </section>
  );
});

function EquipmentSummaryLink() {
  const equipment = usePlayerStore(s => s.equipment);
  const equipped = Object.values(equipment).filter(Boolean).length;
  const weaponName = equipment.weapon ? getItem(equipment.weapon)?.name : null;

  return (
    <Link href="/hero" className="combat2-equip-summary">
      <Shield aria-hidden="true" />
      <span>
        <b>Экипировка</b>
        <small>{weaponName ? `${weaponName} · ${equipped} сл.` : `${equipped} слотов занято`}</small>
      </span>
      <ChevronRight aria-hidden="true" />
    </Link>
  );
}
