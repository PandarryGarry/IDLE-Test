import React, { useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { manualSave } from '@/lib/saveManager';
import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'wouter';
import { CoinsDisplay } from '@/shared/ui/CoinsDisplay';
import { 
  Sword, 
  Backpack, 
  Save, 
  Check, 
  Globe, 
  Menu, 
  ShieldCheck 
} from 'lucide-react';

interface TopNavBarProps {
  onOpenMobileMenu?: () => void;
}

export function TopNavBar({ onOpenMobileMenu }: TopNavBarProps) {
  const { t } = useTranslation();
  const combatLevel = usePlayerStore(s => s.combatLevel);
  const gp = useInventoryStore(s => s.gp);
  const items = useInventoryStore(s => s.items);
  const maxSlots = useInventoryStore(s => s.maxSlots);
  const language = useSettingsStore(s => s.language);
  const updateSetting = useSettingsStore(s => s.updateSetting);
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
    updateSetting('language', nextLang);
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#1b2537]/95 border-b border-[#2d3d56] shadow-xl">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 h-14 flex items-center justify-between gap-2">
        
        {/* Left: Mobile menu toggle + Brand */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl bg-[#222f44] border border-[#334460] text-slate-200 hover:text-white hover:border-amber-400/50 active:scale-95 transition-all"
            aria-label="Открыть меню"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2 group md:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/30 to-emerald-500/20 border border-amber-400/50 flex items-center justify-center overflow-hidden shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all">
              <img src="/assets/images/hud/game_crest.png" alt="Aethelia" className="w-7 h-7 object-contain" />
            </div>
            <span className="font-display font-black text-sm tracking-wide text-foreground">
              Aethelia<span className="text-amber-400 font-sans font-extrabold text-xs">RPG</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#222f44] border border-[#334460] text-slate-200 shadow-inner">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Мир: <b className="text-emerald-300 font-sans font-bold">Этелия</b></span>
            </span>
          </div>
        </div>

        {/* Right: Player stats pill widgets */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Combat Level Badge */}
          <Link
            href="/combat"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#222f44] border border-red-500/40 hover:border-red-500/70 transition-all hover:bg-red-500/15 active:scale-95 shadow-sm"
            title={t('combat.combatLevel')}
          >
            <Sword className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="font-mono text-xs font-bold text-red-300">
              {combatLevel} <span className="text-[10px] uppercase font-normal text-slate-400 hidden sm:inline">LVL</span>
            </span>
          </Link>

          {/* Coins in Bag Badge */}
          <Link
            href="/inventory"
            className="flex items-center px-2.5 py-1 rounded-xl bg-[#222f44] border border-amber-400/40 hover:border-amber-400/70 transition-all hover:bg-amber-500/15 active:scale-95 shadow-sm"
            title="Кошелек с монетами"
          >
            <CoinsDisplay amount={gp} size="xs" />
          </Link>

          {/* Inventory capacity */}
          <Link
            href="/inventory"
            className={`hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all active:scale-95 shadow-sm ${
              isInventoryFull
                ? 'bg-red-500/20 border-red-500/60 text-red-200 animate-pulse'
                : 'bg-[#222f44] border-[#334460] hover:border-sky-400/50 text-slate-200'
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
            className="p-1.5 sm:px-2 sm:py-1 rounded-xl bg-[#222f44] border border-[#334460] hover:border-slate-500 text-slate-200 hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1 active:scale-95"
            title="Переключить язык"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline uppercase font-sans font-bold">{language}</span>
          </button>

          {/* Quick Save Button */}
          <button
            type="button"
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm ${
              savedRecently
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-[#222f44] hover:bg-slate-700 text-slate-200 hover:text-white border border-[#334460] hover:border-amber-400/50'
            }`}
            title={t('nav.save')}
          >
            {savedRecently ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Сохранено!</span>
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
