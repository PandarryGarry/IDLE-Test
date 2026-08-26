import React, { useState } from 'react';
import { SkillHeader } from '@/components/SkillHeader';
import { ActionGrid } from '@/components/ActionGrid';
import { ActionProgressBar } from '@/components/ActionProgressBar';
import { SMELTING_RECIPES, SMITHING_RECIPES, SMITHING_MAP } from '@/data/smithing';
import { useGameStore } from '@/store/gameStore';
import { useBankStore } from '@/store/bankStore';
import { ItemIcon } from '@/components/ItemIcon';
import { useTranslation } from '@/hooks/useTranslation';
import { Square, Hammer, Anvil, Clock, Sparkles } from 'lucide-react';

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
      <div className={`fantasy-card rounded-3xl p-4 sm:p-5 relative overflow-hidden transition-all ${
        isTraining ? 'fantasy-card-active border-orange-500/50 shadow-[0_0_25px_rgba(249,115,22,0.2)]' : 'border-slate-800'
      }`}>
        {isTraining && activeRecipe ? (
          <div className="space-y-3.5 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0 animate-pulse">
                  🔨
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>{t('smithing.smithing')}</span>
                    <span className="text-orange-400 font-extrabold">{activeRecipe.name}</span>
                  </h3>
                  <p className="text-slate-400 text-xs font-mono mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    <span>{(activeRecipe.interval / 1000).toFixed(1)}{t('ui.seconds.abbr')} {t('ui.per.action')}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={stopAction}
                className="shrink-0 px-5 py-2.5 bg-red-500/15 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40 font-bold rounded-xl transition-all text-xs active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
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
          <div className="text-center text-slate-400 flex flex-col items-center gap-2 py-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl opacity-60">
              ⚒️
            </div>
            <p className="text-xs font-medium text-slate-400">{t('smithing.selectRecipe')}</p>
          </div>
        )}
      </div>

      {/* Modern Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('smelting')}
          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
            tab === 'smelting' 
              ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
              : 'fantasy-card text-slate-400 hover:text-slate-100'
          }`}
        >
          🔥 {t('smithing.smelting')}
        </button>
        <button
          onClick={() => setTab('equipment')}
          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
            tab === 'equipment' 
              ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
              : 'fantasy-card text-slate-400 hover:text-slate-100'
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
          <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">{t('smithing.ingredients')}:</span>
            <div className="flex flex-wrap gap-1.5">
              {action.ingredients.map((ing: any, i: number) => {
                const qty = getItemQty(ing.itemId);
                const hasEnough = qty >= ing.quantity;
                return (
                  <div key={i} className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    <ItemIcon itemId={ing.itemId} size="sm" />
                    <span className={`text-xs font-mono font-bold ${hasEnough ? 'text-slate-200' : 'text-red-400'}`}>
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
