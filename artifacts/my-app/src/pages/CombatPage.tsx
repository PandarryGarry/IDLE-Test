import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { useCombatStore } from '@/store/combatStore';
import { usePlayerStore } from '@/store/playerStore';
import { useShallow } from 'zustand/react/shallow';
import { COMBAT_AREAS, MONSTERS_MAP } from '@/data/monsters';
import { ItemIcon } from '@/components/ItemIcon';
import { useInventoryStore } from '@/store/inventoryStore';
import { getItem } from '@/data/items';
import { getItemVisual } from '@/shared/icons/itemIcons';
import { EquipSlot } from '@/data/types';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Sword, 
  Shield, 
  Heart, 
  Zap, 
  Flame, 
  Skull, 
  Square, 
  Check, 
  Activity, 
  Utensils, 
  History,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export function CombatPage() {
  const { t } = useTranslation();

  const inCombat = useCombatStore(s => s.inCombat);
  const activeAreaId = useCombatStore(s => s.activeAreaId);
  const combatLog = useCombatStore(s => s.combatLog);
  const totalDamageDealt = useCombatStore(s => s.totalDamageDealt);
  const totalDamageTaken = useCombatStore(s => s.totalDamageTaken);
  const startCombat = useCombatStore(s => s.startCombat);
  const stopCombat = useCombatStore(s => s.stopCombat);

  const combatLevel = usePlayerStore(s => s.combatLevel);

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

  const handleAreaClick = (areaId: string, minLevel = 1) => {
    if (combatLevel < minLevel) return;
    if (inCombat) stopCombat();
    startCombat(areaId);
  };

  return (
    <div className="space-y-4">
      {/* Mobile: Stacked; Desktop: Left Side (Areas + Paperdoll) & Right Side (Battle Arena + Log) */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* LEFT COLUMN: Areas & Equipment Paperdoll */}
        <div className="w-full lg:w-80 xl:w-96 space-y-4 shrink-0">

          {/* Combat Areas Selection */}
          <div className="g-card border border-[var(--border-default)] p-4 rounded-3xl shadow-xl">
            <h2 className="font-mono text-xs font-extrabold uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ color: '#ff9070', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
              <Skull className="w-3.5 h-3.5" /> {t('combat.areas')}
            </h2>
            
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              {COMBAT_AREAS.map(area => {
                const isLocked = combatLevel < (area.combatLevelRequired ?? 1);
                const isActive = activeAreaId === area.id;
                return (
                  <button
                    type="button"
                    key={area.id}
                    onClick={() => handleAreaClick(area.id, area.combatLevelRequired ?? 1)}
                    disabled={isLocked}
                    className={`w-full p-3 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                      isLocked
                        ? 'cursor-not-allowed border-[var(--border-default)] opacity-75'
                        : isActive
                          ? 'bg-red-500/20 border-red-500/70 shadow-[0_0_18px_rgba(239,68,68,0.25)] ring-1 ring-red-500/40 cursor-pointer'
                          : 'bg-[var(--bg-card-dark)] hover:border-red-500/40 cursor-pointer border-[var(--border-light)] hover:bg-[var(--bg-card-dark)]'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-xs sm:text-sm" style={{ color: isActive ? '#ff8060' : '#fff8d0', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        {area.name}
                      </h3>
                      {isLocked ? (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md" style={{ color: '#ff9070', background: 'rgba(120,30,15,0.6)', border: '1px solid rgba(255,120,80,0.4)' }}>
                          Ур. {area.combatLevelRequired}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-stone-500">
                          {area.monsterIds.length} монстров
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-tight mb-2">{area.description}</p>
                    
                    {/* Monster Rosters */}
                    <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                      {area.monsterIds.map(mId => (
                        <span key={mId} className="shrink-0 bg-[var(--bg-slot)] px-1.5 py-0.5 rounded-md text-[10px] font-mono border border-[var(--border-card)] text-[var(--text-primary)] font-medium">
                          {MONSTERS_MAP[mId]?.name} ({MONSTERS_MAP[mId]?.combatLevel})
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Equipment Paperdoll (Кукла экипировки) */}
          <div className="g-card border border-[var(--border-default)] p-4 rounded-3xl shadow-xl">
            <h2 className="font-mono text-xs font-extrabold uppercase tracking-widest text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" /> {t('combat.equipment')}
            </h2>
            
            {/* Кукла экипировки — 3 колонки, фиксированные ячейки */}
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-slot)', border: '1px solid var(--border-slot)' }}>
              <div className="grid grid-cols-3 gap-y-3 gap-x-2 justify-items-center">
                {/* Ряд 1: пусто / Шлем / пусто */}
                <div />
                <EquipSlotBox slot="helm"      label="Шлем" />
                <div />
                {/* Ряд 2: Плащ / Шея / Колчан */}
                <EquipSlotBox slot="cape"      label="Плащ" />
                <EquipSlotBox slot="amulet"    label="Шея" />
                <EquipSlotBox slot="quiver"    label="Колчан" />
                {/* Ряд 3: Оружие / Доспех / Щит */}
                <EquipSlotBox slot="weapon"    label="Оружие" />
                <EquipSlotBox slot="platebody" label="Доспех" />
                <EquipSlotBox slot="shield"    label="Щит" />
                {/* Ряд 4: пусто / Поножи / пусто */}
                <div />
                <EquipSlotBox slot="platelegs" label="Поножи" />
                <div />
                {/* Ряд 5: Перчатки / Сапоги / Кольцо */}
                <EquipSlotBox slot="gloves"    label="Перчатки" />
                <EquipSlotBox slot="boots"     label="Сапоги" />
                <EquipSlotBox slot="ring"      label="Кольцо" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Battle Arena & Combat Log & Food */}
        <div className="flex-1 space-y-4 min-w-0">

          {/* Dynamic Combat Battle Arena */}
          <CombatScreen />

          {/* Combat Log */}
          <div className="fantasy-card border-stone-800 rounded-3xl p-3 sm:p-4 shadow-lg flex flex-col h-60 md:h-72 min-h-0">
            <div className="flex items-center justify-between gap-2 mb-2 px-1">
              <h3 className="font-mono text-xs font-extrabold uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-cyan-400" /> {t('combat.log')}
              </h3>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-stone-500">{t('combat.damage')}: <b className="text-emerald-400 font-bold">{formatNumber(totalDamageDealt)}</b></span>
                <span className="text-stone-500">{t('combat.taken')}: <b className="text-red-400 font-bold">{formatNumber(totalDamageTaken)}</b></span>
              </div>
            </div>

            <div
              ref={combatLogRef}
              onScroll={handleLogScroll}
              className="relative flex-1 min-h-0 overflow-y-auto space-y-1 font-mono text-xs p-3 rounded-xl scrollbar-thin" style={{ background: 'rgba(60,30,10,0.7)', border: '2px solid #8b5020', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)' }}
            >
              {combatLog.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Combat events will appear here during battle...
                </div>
              )}
              {combatLog.slice().reverse().map((log) => (
                <div key={log.id} className={`leading-relaxed ${
                  log.type === 'player_attack' ? (log.damage && log.damage > 0 ? 'text-emerald-400 font-semibold' : 'text-slate-500') :
                  log.type === 'enemy_attack' ? (log.damage && log.damage > 0 ? 'text-red-400 font-semibold' : 'text-slate-500') :
                  log.type === 'player_death' || log.type === 'enemy_death' ? 'text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded' :
                  log.type === 'eat' ? 'text-cyan-400 font-medium' : 'text-stone-500'
                }`}>
                  <span className="opacity-40 mr-2 text-[10px]">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                  {log.message}
                </div>
              ))}
            </div>

            {showLatest && (
              <button
                type="button"
                onClick={() => scrollLogToBottom()}
                className="self-center -mt-8 mb-2 z-10 rounded-full border border-red-500/40 bg-[var(--bg-card)] px-3 py-1 text-[11px] font-bold text-red-300 shadow-xl backdrop-blur-md transition-all hover:bg-red-500/20 active:scale-95"
              >
                {t('combat.latest')}
              </button>
            )}
          </div>

          {/* Quick Food Belt */}
          {inCombat && <FoodPanel />}
        </div>

      </div>
    </div>
  );
}

const CombatScreen = memo(function CombatScreen() {
  const { t } = useTranslation();

  const {
    inCombat,
    currentMonster,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
    playerAttackTimer,
    enemyAttackTimer,
    autoEat,
    autoLoot,
    killCount,
    stopCombat,
    setAutoEat,
    setAutoLoot,
  } = useCombatStore(useShallow(s => ({
    inCombat: s.inCombat,
    currentMonster: s.currentMonster,
    playerHp: s.playerHp,
    playerMaxHp: s.playerMaxHp,
    enemyHp: s.enemyHp,
    enemyMaxHp: s.enemyMaxHp,
    playerAttackTimer: s.playerAttackTimer,
    enemyAttackTimer: s.enemyAttackTimer,
    autoEat: s.autoEat,
    autoLoot: s.autoLoot,
    killCount: s.killCount,
    stopCombat: s.stopCombat,
    setAutoEat: s.setAutoEat,
    setAutoLoot: s.setAutoLoot,
  })));

  const combatLevel = usePlayerStore(s => s.combatLevel);

  const playerHpPct = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100));
  const enemyHpPct = enemyMaxHp > 0 ? Math.max(0, Math.min(100, (enemyHp / enemyMaxHp) * 100)) : 0;
  
  const playerAttackProgress = Math.max(0, Math.min(100, (1 - playerAttackTimer / 2400) * 100));
  const enemyAttackInterval = currentMonster?.attackInterval || 2400;
  const enemyAttackProgress = Math.max(0, Math.min(100, (1 - enemyAttackTimer / enemyAttackInterval) * 100));

  return (
    <div className="g-card border border-red-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl min-h-[320px] flex flex-col relative overflow-hidden">
      
      {!inCombat ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-secondary)] p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-[var(--bg-card-dark)] border border-[var(--border-light)] flex items-center justify-center text-4xl mb-3 opacity-70">
            ⚔️
          </div>
          <h2 className="text-lg sm:text-xl font-display font-black text-[var(--text-primary)]">{t('combat.selectArea')}</h2>
          <p className="text-xs text-stone-500 mt-1 max-w-sm">
            Выберите боевую локацию или подземелье слева, чтобы начать сражение.
          </p>
        </div>
      ) : (
        <div className="h-full flex flex-col z-10">
          
          {/* Arena Header */}
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-[var(--border-light)]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <h2 className="text-base sm:text-lg font-display font-black text-[var(--text-primary)] flex items-center gap-1.5">
                <span className="text-red-400">{t('combat.fighting')}</span> {currentMonster?.name}
              </h2>
            </div>

            <button
              onClick={stopCombat}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white border border-red-500/50 font-bold rounded-2xl text-xs transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t('combat.stop')}</span>
            </button>
          </div>

          {/* Duel Display (Player vs Monster) */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between flex-grow py-2">
            
            {/* Player Side */}
            <div className="flex-1 w-full text-center space-y-2.5 bg-[var(--bg-card-dark)] p-4 rounded-2xl border border-[var(--border-light)]">
              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
                <span className="font-bold text-[var(--text-primary)]">{t('combat.you')}</span>
                <span className="bg-[var(--bg-card-dark)] border border-[var(--border-default)] px-2 py-0.5 rounded-md font-bold text-amber-300">
                  Ур. {combatLevel}
                </span>
              </div>

              <div className="text-5xl py-1 filter drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                🛡️
              </div>

              {/* Player HP Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-current" /> ОЗ
                  </span>
                  <span className="text-[var(--text-primary)] font-bold">{playerHp} / {playerMaxHp}</span>
                </div>
                <div className="h-4 w-full bg-[var(--bar-track)] rounded-full overflow-hidden border border-[var(--border-light)] p-0.5 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.6)] transition-all duration-300"
                    style={{ width: `${playerHpPct}%` }}
                  />
                </div>
              </div>

              {/* Attack Timer Bar */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] font-mono text-stone-500">
                  <span>Скорость атаки</span>
                  <span>{(playerAttackTimer / 1000).toFixed(1)} сек.</span>
                </div>
                <div className="h-1.5 w-full bg-[var(--bar-track)] rounded-full overflow-hidden border border-[var(--border-light)]">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-100"
                    style={{ width: `${playerAttackProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Clash Swords Icon in Center */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse">
                ⚔️
              </div>
              <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest mt-1">VS</span>
            </div>

            {/* Enemy Side */}
            <div className="flex-1 w-full text-center space-y-2.5 bg-[var(--bg-card-dark)] p-4 rounded-2xl border border-red-500/40">
              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
                <span className="font-bold text-red-300 truncate">{currentMonster?.name}</span>
                <span className="bg-red-950/80 border border-red-500/50 px-2 py-0.5 rounded-md font-bold text-red-400">
                  Ур. {currentMonster?.combatLevel}
                </span>
              </div>

              <div className="text-5xl py-1 filter drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]">
                {currentMonster?.isBoss ? '🐉' : '👹'}
              </div>

              {/* Enemy HP Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-current" /> ОЗ
                  </span>
                  <span className="text-[var(--text-primary)] font-bold">{enemyHp} / {enemyMaxHp}</span>
                </div>
                <div className="h-4 w-full bg-[var(--bar-track)] rounded-full overflow-hidden border border-[var(--border-light)] p-0.5 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.6)] transition-all duration-300"
                    style={{ width: `${enemyHpPct}%` }}
                  />
                </div>
              </div>

              {/* Enemy Attack Timer Bar */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] font-mono text-stone-500">
                  <span>Скорость атаки</span>
                  <span>{(enemyAttackTimer / 1000).toFixed(1)} сек.</span>
                </div>
                <div className="h-1.5 w-full bg-[var(--bar-track)] rounded-full overflow-hidden border border-[var(--border-light)]">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-100"
                    style={{ width: `${enemyAttackProgress}%` }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Combat Toggles & Kill Counter */}
          <div className="mt-4 pt-3 border-t border-[var(--border-light)] flex flex-wrap gap-x-6 gap-y-2 justify-between items-center">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoEat}
                  onChange={(e) => setAutoEat(e.target.checked)}
                  className="rounded-lg bg-[var(--bg-slot)] border-[var(--border-default)] text-amber-500 focus:ring-amber-500 h-4 w-4 accent-amber-500 cursor-pointer"
                />
                {t('combat.autoEat')}
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoLoot}
                  onChange={(e) => setAutoLoot(e.target.checked)}
                  className="rounded-lg bg-[var(--bg-slot)] border-[var(--border-default)] text-amber-500 focus:ring-amber-500 h-4 w-4 accent-amber-500 cursor-pointer"
                />
                {t('combat.autoLoot')}
              </label>
            </div>
            
            <div className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-1.5">
              <Skull className="w-3.5 h-3.5 text-red-400" />
              {t('combat.killCount')}: <span className="text-amber-300 font-bold">{formatNumber(killCount)}</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
});

const FoodPanel = memo(function FoodPanel() {
  const { t } = useTranslation();
  const eatFood = useCombatStore(s => s.eatFood);
  const bankItems = useInventoryStore(s => s.items);

  const foodItems = bankItems
    .map(s => ({ slot: s, item: getItem(s.itemId) }))
    .filter(({ item }) => item && item.healAmount && item.healAmount > 0);

  return (
    <div className="fantasy-card border-stone-800 rounded-3xl p-3.5 shadow-lg">
      <h3 className="font-mono text-xs font-extrabold uppercase tracking-widest text-[var(--text-secondary)] mb-2.5 px-1 flex items-center gap-1.5">
        <Utensils className="w-3.5 h-3.5 text-amber-400" /> {t('combat.food')}
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {foodItems.map(({ slot, item }) => (
          <button
            key={slot.itemId}
            onClick={() => eatFood(slot.itemId)}
            className="flex items-center gap-2 shrink-0 bg-[var(--bg-card-dark)] border border-[var(--border-default)] hover:border-emerald-500 p-2 rounded-2xl transition-all active:scale-95 shadow-sm"
          >
            <ItemIcon itemId={slot.itemId} size="sm" quantity={slot.quantity} showTooltip={false} />
            <div className="text-left">
              <div className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[100px]">{item?.name}</div>
              <div className="text-[11px] text-emerald-400 font-mono font-bold">+{item?.healAmount} HP</div>
            </div>
          </button>
        ))}
        {foodItems.length === 0 && (
          <p className="text-xs text-slate-500 py-1 px-1 font-mono">{t('combat.noFood')}</p>
        )}
      </div>
    </div>
  );
});

/* Показывает картинку/эмодзи предмета внутри ячейки без лишних рамок */
function EquipItemVisual({ itemId, label }: { itemId: string; label: string }) {
  const item = getItem(itemId);
  const visual = getItemVisual(itemId);
  return visual?.type === 'image' ? (
    <img src={visual.value} alt={item?.name ?? label}
      className="w-[78%] h-[78%] object-contain drop-shadow-md" />
  ) : (
    <span className="text-2xl leading-none drop-shadow-sm">{visual?.value ?? '?'}</span>
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
    <button
      type="button"
      onClick={handleUnequip}
      title={itemId ? `Снять: ${label}` : label}
      className="relative flex flex-col items-center gap-0.5 group"
    >
      {/* Ячейка */}
      <div className={`w-16 h-16 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 relative overflow-hidden ${
        itemId
          ? 'border-amber-500/50'
          : 'border-stone-700/35'
      }`}
        style={{
          background: itemId ? 'var(--accent-gold-bg)' : 'var(--bg-slot)',
          boxShadow: itemId
            ? '0 0 10px rgba(245,158,11,0.12), inset 0 1px 0 rgba(255,200,80,0.06)'
            : 'inset 0 2px 5px rgba(0,0,0,0.5)',
          borderStyle: itemId ? 'solid' : 'dashed',
        }}
      >
        {itemId ? (
          <EquipItemVisual itemId={itemId} label={label} />
        ) : (
          /* Пустая ячейка — только маленький индикатор, без текста */
          <div style={{ width: 10, height: 10, borderRadius: '50%', border: '1px solid rgba(120,78,30,0.3)' }} />
        )}
      </div>
      {/* Подпись под ячейкой */}
      <span className="text-[9px] font-mono tracking-wide leading-none mt-0.5 truncate max-w-[64px] text-center" style={{ color: itemId ? '#f0d070' : '#c8a050' }}>
        {label}
      </span>
    </button>
  );
}
