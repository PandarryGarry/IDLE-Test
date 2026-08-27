import React, { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { exportSaveAsFile, importSave, manualSave } from '@/lib/saveManager';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Settings, Globe, ShieldAlert, Save, Download, Upload, Trash2, Moon, Sparkles } from 'lucide-react';

export function SettingsPage() {
  const { t } = useTranslation();
  
  const language = useSettingsStore(s => s.language);
  const autoSaveEnabled = useSettingsStore(s => s.autoSaveEnabled);
  const autoSaveInterval = useSettingsStore(s => s.autoSaveInterval);
  const confirmSell = useSettingsStore(s => s.confirmSell);
  const darkMode = useSettingsStore(s => s.darkMode);
  const numberFormat = useSettingsStore(s => s.numberFormat);
  const updateSetting = useSettingsStore(s => s.updateSetting);
  const toggleDarkMode = useSettingsStore(s => s.toggleDarkMode);
  
  const notifyInfo = useNotificationsStore(s => s.notifyInfo);
  const [importString, setImportString] = useState('');

  const handleSave = () => {
    manualSave();
    notifyInfo(t('settings.manualSave') + ' ✓');
  };

  const handleExport = () => {
    exportSaveAsFile();
    notifyInfo(t('settings.exportSave') + ' ✓');
  };

  const handleImport = () => {
    if (!importString) return;
    const success = importSave(importString);
    if (success) {
      notifyInfo('Save imported successfully!');
      setImportString('');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      useNotificationsStore.getState().addNotification('warning', 'Failed to import save. Invalid format.');
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      
      {/* Title */}
      <div className="fantasy-card border-amber-500/30 p-4 sm:p-5 rounded-3xl shadow-lg flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-2xl text-amber-400">
          ⚙️
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-black text-[var(--text-primary)]">{t('settings.title')}</h1>
          <p className="text-xs text-stone-500">Manage realms configuration and character data</p>
        </div>
      </div>

      {/* Language Selector */}
      <div className="fantasy-card border-stone-800 p-4 sm:p-5 rounded-3xl shadow-lg space-y-3">
        <h2 className="font-mono text-xs font-extrabold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-cyan-400" /> {t('settings.language')}
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => updateSetting('language', 'en')}
            className={`py-3 px-4 rounded-2xl font-black text-sm tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2 ${
              language === 'en'
                ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-stone-950 border border-stone-800 text-[var(--text-secondary)] hover:text-white hover:border-stone-700'
            }`}
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => updateSetting('language', 'ru')}
            className={`py-3 px-4 rounded-2xl font-black text-sm tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2 ${
              language === 'ru'
                ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-stone-950 border border-stone-800 text-[var(--text-secondary)] hover:text-white hover:border-stone-700'
            }`}
          >
            🇷🇺 Русский
          </button>
        </div>
      </div>

      {/* Gameplay & Display Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        
        {/* Gameplay */}
        <div className="fantasy-card border-stone-800 p-4 sm:p-5 rounded-3xl shadow-lg space-y-4">
          <h2 className="font-mono text-xs font-extrabold uppercase tracking-widest text-stone-500">{t('settings.gameplay')}</h2>

          <ToggleSetting
            label={t('settings.autoSave')}
            description={t('settings.autoSaveDesc')}
            checked={autoSaveEnabled}
            onChange={(v) => updateSetting('autoSaveEnabled', v)}
          />

          {autoSaveEnabled && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-stone-500 font-mono">{t('settings.autoSaveInterval')} (s)</span>
              <input
                type="number"
                value={autoSaveInterval}
                onChange={(e) => updateSetting('autoSaveInterval', Math.max(10, parseInt(e.target.value) || 30))}
                className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 w-20 text-right font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500"
                min="10"
              />
            </div>
          )}

          <ToggleSetting
            label={t('settings.confirmSell')}
            description={t('settings.confirmSellDesc')}
            checked={confirmSell}
            onChange={(v) => updateSetting('confirmSell', v)}
          />
        </div>

        {/* Display */}
        <div className="fantasy-card border-stone-800 p-4 sm:p-5 rounded-3xl shadow-lg space-y-4">
          <h2 className="font-mono text-xs font-extrabold uppercase tracking-widest text-stone-500">{t('settings.display')}</h2>

          <ToggleSetting
            label={t('settings.darkMode')}
            description={t('settings.darkModeDesc')}
            checked={darkMode}
            onChange={(v) => {
              toggleDarkMode();
              document.documentElement.classList.toggle('dark', v);
            }}
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[var(--text-secondary)] font-medium">{t('settings.numberFormat')}</span>
            <select
              value={numberFormat}
              onChange={(e) => updateSetting('numberFormat', e.target.value as any)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
            >
              <option value="abbreviated">{t('settings.numberFormat.abbreviated')}</option>
              <option value="full">{t('settings.numberFormat.full')}</option>
            </select>
          </div>
        </div>

      </div>

      {/* Save Management */}
      <div className="fantasy-card border-amber-500/30 p-4 sm:p-5 rounded-3xl shadow-xl space-y-4">
        <h2 className="font-mono text-xs font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" /> {t('settings.saveManagement')}
        </h2>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleSave}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
          >
            <Save className="w-3.5 h-3.5" />
            {t('settings.manualSave')}
          </button>
          
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-stone-900 border border-stone-800 hover:border-stone-700 text-[var(--text-primary)] font-bold rounded-2xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            {t('settings.exportSave')}
          </button>
        </div>

        <div className="space-y-2 pt-3 border-t border-stone-800">
          <h3 className="font-mono text-xs text-stone-500">{t('ui.import')} Save (Base64)</h3>
          <textarea
            value={importString}
            onChange={(e) => setImportString(e.target.value)}
            placeholder="Paste your exported save data string here..."
            className="w-full h-20 bg-stone-950 border border-stone-800 rounded-2xl p-3 font-mono text-xs text-[var(--text-secondary)] focus:outline-none focus:border-amber-500 transition-colors resize-none placeholder:text-slate-600"
          />
          <button
            onClick={handleImport}
            disabled={!importString}
            className="w-full sm:w-auto px-5 py-2 bg-stone-900 border border-stone-800 hover:border-amber-500/40 text-amber-300 font-bold rounded-xl text-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            {t('ui.import')} & Reload
          </button>
        </div>

        <div className="pt-3 border-t border-red-500/20">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to completely reset your game? This cannot be undone.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full sm:w-auto px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hard Reset Game
          </button>
        </div>
      </div>

    </div>
  );
}

function ToggleSetting({
  label, description, checked, onChange,
}: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 cursor-pointer group select-none" onClick={() => onChange(!checked)}>
      <div className="min-w-0">
        <div className="font-semibold text-xs text-[var(--text-primary)] group-hover:text-amber-300 transition-colors">{label}</div>
        {description && <div className="text-[11px] text-stone-500 leading-tight mt-0.5">{description}</div>}
      </div>
      <div
        className={`shrink-0 w-10 h-5 rounded-full transition-colors relative border ${
          checked ? 'bg-amber-500 border-amber-400' : 'bg-stone-900 border-stone-700'
        }`}
      >
        <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full shadow transition-transform ${
          checked ? 'translate-x-5 bg-stone-950' : 'translate-x-0.5 bg-slate-400'
        }`} />
      </div>
    </div>
  );
}
