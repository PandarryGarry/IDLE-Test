import React, { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { manualSave } from '@/lib/saveManager';
import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'wouter';
import { Save, Check, Globe, Menu, Sword } from 'lucide-react';

export function TopNavBar({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
  const { t }         = useTranslation();
  const language      = useSettingsStore(s => s.language);
  const updateSetting = useSettingsStore(s => s.updateSetting);
  const notifyInfo    = useNotificationsStore(s => s.notifyInfo);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    manualSave();
    notifyInfo(t('notif.gameSaved'));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const btn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '5px 10px', borderRadius: 8,
    background: 'linear-gradient(180deg,#7a4818,#5a3010)',
    border: '2px solid #3d1e08',
    color: '#f0d070', cursor: 'pointer',
    fontFamily: 'var(--app-font-mono)', fontSize: 11, fontWeight: 700,
    boxShadow: '0 2px 0 #2a1005', textDecoration: 'none', flexShrink: 0,
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30, width: '100%',
      background: 'rgba(40,22,8,0.97)',
      borderBottom: '2px solid #3d1e08',
      boxShadow: '0 3px 0 #2a1005, 0 4px 14px rgba(10,4,0,0.5)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: 1400, margin: '0 auto',
        padding: '0 12px', height: 48,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* ── Левая: бургер + лого ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onOpenMobileMenu} className="md:hidden"
            style={{ ...btn, padding: '5px 7px' }} aria-label="Меню">
            <Menu size={16} />
          </button>

          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, flexShrink: 0,
              background: 'linear-gradient(180deg,#c8880a,#9a6008)',
              boxShadow: '0 2px 0 #3d2005,0 0 10px rgba(200,136,10,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sword size={14} color="#fff8ee" />
            </div>
            <span style={{
              fontFamily: 'var(--app-font-display)', fontWeight: 900,
              fontSize: 15, color: '#f5d880', letterSpacing: '0.06em',
            }}>
              Aethelia<span style={{ color: '#c8880a', fontSize: 11, fontFamily: 'var(--app-font-sans)', fontWeight: 800 }}>RPG</span>
            </span>
          </Link>

          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--app-font-mono)', color: '#c8a050', marginLeft: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1a9e5a', boxShadow: '0 0 5px #1a9e5a', display: 'inline-block' }} />
            Мир: <b style={{ color: '#f0d070' }}>Этелия</b>
          </div>
        </div>

        {/* ── Правая: язык + сохранить ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => updateSetting('language', language === 'ru' ? 'en' : 'ru')}
            style={{ ...btn, padding: '5px 8px' }}>
            <Globe size={12} color="#c8a050" />
            <span style={{ fontSize: 10, textTransform: 'uppercase' }}>{language}</span>
          </button>

          <button onClick={handleSave} style={{
            ...btn,
            background: saved ? 'linear-gradient(180deg,#2a8a38,#1a6028)' : 'linear-gradient(180deg,#7a4818,#5a3010)',
            borderColor: saved ? '#1a6028' : '#3d1e08',
          }}>
            {saved
              ? <><Check size={13} strokeWidth={3} color="#7aff90" /><span className="hidden sm:inline">Сохранено</span></>
              : <><Save size={13} color="#f0c030" /><span className="hidden sm:inline">{t('ui.save')}</span></>
            }
          </button>
        </div>
      </div>
    </header>
  );
}
