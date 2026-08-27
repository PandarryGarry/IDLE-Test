import React, { useState } from 'react';
import { SkillHeader } from '@/components/SkillHeader';
import { ActionGrid } from '@/components/ActionGrid';
import { ActionProgressBar } from '@/components/ActionProgressBar';
import { SMELTING_RECIPES, SMITHING_RECIPES, SMITHING_MAP } from '@/data/smithing';
import { useGameStore } from '@/store/gameStore';
import { useBankStore } from '@/store/bankStore';
import { ItemIcon } from '@/components/ItemIcon';
import { useTranslation } from '@/hooks/useTranslation';
import { Square, Clock } from 'lucide-react';
import { SkillIcon } from '@/components/SkillIcon';

export function SmithingPage() {
  const { t } = useTranslation();
  
  const startSkillAction = useGameStore(s => s.startSkillAction);
  const stopAction = useGameStore(s => s.stopAction);
  const activeSkill = useGameStore(s => s.activeSkill);
  const activeActionId = useGameStore(s => s.activeActionId);
  
  const bankItems = useBankStore(s => s.items);
  const [tab, setTab] = useState<'smelting' | 'equipment'>('smelting');

  const handleActionClick = (actionId: string) => {
    if (activeSkill === 'smithing' && activeActionId === actionId) {
      stopAction();
    } else {
      startSkillAction('smithing', actionId);
    }
  };

  const activeRecipe = activeActionId ? SMITHING_MAP[activeActionId] : undefined;
  const isTraining = activeSkill === 'smithing' && !!activeRecipe;
  const currentList = tab === 'smelting' ? SMELTING_RECIPES : SMITHING_RECIPES;

  const getItemQty = (itemId: string): number => {
    return bankItems.find(s => s.itemId === itemId)?.quantity ?? 0;
  };

  return (
    <div className="space-y-4">
      <SkillHeader skillId="smithing" skillName={t('skill.smithing')} skillIcon="🔨" />

      {/* Active Action Panel */}
      <div className={`rounded-3xl p-4 sm:p-5 relative overflow-hidden transition-all border ${
        isTraining 
          ? 'bg-gradient-to-b from-orange-950/40 via-[#221810] to-[#1c1108] border-orange-500/80 shadow-[0_0_24px_rgba(249,115,22,0.3)]' 
          : 'g-card border-[var(--border-default)]'
      }`}>
        {isTraining && activeRecipe ? (
          <div className="space-y-3.5 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-400/50 flex items-center justify-center text-2xl shadow-inner shrink-0 p-1.5 animate-pulse">
                  <SkillIcon skillId="smithing" size="md" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <span>{t('smithing.smithing')}</span>
                    <span className="text-orange-300 font-extrabold">{activeRecipe.name}</span>
                  </h3>
                  <p className="text-[var(--text-secondary)] text-xs font-mono mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    <span>{(activeRecipe.interval / 1000).toFixed(1)} сек. за действие</span>
                  </p>
                </div>
              </div>

              <button
                onClick={stopAction}
                className="shrink-0 px-5 py-2.5 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white border border-red-500/40 font-bold rounded-2xl transition-all text-xs active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t('smithing.stop')}</span>
              </button>
            </div>

            <div className="pt-1">
              <ActionProgressBar height="h-3" color="amber" />
            </div>
          </div>
        ) : (
          <div className="text-center text-[var(--text-secondary)] flex flex-col items-center gap-2 py-6">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-light)] flex items-center justify-center p-2">
              <SkillIcon skillId="smithing" size="md" />
            </div>
            <p className="text-xs font-medium text-[var(--text-secondary)]">{t('smithing.selectRecipe')}</p>
          </div>
        )}
      </div>

      {/* Modern Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('smelting')}
          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-2xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
            tab === 'smelting' 
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md' 
              : 'g-card border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          🔥 {t('smithing.smelting')}
        </button>
        <button
          onClick={() => setTab('equipment')}
          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-2xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
            tab === 'equipment' 
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md' 
              : 'g-card border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          🛡️ {t('smithing.equipment')}
        </button>
      </div>

      <ActionGrid
        skillId="smithing"
        actions={currentList}
        onActionClick={handleActionClick}
        renderExtra={(action) => (
          <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-stone-800">
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider font-mono">{t('smithing.ingredients')}:</span>
            <div className="flex flex-wrap gap-1.5">
              {action.ingredients.map((ing: any, i: number) => {
                const qty = getItemQty(ing.itemId);
                const hasEnough = qty >= ing.quantity;
                return (
                  <div key={i} className="flex items-center gap-1 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800">
                    <ItemIcon itemId={ing.itemId} size="sm" />
                    <span className={`text-xs font-mono font-bold ${hasEnough ? 'text-[var(--text-primary)]' : 'text-red-400'}`}>
                      {qty}/{ing.quantity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      />
    </div>
  );
}
