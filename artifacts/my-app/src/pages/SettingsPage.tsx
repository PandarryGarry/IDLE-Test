import React, { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { exportSaveAsFile, importSave, manualSave } from '@/lib/saveManager';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useTranslation } from '@/hooks/useTranslation';

export function SettingsPage() {
  const { t } = useTranslation();
  
  // Точечные селекторы: компонент перерисовывается только при изменении этих значений
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
    <div className="space-y-4 max-w-2xl">
      {/* Page title */}
      <div className="bg-card border border-border p-4 md:p-5 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <span className="text-2xl">⚙️</span> {t('settings.title')}
        </h1>
      </div>

      {/* Language selector — prominent */}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm space-y-3">
        <h2 className="font-black text-sm uppercase tracking-widest text-muted-foreground">{t('settings.language')}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => updateSetting('language', 'en')}
            className={`flex-1 py-3 rounded-xl font-black text-lg tracking-wide transition-all ${
              language === 'en'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                : 'bg-background border border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            🇬🇧 EN
          </button>
          <button
            onClick={() => updateSetting('language', 'ru')}
            className={`flex-1 py-3 rounded-xl font-black text-lg tracking-wide transition-all ${
              language === 'ru'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                : 'bg-background border border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            🇷🇺 RU
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Gameplay */}
        <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
          <h2 className="font-black text-sm uppercase tracking-widest text-muted-foreground">{t('settings.gameplay')}</h2>

          <ToggleSetting
            label={t('settings.autoSave')}
            description={t('settings.autoSaveDesc')}
            checked={autoSaveEnabled}
            onChange={(v) => updateSetting('autoSaveEnabled', v)}
          />

          {autoSaveEnabled && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('settings.autoSaveInterval')} (s)</span>
              <input
                type="number"
                value={autoSaveInterval}
                onChange={(e) => updateSetting('autoSaveInterval', Math.max(10, parseInt(e.target.value) || 30))}
                className="bg-background border border-border rounded-lg px-3 py-1.5 w-20 text-right font-mono text-sm focus:outline-none focus:border-primary"
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
        <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
          <h2 className="font-black text-sm uppercase tracking-widest text-muted-foreground">{t('settings.display')}</h2>

          <ToggleSetting
            label={t('settings.darkMode')}
            description={t('settings.darkModeDesc')}
            checked={darkMode}
            onChange={(v) => {
              toggleDarkMode();
              document.documentElement.classList.toggle('dark', v);
            }}
          />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('settings.numberFormat')}</span>
            <select
              value={numberFormat}
              onChange={(e) => updateSetting('numberFormat', e.target.value as any)}
              className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-primary"
            >
              <option value="abbreviated">{t('settings.numberFormat.abbreviated')}</option>
              <option value="full">{t('settings.numberFormat.full')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Management */}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm space-y-5">
        <h2 className="font-black text-sm uppercase tracking-widest text-primary">{t('settings.saveManagement')}</h2>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSave}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-sm hover:bg-primary/90 transition-all text-sm"
          >
            {t('settings.manualSave')}
          </button>
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-accent border border-border text-foreground font-bold rounded-xl hover:bg-accent/80 transition-all text-sm"
          >
            {t('settings.exportSave')}
          </button>
        </div>

        <div className="space-y-2 pt-3 border-t border-border/50">
          <h3 className="font-bold text-sm text-muted-foreground">{t('ui.import')} Save (Base64)</h3>
          <textarea
            value={importString}
            onChange={(e) => setImportString(e.target.value)}
            placeholder="Paste your exported save string here..."
            className="w-full h-24 bg-background border border-border rounded-xl p-3 font-mono text-xs focus:outline-none focus:border-primary transition-colors resize-none"
          />
          <button
            onClick={handleImport}
            disabled={!importString}
            className="w-full sm:w-auto px-5 py-2 bg-amber-600/15 text-amber-500 border border-amber-600/40 hover:bg-amber-600/25 font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            {t('ui.import')} & Reload
          </button>
        </div>

        <div className="pt-4 border-t border-destructive/20">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to completely reset your game? This cannot be undone.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full sm:w-auto px-5 py-2 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white font-bold rounded-xl transition-all text-sm"
          >
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
    <label className="flex items-center justify-between gap-3 cursor-pointer group">
      <div className="min-w-0">
        <div className="font-medium text-sm group-hover:text-primary transition-colors">{label}</div>
        {description && <div className="text-xs text-muted-foreground leading-tight mt-0.5">{description}</div>}
      </div>
      <div
        onClick={() => onChange(!checked)}
        className={`shrink-0 w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-primary' : 'bg-muted'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
    </label>
  );
}
