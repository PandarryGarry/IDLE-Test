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

export function TopNavBar({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
  const { t }          = useTranslation();
  const combatLevel    = usePlayerStore(s => s.combatLevel);
  const gp             = useInventoryStore(s => s.gp);
  const items          = useInventoryStore(s => s.items);
  const maxSlots       = useInventoryStore(s => s.maxSlots);
  const language       = useSettingsStore(s => s.language);
  const updateSetting  = useSettingsStore(s => s.updateSetting);
  const notifyInfo     = useNotificationsStore(s => s.notifyInfo);
  const [savedRecently, setSavedRecently] = useState(false);

  const usedSlots = items.filter(i => i.quantity > 0).length;
  const isFull    = usedSlots >= maxSlots;

  const handleSave = () => {
    manualSave();
    notifyInfo(t('notif.gameSaved'));
    setSavedRecently(true);
    setTimeout(() => setSavedRecently(false), 2000);
  };

  /* ── Базовый стиль пилюли ── */
  const pill: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '5px 9px', borderRadius: 8,
    background: 'linear-gradient(180deg,#7a4818,#5a3010)',
    border: '2px solid #3d1e08',
    fontSize: 12, fontFamily: 'var(--app-font-mono)', fontWeight: 700,
    color: '#f0d070', cursor: 'pointer', textDecoration: 'none',
    boxShadow: '0 2px 0 #2a1005',
    transition: 'all 0.12s',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  };

  const iconBtn: React.CSSProperties = {
    ...pill, padding: '5px 7px',
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30, width: '100%',
      background: 'rgba(90,48,16,0.97)',
      borderBottom: '2px solid #3d1e08',
      boxShadow: '0 3px 0 #2a1005, 0 4px 14px rgba(10,4,0,0.45)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: 1400, margin: '0 auto',
        padding: '0 10px', height: 48,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 6,
      }}>

        {/* ── ЛЕВАЯ ЧАСТЬ ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flexShrink: 0 }}>

          {/* Мобайл: кнопка меню */}
          <button type="button" onClick={onOpenMobileMenu} className="md:hidden"
            style={iconBtn} aria-label="Меню">
            <Menu size={15} />
          </button>

          {/* Мобайл: логотип — только иконка меча */}
          <Link href="/" className="md:hidden" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(180deg,#c8880a,#9a6008)',
              boxShadow: '0 2px 0 #3d2005,0 0 10px rgba(200,136,10,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sword size={15} color="#fff8ee" />
            </div>
          </Link>

          {/* Десктоп: название мира */}
          <div className="hidden md:flex" style={{
            alignItems: 'center', gap: 6,
            fontSize: 12, fontFamily: 'var(--app-font-mono)', color: '#c8a050',
          }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#1a9e5a', boxShadow:'0 0 6px #1a9e5a', display:'inline-block' }} />
            <span>Мир: <b style={{ color:'#f0d070', fontFamily:'var(--app-font-sans)' }}>Этелия</b></span>
          </div>
        </div>

        {/* ── ПРАВАЯ ЧАСТЬ ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>

          {/* Боевой уровень — всегда видно */}
          <Link href="/combat" style={{
            ...pill,
            background: 'linear-gradient(180deg,#7a2010,#5a1808)',
            borderColor: '#3d0e06', color: '#ff8070',
          }}>
            <Sword size={12} color="#c0281e" />
            <span>{combatLevel}</span>
            {/* "LVL" только на десктопе */}
            <span className="hidden sm:inline" style={{ color:'rgba(192,40,30,0.55)', fontWeight:400, fontSize:9 }}>LVL</span>
          </Link>

          {/* Монеты — всегда видно, компактно */}
          <Link href="/inventory" style={pill}>
            <CoinsDisplay amount={gp} size="xs" />
          </Link>

          {/* Сумка — скрыта на очень маленьких экранах */}
          <Link href="/inventory" className="hidden sm:flex" style={{
            ...pill,
            background: isFull
              ? 'linear-gradient(180deg,#8a2010,#6a1808)'
              : 'linear-gradient(180deg,#7a4818,#5a3010)',
            borderColor: isFull ? '#3d0e06' : '#3d1e08',
            color: isFull ? '#ff8070' : '#f0d070',
          }}>
            <Backpack size={12} color={isFull ? '#ff8070' : '#c8a050'} />
            <span style={{ fontSize:11 }}>{usedSlots}/{maxSlots}</span>
          </Link>

          {/* Язык — только на десктопе */}
          <button type="button"
            onClick={() => updateSetting('language', language === 'ru' ? 'en' : 'ru')}
            className="hidden md:flex"
            style={iconBtn}>
            <Globe size={12} color="#c8a050" />
            <span style={{ fontSize:10, textTransform:'uppercase' }}>{language}</span>
          </button>

          {/* Сохранить — иконка на мобайле, текст на десктопе */}
          <button type="button" onClick={handleSave} style={{
            ...iconBtn,
            background: savedRecently
              ? 'linear-gradient(180deg,#2a8a38,#1a6028)'
              : 'linear-gradient(180deg,#7a4818,#5a3010)',
            borderColor: savedRecently ? '#1a6028' : '#3d1e08',
          }}>
            {savedRecently
              ? <Check size={13} strokeWidth={3} color="#7aff90" />
              : <Save size={13} color="#f0c030" />
            }
            <span className="hidden md:inline" style={{ fontSize:11 }}>
              {savedRecently ? 'Сохранено' : t('ui.save')}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
