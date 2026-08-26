import React, { useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useBankStore } from '@/store/bankStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { manualSave } from '@/lib/saveManager';
import { useTranslation } from '@/hooks/useTranslation';
import { formatNumber } from '@/lib/utils';
import { Link } from 'wouter';
import { 
  Sword, 
  Coins, 
  Backpack, 
  Save, 
  Check, 
  Globe, 
  Menu,
  ShieldCheck,
  Flame
} from 'lucide-react';

interface TopNavBarProps {
  onOpenMobileMenu?: () => void;
}

export function TopNavBar({ onOpenMobileMenu }: TopNavBarProps) {
  const { t } = useTranslation();
  const combatLevel = usePlayerStore(s => s.combatLevel);
  const gp = useBankStore(s => s.gp);
  const items = useBankStore(s => s.items);
  const maxSlots = useBankStore(s => s.maxSlots);
  const language = useSettingsStore(s => s.language);
  const setLanguage = useSettingsStore(s => s.setLanguage);
  const notifyInfo = useNotificationsStore(s => s.notifyInfo);

  const [savedRecently, setSavedRecently] = useState(false);

  const usedSlots = items.filter(i => i.quantity > 0).length;
  const isInventoryFull = usedSlots >= maxSlots;

  const handleSave = () => {
    manualSave();
    notifyInfo(t('notif.gameSaved'));
    setSavedRecently(true);
    setTimeout(() => setSavedRecently(false), 2000);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'ru' ? 'en' : 'ru';
    setLanguage(nextLang);
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 shadow-lg">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 h-14 flex items-center justify-between gap-2">
        
        {/* Left: Mobile menu toggle + Brand (on mobile) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-amber-500/40 active:scale-95 transition-all"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2 group md:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all">
              <Sword className="w-4 h-4" />
            </div>
            <span className="font-display font-black text-sm tracking-wide text-foreground">
              Aethelia<span className="text-amber-400">Idle</span>
            </span>
          </Link>
          
          {/* Desktop welcome / breadcrumb hint */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Realm: <b className="text-emerald-400">Aethelia Prime</b></span>
            </span>
          </div>
        </div>

        {/* Right: Player stats pill widgets */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Combat Level Badge */}
          <Link
            href="/combat"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-red-500/30 hover:border-red-500/60 transition-all hover:bg-red-500/10 active:scale-95 shadow-sm"
            title={t('combat.combatLevel')}
          >
            <Sword className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="font-mono text-xs font-bold text-red-300">
              {combatLevel} <span className="text-[10px] uppercase font-normal text-slate-400 hidden sm:inline">LVL</span>
            </span>
          </Link>

          {/* GP Gold Balance Badge */}
          <Link
            href="/bank"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/30 hover:border-amber-500/60 transition-all hover:bg-amber-500/15 active:scale-95 shadow-sm"
            title={t('bank.gpBalance')}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-mono text-xs font-extrabold text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
              {formatNumber(gp)}
            </span>
          </Link>

          {/* Inventory capacity */}
          <Link
            href="/inventory"
            className={`hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all active:scale-95 shadow-sm ${
              isInventoryFull
                ? 'bg-red-500/10 border-red-500/50 text-red-300 animate-pulse'
                : 'bg-slate-900/90 border-slate-800 hover:border-sky-500/40 text-slate-300'
            }`}
            title={t('inventory.slots')}
          >
            <Backpack className={`w-3.5 h-3.5 shrink-0 ${isInventoryFull ? 'text-red-400' : 'text-sky-400'}`} />
            <span className="font-mono text-xs font-bold">
              {usedSlots}/{maxSlots}
            </span>
          </Link>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="p-1.5 sm:px-2 sm:py-1 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1 active:scale-95"
            title="Switch Language / Сменить язык"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline uppercase">{language}</span>
          </button>

          {/* Quick Save Button */}
          <button
            type="button"
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm ${
              savedRecently
                ? 'bg-emerald-500 text-slate-950 font-extrabold'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-amber-500/40'
            }`}
            title={t('nav.save')}
          >
            {savedRecently ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">{t('ui.save')}d!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{t('ui.save')}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
