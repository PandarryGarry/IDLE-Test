import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCombatStore, type CombatEnemy, type CombatLogEntry } from '@/store/combatStore';
import { usePlayerStore } from '@/store/playerStore';
import { useCharacterStore } from '@/store/characterStore';
import { getLiveAttributes } from '@/domain/attributes/characterAttributes';
import { COMBAT_AREAS, MONSTERS_MAP, monsterIconPath } from '@/domain/combat/monsters';
import { ItemIcon } from '@/features/inventory/ItemIcon';
import { useInventoryStore } from '@/store/inventoryStore';
import { getItem } from '@/domain/items';
import { getItemVisual } from '@/shared/icons/itemIcons';
import type { EquipSlot } from '@/data/types';
import { useTranslation } from '@/hooks/useTranslation';
import { iconUrl } from '@/lib/assetUrl';
import { formatNumber } from '@/lib/utils';
import { COMBAT_RISK, COMBAT_STRATEGIES } from '@/data/balance/combat';
import type { CombatStrategyId, CombatTacticId, FighterCombatStats, TargetPriority } from '@/domain/combat/combatModel';
import {
  Activity,
  Backpack,
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
  } = useCombatStore(useShallow(s => ({
    inCombat: s.inCombat,
    combatLog: s.combatLog,
    totalDamageDealt: s.totalDamageDealt,
    totalDamageTaken: s.totalDamageTaken,
  })));

  const combatLogRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const [showLatest, setShowLatest] = useState(false);

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
        <div className={`combat2-layout ${inCombat ? 'is-active' : 'is-idle'}`}>
          <main className="combat2-main" aria-label="Тактическая арена">
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
            {inCombat && <FoodPanel />}
          </main>

          <aside className="combat2-side" aria-label="Подготовка к вылазке">
            <PreparationPanel />
            <SortieReportPanel />
            <EquipmentPaperdoll />
          </aside>
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

      <MobileQuickTactics />
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

  const handleAreaClick = (areaId: string, minLevel = 1) => {
    if (heroLevel < minLevel) return;
    if (inCombat) stopCombat();
    startCombat(areaId);
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
            <button
              key={area.id}
              type="button"
              className={`combat2-area ${active ? 'is-active' : ''} ${locked ? 'is-locked' : ''}`}
              onClick={() => handleAreaClick(area.id, area.combatLevelRequired ?? 1)}
              disabled={locked}
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
                  return <MonsterRosterChip key={id} monsterId={id} />;
                })}
              </div>
              {risk && !locked && (
                <div className="combat2-area-why">
                  <span>Idle: ~{risk.safeIdleMinutes >= COMBAT_RISK.safeIdleInfinityMinutes ? '∞' : risk.safeIdleMinutes} мин</span>
                  <ChevronRight aria-hidden="true" />
                  <span>{risk.reasons[0]}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
});

function MonsterRosterChip({ monsterId }: { monsterId: string }) {
  const monster = MONSTERS_MAP[monsterId];
  if (!monster) return null;
  const traits = (monster.traits ?? []).slice(0, 2).map(trait => TRAIT_LABEL[trait] ?? trait).join(' · ');
  const title = [monster.description, monster.abilities?.[0]?.counterplay].filter(Boolean).join(' ');
  return (
    <span className="combat2-roster-chip" title={title}>
      <img src={iconUrl(monsterIconPath(monster))} alt="" loading="lazy" decoding="async" />
      <span>
        <b>{monster.name}</b>
        <small>{ROLE_LABEL[monster.role ?? ''] ?? 'моб'} · ур. {monster.combatLevel}{traits ? ` · ${traits}` : ''}</small>
      </span>
    </span>
  );
}

function SortieReportPanel() {
  const report = useCombatStore(s => s.lastReport);
  if (!report) return null;
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

function EquipmentPaperdoll() {
  return (
    <section className="combat2-card combat2-equipment">
      <div className="combat2-section-head is-compact">
        <div>
          <p className="combat2-kicker">Снаряжение</p>
          <h2><Shield aria-hidden="true" /> Боевой комплект</h2>
        </div>
      </div>
      <div className="combat2-paperdoll">
        <div className="combat2-paperdoll-grid">
          <div className="combat2-paperdoll-spacer" />
          <EquipSlotBox slot="helm" label="Шлем" />
          <div className="combat2-paperdoll-spacer" />
          <EquipSlotBox slot="cape" label="Плащ" />
          <EquipSlotBox slot="amulet" label="Шея" />
          <EquipSlotBox slot="quiver" label="Колчан" />
          <EquipSlotBox slot="weapon" label="Оружие" />
          <EquipSlotBox slot="platebody" label="Доспех" />
          <EquipSlotBox slot="shield" label="Щит" />
          <div className="combat2-paperdoll-spacer" />
          <EquipSlotBox slot="platelegs" label="Поножи" />
          <div className="combat2-paperdoll-spacer" />
          <EquipSlotBox slot="gloves" label="Перчатки" />
          <EquipSlotBox slot="boots" label="Сапоги" />
          <EquipSlotBox slot="ring" label="Кольцо" />
        </div>
      </div>
    </section>
  );
}

function EquipItemVisual({ itemId, label }: { itemId: string; label: string }) {
  const item = getItem(itemId);
  const visual = getItemVisual(itemId);
  return visual?.type === 'image' ? (
    <img src={visual.value} alt={item?.name ?? label} className="combat2-equip-img" />
  ) : (
    <span className="combat2-equip-emoji">{visual?.value ?? '?'}</span>
  );
}

function EquipSlotBox({ slot, label }: { slot: EquipSlot; label: string }) {
  const itemId = usePlayerStore(s => s.equipment[slot]);
  const unequip = usePlayerStore(s => s.unequipItem);
  const addItem = useInventoryStore(s => s.addItem);

  const handleUnequip = () => {
    if (itemId) {
      const removed = unequip(slot);
      if (removed) addItem(removed, 1);
    }
  };

  return (
    <button type="button" onClick={handleUnequip} title={itemId ? `Снять: ${label}` : label} className="combat2-equip-slot">
      <div className={`combat2-equip-cell ${itemId ? 'is-filled' : 'is-empty'}`}>
        {itemId ? <EquipItemVisual itemId={itemId} label={label} /> : <span className="combat2-empty-dot" />}
      </div>
      <span className="combat2-equip-label">{label}</span>
    </button>
  );
}
