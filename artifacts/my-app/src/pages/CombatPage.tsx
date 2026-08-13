import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { useCombatStore } from '@/store/combatStore';
import { usePlayerStore } from '@/store/playerStore';
import { useShallow } from 'zustand/react/shallow';
import { COMBAT_AREAS, MONSTERS_MAP } from '@/data/monsters';
import { ProgressBar } from '@/components/ProgressBar';
import { ItemIcon } from '@/components/ItemIcon';
import { useBankStore } from '@/store/bankStore';
import { getItem } from '@/data/items';
import { EquipSlot } from '@/data/types';
import { useTranslation } from '@/hooks/useTranslation';

export function CombatPage() {
  const { t } = useTranslation();

  // Селекторы для статических/редко меняющихся данных
  // useShallow сравнивает по значению и предотвращает лишние ре-рендеры
  const inCombat = useCombatStore(s => s.inCombat);
  const activeAreaId = useCombatStore(s => s.activeAreaId);
  const combatLog = useCombatStore(s => s.combatLog);
  const totalDamageDealt = useCombatStore(s => s.totalDamageDealt);
  const totalDamageTaken = useCombatStore(s => s.totalDamageTaken);
  const killCount = useCombatStore(s => s.killCount);
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

  // Keep the local log pinned only while the player is already at the bottom.
  // Scrolling up pauses the pin so the player can inspect older hits and misses.
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
      {/* Mobile: stacked; Desktop: two columns */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* LEFT: Areas + Equipment — не перерисовывается во время боя */}
        <div className="w-full lg:w-80 xl:w-96 space-y-4 shrink-0">

          {/* Areas */}
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <h2 className="font-black text-sm uppercase tracking-widest text-muted-foreground mb-3">{t('combat.areas')}</h2>
            <div className="space-y-2">
              {COMBAT_AREAS.map(area => {
                const isLocked = combatLevel < (area.combatLevelRequired ?? 1);
                const isActive = activeAreaId === area.id;
                return (
                  <button
                    type="button"
                    key={area.id}
                    onClick={() => handleAreaClick(area.id, area.combatLevelRequired ?? 1)}
                    disabled={isLocked}
                    className={`p-3 rounded-xl border transition-all ${
                      isLocked
                        ? 'opacity-50 grayscale cursor-not-allowed bg-background border-border/50'
                        : isActive
                          ? 'bg-primary/10 border-primary shadow-[0_0_10px_rgba(34,197,94,0.08)] ring-1 ring-primary/40'
                          : 'bg-background hover:border-primary/40 cursor-pointer border-border active:scale-[0.98]'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className="font-bold text-sm">{area.name}</h3>
                      {isLocked && (
                        <span className="text-[11px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-lg">
                          Lvl {area.combatLevelRequired}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{area.description}</p>
                    <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-0.5">
                      {area.monsterIds.map(mId => (
                        <span key={mId} className="shrink-0 bg-accent px-1.5 py-0.5 rounded-lg text-[11px] font-mono border border-border">
                          {MONSTERS_MAP[mId]?.name} ({MONSTERS_MAP[mId]?.combatLevel})
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Equipment */}
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <h2 className="font-black text-sm uppercase tracking-widest text-muted-foreground mb-3">{t('combat.equipment')}</h2>
            <div className="grid grid-cols-3 gap-2 justify-items-center">
              <div className="col-span-3 w-full flex justify-center"><EquipSlotBox slot="helm" /></div>
              <EquipSlotBox slot="cape" /><EquipSlotBox slot="amulet" /><EquipSlotBox slot="quiver" />
              <EquipSlotBox slot="weapon" /><EquipSlotBox slot="platebody" /><EquipSlotBox slot="shield" />
              <div className="col-span-3 w-full flex justify-center"><EquipSlotBox slot="platelegs" /></div>
              <EquipSlotBox slot="gloves" /><EquipSlotBox slot="boots" /><EquipSlotBox slot="ring" />
            </div>
          </div>
        </div>

        {/* RIGHT: Combat + Log + Food — динамическая часть вынесена в CombatScreen */}
        <div className="flex-1 space-y-4 min-w-0">

          {/* Combat screen — отдельный компонент, перерисовывается только он */}
          <CombatScreen />

          {/* Combat Log — тоже вынесен, чтобы не зависеть от таймеров */}
          <div className="bg-card border border-border rounded-2xl p-3 shadow-sm flex flex-col h-56 md:h-64 min-h-0">
            <div className="flex items-center justify-between gap-2 mb-2 px-1">
              <h3 className="font-black text-[11px] uppercase tracking-widest text-muted-foreground">{t('combat.log')}</h3>
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                <span>{t('combat.damage')}: <b className="text-green-400">{totalDamageDealt}</b></span>
                <span className="hidden sm:inline">{t('combat.taken')}: <b className="text-red-400">{totalDamageTaken}</b></span>
              </div>
            </div>
            <div
              ref={combatLogRef}
              onScroll={handleLogScroll}
              className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-0.5 font-mono text-[11px] p-2 bg-background rounded-xl border border-border/50 shadow-inner scrollbar-thin"
            >
              {combatLog.slice().reverse().map((log) => (
                <div key={log.id} className={`py-px leading-relaxed ${
                  log.type === 'player_attack' ? (log.damage && log.damage > 0 ? 'text-green-400' : 'text-slate-500') :
                  log.type === 'enemy_attack' ? (log.damage && log.damage > 0 ? 'text-red-400' : 'text-slate-500') :
                  log.type === 'player_death' || log.type === 'enemy_death' ? 'text-amber-400 font-bold' :
                  log.type === 'eat' ? 'text-blue-400' : 'text-muted-foreground'
                }`}>
                  <span className="opacity-40 mr-1.5">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                  {log.message}
                </div>
              ))}
            </div>
            {showLatest && (
              <button
                type="button"
                onClick={() => scrollLogToBottom()}
                className="self-center -mt-8 mb-2 z-10 rounded-full border border-primary/30 bg-card/90 px-3 py-1 text-[10px] font-bold text-primary shadow-lg backdrop-blur-md transition-colors hover:bg-primary/10"
              >
                {t('combat.latest')}
              </button>
            )}
          </div>

          {/* Food — показывается только в бою */}
          {inCombat && <FoodPanel />}
        </div>
      </div>
    </div>
  );
}

/**
 * CombatScreen — отдельный компонент для боевой сцены.
 * Перерисовывается при каждом тике боя (100мс), но это изолировано
 * от списка зон и экипировки, которые остаются статичными.
 */
const CombatScreen = memo(function CombatScreen() {
  const { t } = useTranslation();

  // Группируем динамические данные через useShallow —
  // компонент перерисовывается только когда реально меняются значения
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

  return (
    <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm min-h-[280px] flex flex-col relative overflow-hidden">
      {!inCombat ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
          <div className="text-5xl mb-3 opacity-25">⚔️</div>
          <h2 className="text-xl font-black text-foreground/40">{t('combat.selectArea')}</h2>
        </div>
      ) : (
        <div className="h-full flex flex-col z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-2">
              <span className="text-primary">{t('combat.fighting')}</span> {currentMonster?.name}
            </h2>
            <button
              onClick={stopCombat}
              className="px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white font-bold rounded-xl text-sm transition-all"
            >
              {t('combat.stop')}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center flex-grow py-2">
            {/* Player */}
            <div className="flex-1 w-full text-center space-y-2">
              <div className="font-bold text-sm text-muted-foreground">{t('combat.you')} (Lvl {combatLevel})</div>
              <div className="text-4xl md:text-5xl">🧑‍🌾</div>
              <ProgressBar
                value={playerHp / playerMaxHp}
                label={`${playerHp} / ${playerMaxHp}`}
                colorClass="bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                className="h-6 md:h-8 w-full"
              />
              <ProgressBar
                value={1 - (playerAttackTimer / 2400)}
                colorClass="bg-blue-500"
                className="h-1.5 opacity-60"
              />
            </div>

            <div className="text-3xl font-black text-muted-foreground/50 animate-pulse shrink-0">⚔️</div>

            {/* Enemy */}
            <div className="flex-1 w-full text-center space-y-2">
              <div className="font-bold text-sm text-muted-foreground">
                {currentMonster?.name} (Lvl {currentMonster?.combatLevel})
              </div>
              <div className="text-4xl md:text-5xl">{currentMonster?.isBoss ? '🐉' : '👹'}</div>
              <ProgressBar
                value={enemyHp / enemyMaxHp}
                label={`${enemyHp} / ${enemyMaxHp}`}
                colorClass="bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                className="h-6 md:h-8 w-full"
              />
              <ProgressBar
                value={1 - (enemyAttackTimer / (currentMonster?.attackInterval || 2400))}
                colorClass="bg-orange-500"
                className="h-1.5 opacity-60"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="mt-auto pt-3 border-t border-border/50 flex flex-wrap gap-x-5 gap-y-2 justify-between items-center">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm font-bold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoEat}
                  onChange={(e) => setAutoEat(e.target.checked)}
                  className="rounded bg-input border-border text-primary focus:ring-primary h-4 w-4 accent-primary"
                />
                {t('combat.autoEat')}
              </label>
              <label className="flex items-center gap-2 text-sm font-bold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoLoot}
                  onChange={(e) => setAutoLoot(e.target.checked)}
                  className="rounded bg-input border-border text-primary focus:ring-primary h-4 w-4 accent-primary"
                />
                {t('combat.autoLoot')}
              </label>
            </div>
            <div className="text-sm font-mono text-muted-foreground">
              {t('combat.killCount')}: <span className="text-amber-400 font-bold">{killCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

/**
 * FoodPanel — отдельный компонент для списка еды.
 * Перерисовывается только при изменении items в банке.
 */
const FoodPanel = memo(function FoodPanel() {
  const { t } = useTranslation();
  const eatFood = useCombatStore(s => s.eatFood);
  const bankItems = useBankStore(s => s.items);

  const foodItems = bankItems
    .map(s => ({ slot: s, item: getItem(s.itemId) }))
    .filter(({ item }) => item && item.healAmount && item.healAmount > 0);

  return (
    <div className="bg-card border border-border rounded-2xl p-3 shadow-sm">
      <h3 className="font-black text-[11px] uppercase tracking-widest text-muted-foreground mb-2 px-1">{t('combat.food')}</h3>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {foodItems.map(({ slot, item }) => (
          <button
            key={slot.itemId}
            onClick={() => eatFood(slot.itemId)}
            className="flex items-center gap-2 shrink-0 bg-background border border-border hover:border-primary p-2 rounded-xl transition-all active:scale-95"
          >
            <ItemIcon itemId={slot.itemId} size="sm" quantity={slot.quantity} />
            <div className="text-left">
              <div className="text-xs font-bold">{item?.name}</div>
              <div className="text-[11px] text-green-400 font-mono">+{item?.healAmount} HP</div>
            </div>
          </button>
        ))}
        {foodItems.length === 0 && (
          <p className="text-sm text-muted-foreground py-1 px-1">{t('combat.noFood')}</p>
        )}
      </div>
    </div>
  );
});

function EquipSlotBox({ slot }: { slot: EquipSlot }) {
  const itemId = usePlayerStore(s => s.equipment[slot]);
  const unequip = usePlayerStore(s => s.unequipItem);
  const addItem = useBankStore(s => s.addItem);

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
      className={`w-12 h-12 rounded-xl border flex items-center justify-center relative transition-all ${
        itemId
          ? 'bg-accent border-primary/50 cursor-pointer hover:border-destructive active:scale-95'
          : 'bg-background border-border/30 opacity-40'
      }`}
      title={slot}
    >
      {itemId ? (
        <ItemIcon itemId={itemId} size="md" />
      ) : (
        <span className="text-[10px] text-muted-foreground font-mono leading-tight text-center">{slot.substring(0, 3)}</span>
      )}
    </button>
  );
}
