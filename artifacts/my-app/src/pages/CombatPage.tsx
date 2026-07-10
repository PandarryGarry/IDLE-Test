import React, { useEffect, useRef } from 'react';
import { useCombatStore } from '@/store/combatStore';
import { usePlayerStore } from '@/store/playerStore';
import { COMBAT_AREAS, MONSTERS_MAP } from '@/data/monsters';
import { ProgressBar } from '@/components/ProgressBar';
import { PRAYERS } from '@/data/prayers';
import { ItemIcon } from '@/components/ItemIcon';
import { useBankStore } from '@/store/bankStore';
import { getItem } from '@/data/items';
import { EquipSlot } from '@/data/types';

export function CombatPage() {
  const combatStore = useCombatStore();
  const playerStore = usePlayerStore();
  const bankStore = useBankStore();

  const combatLogEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll combat log
  useEffect(() => {
    combatLogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatStore.combatLog]);

  const handleAreaClick = (areaId: string, minLevel = 1) => {
    if (playerStore.combatLevel < minLevel) return;
    if (combatStore.inCombat) combatStore.stopCombat();
    combatStore.startCombat(areaId);
  };

  const equipSlots: EquipSlot[] = ['helm', 'amulet', 'cape', 'weapon', 'platebody', 'shield', 'platelegs', 'gloves', 'boots', 'ring'];

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
      {/* LEFT COLUMN - Navigation & Info */}
      <div className="w-full lg:w-1/3 space-y-6">
        
        {/* Areas */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="font-black text-xl mb-4 border-b border-border/50 pb-2">Combat Areas</h2>
          <div className="space-y-3">
            {COMBAT_AREAS.map(area => {
              const isLocked = playerStore.combatLevel < (area.combatLevelRequired ?? 1);
              const isActive = combatStore.activeAreaId === area.id;
              return (
                <div 
                  key={area.id}
                  onClick={() => handleAreaClick(area.id, area.combatLevelRequired ?? 1)}
                  className={`p-3 rounded-lg border transition-all ${
                    isLocked ? 'opacity-50 grayscale cursor-not-allowed bg-background border-border/50' 
                    : isActive ? 'bg-primary/10 border-primary shadow-[0_0_10px_rgba(34,197,94,0.1)] ring-1 ring-primary'
                    : 'bg-background hover:border-primary/50 cursor-pointer border-border'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-base">{area.name}</h3>
                    {isLocked && <span className="text-xs font-bold text-destructive">Lvl {area.combatLevelRequired}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{area.description}</p>
                  <div className="mt-2 text-xs flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {area.monsterIds.map(mId => (
                      <span key={mId} className="bg-accent px-1.5 py-0.5 rounded font-mono border border-border whitespace-nowrap">
                        {MONSTERS_MAP[mId]?.name} (Lvl {MONSTERS_MAP[mId]?.combatLevel})
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Equipment */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="font-black text-xl mb-4 border-b border-border/50 pb-2">Equipment</h2>
          <div className="grid grid-cols-3 gap-2 justify-items-center mb-4">
            <div className="col-span-3"><EquipSlotBox slot="helm" /></div>
            <EquipSlotBox slot="cape" /> <EquipSlotBox slot="amulet" /> <EquipSlotBox slot="quiver" />
            <EquipSlotBox slot="weapon" /> <EquipSlotBox slot="platebody" /> <EquipSlotBox slot="shield" />
            <div className="col-span-3"><EquipSlotBox slot="platelegs" /></div>
            <EquipSlotBox slot="gloves" /> <EquipSlotBox slot="boots" /> <EquipSlotBox slot="ring" />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Active Combat */}
      <div className="w-full lg:w-2/3 space-y-6">
        
        {/* Combat Screen */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[350px] flex flex-col relative overflow-hidden">
          {!combatStore.inCombat ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <div className="text-6xl mb-4 opacity-30">⚔️</div>
              <h2 className="text-2xl font-black text-foreground/50">Not in combat</h2>
              <p className="mt-2">Select an area to start fighting.</p>
            </div>
          ) : (
            <div className="h-full flex flex-col z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                  <span className="text-primary">VS</span> {combatStore.currentMonster?.name}
                </h2>
                <button 
                  onClick={combatStore.stopCombat}
                  className="px-4 py-1.5 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white font-bold rounded text-sm transition-colors"
                >
                  Flee
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center justify-center flex-grow py-4">
                
                {/* Player Stats */}
                <div className="flex-1 w-full text-center space-y-3">
                  <div className="font-bold text-lg">You (Lvl {playerStore.combatLevel})</div>
                  <div className="text-5xl mb-2">🧑‍🌾</div>
                  <ProgressBar 
                    value={combatStore.playerHp / combatStore.playerMaxHp} 
                    label={`${combatStore.playerHp} / ${combatStore.playerMaxHp}`} 
                    colorClass="bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" 
                    className="h-8 w-full"
                  />
                  <ProgressBar value={1 - (combatStore.playerAttackTimer / 2400)} colorClass="bg-blue-500" className="h-2 opacity-70" />
                </div>

                <div className="text-4xl font-black text-muted-foreground animate-pulse">
                  ⚔️
                </div>

                {/* Enemy Stats */}
                <div className="flex-1 w-full text-center space-y-3">
                  <div className="font-bold text-lg">{combatStore.currentMonster?.name} (Lvl {combatStore.currentMonster?.combatLevel})</div>
                  <div className="text-5xl mb-2">{combatStore.currentMonster?.isBoss ? '🐉' : '👹'}</div>
                  <ProgressBar 
                    value={combatStore.enemyHp / combatStore.enemyMaxHp} 
                    label={`${combatStore.enemyHp} / ${combatStore.enemyMaxHp}`} 
                    colorClass="bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                    className="h-8 w-full"
                  />
                  <ProgressBar value={1 - (combatStore.enemyAttackTimer / (combatStore.currentMonster?.attackInterval || 2400))} colorClass="bg-orange-500" className="h-2 opacity-70" />
                </div>

              </div>

              {/* Combat Controls */}
              <div className="mt-auto pt-6 border-t border-border/50 flex gap-4 justify-between items-center">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={combatStore.autoEat} 
                      onChange={(e) => combatStore.setAutoEat(e.target.checked)} 
                      className="rounded bg-input border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    Auto-Eat
                  </label>
                  <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={combatStore.autoLoot} 
                      onChange={(e) => combatStore.setAutoLoot(e.target.checked)} 
                      className="rounded bg-input border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    Auto-Loot
                  </label>
                </div>
                <div className="text-sm font-mono text-muted-foreground">
                  Kills: <span className="text-amber-400">{combatStore.killCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Combat Log */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col h-64">
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3 px-1">Combat Log</h3>
          <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-xs p-2 bg-background rounded border border-border/50 shadow-inner">
            {combatStore.combatLog.map((log) => (
              <div key={log.id} className={`py-0.5 ${
                log.type === 'player_attack' ? (log.damage && log.damage > 0 ? 'text-green-400' : 'text-slate-400') :
                log.type === 'enemy_attack' ? (log.damage && log.damage > 0 ? 'text-red-400' : 'text-slate-400') :
                log.type === 'player_death' || log.type === 'enemy_death' ? 'text-amber-400 font-bold' :
                log.type === 'eat' ? 'text-blue-400' : 'text-muted-foreground'
              }`}>
                <span className="opacity-50 mr-2">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}]</span>
                {log.message}
              </div>
            ))}
            <div ref={combatLogEndRef} />
          </div>
        </div>

        {/* Food Quick Select */}
        {combatStore.inCombat && (
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3 px-1">Food Inventory</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border">
              {bankStore.items
                .map(s => ({ slot: s, item: getItem(s.itemId) }))
                .filter(({ item }) => item && item.healAmount && item.healAmount > 0)
                .map(({ slot, item }) => (
                  <button 
                    key={slot.itemId}
                    onClick={() => combatStore.eatFood(slot.itemId)}
                    className="flex items-center gap-2 bg-background border border-border hover:border-primary p-2 rounded shrink-0 transition-colors"
                  >
                    <ItemIcon itemId={slot.itemId} size="sm" quantity={slot.quantity} />
                    <div className="text-left">
                      <div className="text-xs font-bold">{item?.name}</div>
                      <div className="text-xs text-green-400 font-mono">+{item?.healAmount} HP</div>
                    </div>
                  </button>
                ))
              }
              {bankStore.items.filter(s => getItem(s.itemId)?.healAmount).length === 0 && (
                <div className="text-sm text-muted-foreground py-2 px-1">No food in bank.</div>
              )}
            </div>
          </div>
        )}

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
      className={`w-12 h-12 rounded border flex items-center justify-center relative ${
        itemId ? 'bg-accent border-primary/50 cursor-pointer hover:border-destructive' : 'bg-background border-border/30 opacity-50'
      }`}
      title={slot}
    >
      {itemId ? (
        <ItemIcon itemId={itemId} size="md" />
      ) : (
        <span className="text-xs text-muted-foreground font-mono">{slot.substring(0, 3)}</span>
      )}
    </div>
  );
}