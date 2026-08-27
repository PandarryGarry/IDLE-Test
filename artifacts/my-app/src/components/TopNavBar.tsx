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
  const { t }         = useTranslation();
  const combatLevel   = usePlayerStore(s => s.combatLevel);
  const gp            = useInventoryStore(s => s.gp);
  const items         = useInventoryStore(s => s.items);
  const maxSlots      = useInventoryStore(s => s.maxSlots);
  const language      = useSettingsStore(s => s.language);
  const updateSetting = useSettingsStore(s => s.updateSetting);
  const notifyInfo    = useNotificationsStore(s => s.notifyInfo);
  const [savedRecently, setSavedRecently] = useState(false);

  const usedSlots = items.filter(i => i.quantity > 0).length;
  const isFull    = usedSlots >= maxSlots;

  const handleSave = () => {
    manualSave();
    notifyInfo(t('notif.gameSaved'));
    setSavedRecently(true);
    setTimeout(() => setSavedRecently(false), 2000);
  };

  const pillStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '4px 10px', borderRadius: 8,
    background: 'linear-gradient(180deg, #a06028, #7a4518)',
    border: '2px solid #3d1e08',
    fontSize: 12, fontFamily: 'var(--app-font-mono)', fontWeight: 700,
    color: '#fff8d0', cursor: 'pointer',
    transition: 'all 0.15s',
    boxShadow: '0 1px 3px rgba(45,31,15,0.1)',
    textDecoration: 'none',
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30, width: '100%',
      background: 'rgba(160,96,40,0.97)',
      borderBottom: '1px solid var(--border-card)',
      boxShadow: '0 3px 0 #3d1e08, 0 4px 12px rgba(10,4,0,0.4)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>

        {/* ── Левая часть ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Мобильное меню */}
          <button type="button" onClick={onOpenMobileMenu} className="md:hidden"
            style={{ ...pillStyle, padding: '6px 8px' }}>
            <Menu size={16} />
          </button>

          {/* Лого мобайл */}
          <Link href="/" className="md:hidden" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(180deg,#c8880a,#9a6008)', boxShadow: '0 2px 0 #3d2005, 0 0 10px rgba(200,136,10,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sword size={14} color="#fff8ee" />
            </div>
            <span style={{ fontFamily: 'var(--app-font-display)', fontWeight: 900, fontSize: 14, color: '#f5d880' }}>
              Aethelia<span style={{ color: '#d4860a', fontFamily: 'var(--app-font-sans)', fontWeight: 800, fontSize: 11 }}>RPG</span>
            </span>
          </Link>

          {/* Мир (десктоп) */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'var(--app-font-mono)', color: '#f0d070' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1a9e5a', boxShadow: '0 0 6px #1a9e5a', display: 'inline-block' }} />
            <span>Мир: <b style={{ color: '#fff8d0', fontFamily: 'var(--app-font-sans)' }}>Этелия</b></span>
          </div>
        </div>

        {/* ── Правая часть — статы ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

          {/* Уровень боя */}
          <Link href="/combat" style={{ ...pillStyle, background: 'linear-gradient(180deg, #7a2010, #5a1808)', borderColor: '#3d0e06', color: '#ff8070' }}>
            <Sword size={13} color="#c0281e" />
            <span>{combatLevel}</span>
            <span className="hidden sm:inline" style={{ color: 'rgba(192,40,30,0.5)', fontWeight: 400, fontSize: 10 }}>LVL</span>
          </Link>

          {/* Монеты */}
          <Link href="/inventory" style={pillStyle}>
            <CoinsDisplay amount={gp} size="xs" />
          </Link>

          {/* Слоты */}
          <Link href="/inventory" className="hidden xs:flex" style={{
            ...pillStyle,
            background: isFull ? 'rgba(255,232,232,0.9)' : pillStyle.background,
            borderColor: isFull ? 'rgba(192,40,30,0.4)' : 'var(--border-default)',
            color: isFull ? '#c0281e' : 'var(--text-secondary)',
          }}>
            <Backpack size={13} color={isFull ? '#c0281e' : 'var(--accent-sapphire)'} />
            <span>{usedSlots}/{maxSlots}</span>
          </Link>

          {/* Язык */}
          <button type="button" onClick={() => updateSetting('language', language === 'ru' ? 'en' : 'ru')} style={pillStyle}>
            <Globe size={13} color="var(--text-muted)" />
            <span className="hidden sm:inline" style={{ textTransform: 'uppercase', fontSize: 11 }}>{language}</span>
          </button>

          {/* Сохранение */}
          <button type="button" onClick={handleSave} style={{
            ...pillStyle,
            background: savedRecently ? '#2a7a30' : 'linear-gradient(180deg, #8b5020, #6b3810)',
            borderColor: savedRecently ? '#1a9e5a' : 'var(--border-default)',
            color: savedRecently ? '#fff' : 'var(--text-secondary)',
          }}>
            {savedRecently
              ? <><Check size={13} strokeWidth={3} /><span className="hidden sm:inline">Сохранено!</span></>
              : <><Save size={13} color="#d4860a" /><span className="hidden sm:inline">{t('ui.save')}</span></>}
          </button>
        </div>
      </div>
    </header>
  );
}
