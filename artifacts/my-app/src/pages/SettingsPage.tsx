import React, { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { exportSaveAsFile, importSave, manualSave, collectSaveData } from '@/lib/saveManager';
import { useNotificationsStore } from '@/store/notificationsStore';

export function SettingsPage() {
  const settings = useSettingsStore();
  const notifyInfo = useNotificationsStore(s => s.notifyInfo);
  const [importString, setImportString] = useState('');
  
  const handleSave = () => {
    manualSave();
    notifyInfo("Game saved successfully!");
  };

  const handleExport = () => {
    exportSaveAsFile();
    notifyInfo("Save exported to file.");
  };

  const handleImport = () => {
    if (!importString) return;
    const success = importSave(importString);
    if (success) {
      notifyInfo("Save imported successfully!");
      setImportString('');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      useNotificationsStore.getState().addNotification('warning', "Failed to import save. Invalid format.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <span className="text-4xl">⚙️</span> Settings
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* GAMEPLAY SETTINGS */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="font-bold text-lg border-b border-border/50 pb-2">Gameplay</h2>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <div className="font-medium group-hover:text-primary transition-colors">Auto-Save</div>
                <div className="text-xs text-muted-foreground">Save the game automatically in the background</div>
              </div>
              <input 
                type="checkbox" 
                checked={settings.autoSaveEnabled} 
                onChange={(e) => settings.updateSetting('autoSaveEnabled', e.target.checked)} 
                className="rounded bg-input border-border text-primary focus:ring-primary h-5 w-5"
              />
            </label>

            {settings.autoSaveEnabled && (
              <label className="flex items-center justify-between cursor-pointer">
                <div className="text-sm">Auto-Save Interval (seconds)</div>
                <input 
                  type="number" 
                  value={settings.autoSaveInterval} 
                  onChange={(e) => settings.updateSetting('autoSaveInterval', Math.max(10, parseInt(e.target.value) || 30))} 
                  className="bg-background border border-border rounded px-3 py-1 w-20 text-right font-mono"
                  min="10"
                />
              </label>
            )}

            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <div className="font-medium group-hover:text-primary transition-colors">Confirm Sell</div>
                <div className="text-xs text-muted-foreground">Require confirmation for valuable items</div>
              </div>
              <input 
                type="checkbox" 
                checked={settings.confirmSell} 
                onChange={(e) => settings.updateSetting('confirmSell', e.target.checked)} 
                className="rounded bg-input border-border text-primary focus:ring-primary h-5 w-5"
              />
            </label>
          </div>
        </div>

        {/* DISPLAY SETTINGS */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="font-bold text-lg border-b border-border/50 pb-2">Display</h2>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <div className="font-medium group-hover:text-primary transition-colors">Dark Mode</div>
                <div className="text-xs text-muted-foreground">Toggle dark/light theme (Applies to root class)</div>
              </div>
              <input 
                type="checkbox" 
                checked={settings.darkMode} 
                onChange={(e) => {
                  settings.toggleDarkMode();
                  document.documentElement.classList.toggle('dark', e.target.checked);
                }} 
                className="rounded bg-input border-border text-primary focus:ring-primary h-5 w-5"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <div className="font-medium">Number Format</div>
              </div>
              <select 
                value={settings.numberFormat} 
                onChange={(e) => settings.updateSetting('numberFormat', e.target.value as any)}
                className="bg-background border border-border rounded px-3 py-1 text-sm font-mono"
              >
                <option value="abbreviated">1.5M</option>
                <option value="full">1,500,000</option>
              </select>
            </label>
          </div>
        </div>

        {/* SAVE MANAGEMENT */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 md:col-span-2">
          <h2 className="font-bold text-lg border-b border-border/50 pb-2 text-primary">Save Management</h2>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={handleSave}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg shadow-sm hover:shadow-md hover:bg-primary/90 transition-all"
            >
              Force Save Now
            </button>
            <button 
              onClick={handleExport}
              className="px-6 py-2.5 bg-accent border border-border text-foreground font-bold rounded-lg shadow-sm hover:bg-accent/80 transition-all"
            >
              Download Save File
            </button>
          </div>

          <div className="pt-4 border-t border-border/50 space-y-3">
            <h3 className="font-bold text-sm text-muted-foreground">Import Save (Base64)</h3>
            <textarea 
              value={importString}
              onChange={(e) => setImportString(e.target.value)}
              placeholder="Paste your exported save string here..."
              className="w-full h-32 bg-background border border-border rounded-lg p-3 font-mono text-xs focus:outline-none focus:border-primary transition-colors resize-none"
            />
            <button 
              onClick={handleImport}
              disabled={!importString}
              className="px-6 py-2 bg-amber-600/20 text-amber-500 border border-amber-600/50 hover:bg-amber-600/30 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import and Reload
            </button>
          </div>

          <div className="pt-8 mt-4 border-t border-destructive/20">
            <button 
              onClick={() => {
                if(window.confirm('Are you sure you want to completely reset your game? This cannot be undone.')){
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="px-6 py-2 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white font-bold rounded-lg transition-colors w-full sm:w-auto"
            >
              Hard Reset Game
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}