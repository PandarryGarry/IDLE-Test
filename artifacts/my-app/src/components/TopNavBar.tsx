import React, { useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { manualSave } from '@/lib/saveManager';
import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'wouter';
import { CoinsDisplay } from '@/shared/ui/CoinsDisplay';
import { Sword, Backpack, Save, Check, Globe, Menu } from 'lucide-react';

interface TopNavBarProps { onOpenMobileMenu?: () => void }

export function TopNavBar({ onOpenMobileMenu }: TopNavBarProps) {
  const { t } = useTranslation();
  const combatLevel  = usePlayerStore(s => s.combatLevel);
  const gp           = useInventoryStore(s => s.gp);
  const items        = useInventoryStore(s => s.items);
  const maxSlots     = useInventoryStore(s => s.maxSlots);
  const language     = useSettingsStore(s => s.language);
  const updateSetting = useSettingsStore(s => s.updateSetting);
  const notifyInfo   = useNotificationsStore(s => s.notifyInfo);
  const [savedRecently, setSavedRecently] = useState(false);

  const usedSlots = items.filter(i => i.quantity > 0).length;
  const isFull    = usedSlots >= maxSlots;

  const handleSave = () => {
    manualSave();
    notifyInfo(t('notif.gameSaved'));
    setSavedRecently(true);
    setTimeout(() => setSavedRecently(false), 2000);
  };

  /* Цвет рамки/текста для пилюль */
  const pill = "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all text-xs font-mono font-bold";
  const pillBase = "bg-stone-900/80 border-stone-700/60 text-stone-300 hover:border-amber-500/40 hover:text-amber-200 active:scale-95";

  return (
    <header className="sticky top-0 z-30 w-full border-b"
      style={{ background: 'rgba(22,14,6,0.97)', borderColor: '#2e2010', backdropFilter: 'blur(12px)', boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 h-13 flex items-center justify-between gap-2">

        {/* ── Левая часть ── */}
        <div className="flex items-center gap-2.5">
          {/* Кнопка мобильного меню */}
          <button type="button" onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg border border-stone-700/60 bg-stone-900/70 text-stone-300 hover:text-stone-100 hover:border-amber-500/40 active:scale-95 transition-all"
            aria-label="Открыть меню">
            <Menu className="w-4 h-4" />
          </button>

          {/* Лого (мобайл) */}
          <Link href="/" className="flex items-center gap-2 md:hidden group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#92400e,#b45309)', boxShadow: '0 0 10px rgba(180,83,9,0.35)' }}>
              <Sword className="w-3.5 h-3.5 text-amber-200" />
            </div>
            <span className="font-display font-black text-sm text-stone-100">
              Aethelia<span className="text-amber-400 font-sans text-xs font-extrabold">RPG</span>
            </span>
          </Link>

          {/* Мир (десктоп) */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-stone-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span>Мир: <b className="text-stone-300 font-sans font-semibold">Этелия</b></span>
          </div>
        </div>

        {/* ── Правая часть — статы ── */}
        <div className="flex items-center gap-1.5 sm:gap-2">

          {/* Уровень боя */}
          <Link href="/combat" className={`${pill} border-red-800/50 bg-red-950/30 text-red-300 hover:bg-red-900/30 hover:border-red-500/50 active:scale-95`}>
            <Sword className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>{combatLevel}</span>
            <span className="hidden sm:inline text-red-400/60 font-normal text-[10px]">LVL</span>
          </Link>

          {/* Монеты */}
          <Link href="/inventory" className={`${pill} ${pillBase}`}>
            <CoinsDisplay amount={gp} size="xs" />
          </Link>

          {/* Слоты инвентаря */}
          <Link href="/inventory" className={`hidden xs:flex ${pill} ${
            isFull ? 'border-red-500/50 bg-red-950/30 text-red-300' : pillBase
          } active:scale-95`}>
            <Backpack className={`w-3.5 h-3.5 shrink-0 ${isFull ? 'text-red-400' : 'text-sky-400'}`} />
            <span>{usedSlots}/{maxSlots}</span>
          </Link>

          {/* Язык */}
          <button type="button" onClick={() => updateSetting('language', language === 'ru' ? 'en' : 'ru')}
            className={`${pill} ${pillBase}`} title="Язык">
            <Globe className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline uppercase text-[11px]">{language}</span>
          </button>

          {/* Сохранение */}
          <button type="button" onClick={handleSave}
            className={`${pill} active:scale-95 ${
              savedRecently
                ? 'bg-emerald-500 border-emerald-400 text-stone-950 font-black'
                : 'bg-stone-900/80 border-stone-700/60 text-stone-300 hover:border-amber-500/40 hover:text-amber-200'
            }`}>
            {savedRecently
              ? <><Check className="w-3.5 h-3.5 stroke-[3]" /><span className="hidden sm:inline">Сохранено</span></>
              : <><Save className="w-3.5 h-3.5 text-amber-400" /><span className="hidden sm:inline">{t('ui.save')}</span></>}
          </button>
        </div>
      </div>
    </header>
  );
}
