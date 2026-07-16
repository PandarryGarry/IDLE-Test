import React, { useEffect, useRef } from 'react';
import { useCombatStore } from '@/store/combatStore';
import { usePlayerStore } from '@/store/playerStore';
import { COMBAT_AREAS, MONSTERS_MAP } from '@/data/monsters';
import { ProgressBar } from '@/components/ProgressBar';
import { ItemIcon } from '@/components/ItemIcon';
import { useBankStore } from '@/store/bankStore';
import { getItem } from '@/data/items';
import { EquipSlot } from '@/data/types';
import { useTranslation } from '@/hooks/useTranslation';

export function CombatPage() {
  const { t } = useTranslation();
  const combatStore = useCombatStore();
  const playerStore = usePlayerStore();
  const bankStore = useBankStore();
  const combatLogEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    combatLogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatStore.combatLog]);

  const handleAreaClick = (areaId: string, minLevel = 1) => {
    if (playerStore.combatLevel < minLevel) return;
    if (combatStore.inCombat) combatStore.stopCombat();
    combatStore.startCombat(areaId);
  };

  return (
    <div className="space-y-4">
      {/* Mobile: stacked; Desktop: two columns */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* LEFT: Areas + Equipment */}
        <div className="w-full lg:w-80 xl:w-96 space-y-4 shrink-0">

          {/* Areas */}
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <h2 className="font-black text-sm uppercase tracking-widest text-muted-foreground mb-3">{t('combat.areas')}</h2>
            <div className="space-y-2">
              {COMBAT_AREAS.map(area => {
                const isLocked = playerStore.combatLevel < (area.combatLevelRequired ?? 1);
                const isActive = combatStore.activeAreaId === area.id;
                return (
                  <div
                    key={area.id}
                    onClick={() => handleAreaClick(area.id, area.combatLevelRequired ?? 1)}
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
                  </div>
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

        {/* RIGHT: Combat + Log + Food */}
        <div className="flex-1 space-y-4 min-w-0">

          {/* Combat screen */}
          <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm min-h-[280px] flex flex-col relative overflow-hidden">
            {!combatStore.inCombat ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <div className="text-5xl mb-3 opacity-25">⚔️</div>
                <h2 className="text-xl font-black text-foreground/40">{t('combat.selectArea')}</h2>
              </div>
            ) : (
              <div className="h-full flex flex-col z-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-2">
                    <span className="text-primary">{t('combat.fighting')}</span> {combatStore.currentMonster?.name}
                  </h2>
                  <button
                    onClick={combatStore.stopCombat}
                    className="px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white font-bold rounded-xl text-sm transition-all"
                  >
                    {t('combat.stop')}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center flex-grow py-2">
                  {/* Player */}
                  <div className="flex-1 w-full text-center space-y-2">
                    <div className="font-bold text-sm text-muted-foreground">You (Lvl {playerStore.combatLevel})</div>
                    <div className="text-4xl md:text-5xl">🧑‍🌾</div>
                    <ProgressBar
                      value={combatStore.playerHp / combatStore.playerMaxHp}
                      label={`${combatStore.playerHp} / ${combatStore.playerMaxHp}`}
                      colorClass="bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                      className="h-6 md:h-8 w-full"
                    />
                    <ProgressBar
                      value={1 - (combatStore.playerAttackTimer / 2400)}
                      colorClass="bg-blue-500"
                      className="h-1.5 opacity-60"
                    />
                  </div>

                  <div className="text-3xl font-black text-muted-foreground/50 animate-pulse shrink-0">⚔️</div>

                  {/* Enemy */}
                  <div className="flex-1 w-full text-center space-y-2">
                    <div className="font-bold text-sm text-muted-foreground">
                      {combatStore.currentMonster?.name} (Lvl {combatStore.currentMonster?.combatLevel})
                    </div>
                    <div className="text-4xl md:text-5xl">{combatStore.currentMonster?.isBoss ? '🐉' : '👹'}</div>
                    <ProgressBar
                      value={combatStore.enemyHp / combatStore.enemyMaxHp}
                      label={`${combatStore.enemyHp} / ${combatStore.enemyMaxHp}`}
                      colorClass="bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                      className="h-6 md:h-8 w-full"
                    />
                    <ProgressBar
                      value={1 - (combatStore.enemyAttackTimer / (combatStore.currentMonster?.attackInterval || 2400))}
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
                        checked={combatStore.autoEat}
                        onChange={(e) => combatStore.setAutoEat(e.target.checked)}
                        className="rounded bg-input border-border text-primary focus:ring-primary h-4 w-4 accent-primary"
                      />
                      {t('combat.autoEat')}
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={combatStore.autoLoot}
                        onChange={(e) => combatStore.setAutoLoot(e.target.checked)}
                        className="rounded bg-input border-border text-primary focus:ring-primary h-4 w-4 accent-primary"
                      />
                      {t('combat.autoLoot')}
                    </label>
                  </div>
                  <div className="text-sm font-mono text-muted-foreground">
                    {t('combat.killCount')}: <span className="text-amber-400 font-bold">{combatStore.killCount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Combat Log */}
          <div className="bg-card border border-border rounded-2xl p-3 shadow-sm flex flex-col h-48 md:h-56">
            <h3 className="font-black text-[11px] uppercase tracking-widest text-muted-foreground mb-2 px-1">{t('combat.log')}</h3>
            <div className="flex-1 overflow-y-auto space-y-0.5 font-mono text-[11px] p-2 bg-background rounded-xl border border-border/50 shadow-inner">
              {combatStore.combatLog.map((log) => (
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
              <div ref={combatLogEndRef} />
            </div>
          </div>

          {/* Food */}
          {combatStore.inCombat && (
            <div className="bg-card border border-border rounded-2xl p-3 shadow-sm">
              <h3 className="font-black text-[11px] uppercase tracking-widest text-muted-foreground mb-2 px-1">Food</h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {bankStore.items
                  .map(s => ({ slot: s, item: getItem(s.itemId) }))
                  .filter(({ item }) => item && item.healAmount && item.healAmount > 0)
                  .map(({ slot, item }) => (
                    <button
                      key={slot.itemId}
                      onClick={() => combatStore.eatFood(slot.itemId)}
                      className="flex items-center gap-2 shrink-0 bg-background border border-border hover:border-primary p-2 rounded-xl transition-all active:scale-95"
                    >
                      <ItemIcon itemId={slot.itemId} size="sm" quantity={slot.quantity} />
                      <div className="text-left">
                        <div className="text-xs font-bold">{item?.name}</div>
                        <div className="text-[11px] text-green-400 font-mono">+{item?.healAmount} HP</div>
                      </div>
                    </button>
                  ))
                }
                {bankStore.items.filter(s => getItem(s.itemId)?.healAmount).length === 0 && (
                  <p className="text-sm text-muted-foreground py-1 px-1">No food in bank.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <div
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
    </div>
  );
}
