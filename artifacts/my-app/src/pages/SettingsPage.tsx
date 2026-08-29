import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { useCharacterStore } from '@/store/characterStore';
import { stopActiveActivities } from '@/lib/authActions';
import { importSave, manualSave, exportSaveAsFile } from '@/lib/saveManager';
import { GUEST_NOTICE } from '@/lib/guestMode';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { GModal, GButton, GInput, GAvatar, GBadge, GCard } from '@/shared/ui/gameUI';
import { getAvatarsForRace, getAvatarPath, getRaceLabel } from '@/data/characters';
import { formatDuration } from '@/lib/utils';
import { Settings, Globe, ShieldAlert, Save, Download, Upload, Trash2, Moon, Sparkles } from 'lucide-react';

const DONATE_COST_NICKNAME = 10;
const DONATE_COST_AVATAR = 10;
const AVATAR_COST_LABEL = '10 💎';

export function SettingsPage() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();

  const isGuest = useAuthStore(s => s.isGuest);
  const user = useAuthStore(s => s.user);
  const profile = useAuthStore(s => s.profile);
  const authLoading = useAuthStore(s => s.loading);
  const signOut = useAuthStore(s => s.signOut);

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

  // ── Персонаж ───────────────────────────────────────────────
  const activeCharacter = useCharacterStore(s => s.activeCharacter);
  const characters = useCharacterStore(s => s.characters);
  const renameCharacter = useCharacterStore(s => s.renameCharacter);
  const changeCharacterAvatar = useCharacterStore(s => s.changeCharacterAvatar);
  const deleteCharacter = useCharacterStore(s => s.deleteCharacter);
  const donateCurrency = profile?.donateCurrency ?? 0;

  const [nicknameModal, setNicknameModal] = useState(false);
  const [avatarModal, setAvatarModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [newAvatarId, setNewAvatarId] = useState('');
  const [charBusy, setCharBusy] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openNickname = () => {
    setNewNickname(activeCharacter?.nickname ?? '');
    setNicknameError(null);
    setNicknameModal(true);
  };

  const openAvatar = () => {
    if (!activeCharacter) return;
    setNewAvatarId(activeCharacter.avatarId);
    setAvatarError(null);
    setAvatarModal(true);
  };

  const canEditNicknameFree = activeCharacter ? !activeCharacter.hasChangedNickname : false;
  const canEditAvatarFree = activeCharacter ? !activeCharacter.hasChangedAvatar : false;

  const handleSaveNickname = async () => {
    if (!activeCharacter || charBusy) return;
    const name = newNickname.trim();
    if (name.length < 2 || name.length > 20) {
      setNicknameError('Ник должен быть от 2 до 20 символов.');
      return;
    }
    setCharBusy(true);
    setNicknameError(null);
    try {
      await renameCharacter(activeCharacter.id, name);
      notifyInfo('Ник обновлён ✓');
      setNicknameModal(false);
    } catch (e) {
      setNicknameError(e instanceof Error ? e.message : 'Не удалось сменить ник.');
    } finally {
      setCharBusy(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!activeCharacter || charBusy) return;
    setCharBusy(true);
    setAvatarError(null);
    try {
      await changeCharacterAvatar(activeCharacter.id, newAvatarId);
      notifyInfo('Аватар обновлён ✓');
      setAvatarModal(false);
    } catch (e) {
      setAvatarError(e instanceof Error ? e.message : 'Не удалось сменить аватар.');
    } finally {
      setCharBusy(false);
    }
  };

  const handleDeleteCharacter = async () => {
    if (!activeCharacter || charBusy) return;
    setCharBusy(true);
    setDeleteError(null);
    try {
      await deleteCharacter(activeCharacter.id);
      setDeleteModal(false);
      notifyInfo('Персонаж удалён. Создайте нового.');
      navigate('/select-character');
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Не удалось удалить персонажа.');
    } finally {
      setCharBusy(false);
    }
  };

  const handleSwitchCharacter = () => {
    navigate('/select-character');
  };

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
        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card-dark)] border border-[var(--border-default)] flex items-center justify-center text-2xl text-amber-400">
          ⚙️
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-black text-[var(--text-primary)]">{t('settings.title')}</h1>
          <p className="text-xs text-[var(--text-muted)]">Manage realms configuration and character data</p>
        </div>
      </div>

      {/* Account / Auth status */}
      <div className="fantasy-card border-amber-500/30 p-4 sm:p-5 rounded-3xl shadow-lg space-y-3">
        <h2 className="font-mono text-xs font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" /> Аккаунт
        </h2>

        {authLoading ? (
          <p className="text-xs text-[var(--text-muted)] font-mono">Загрузка сессии...</p>
        ) : isGuest ? (
          <div className="space-y-3">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">{GUEST_NOTICE}</p>
            <div className="text-[11px] font-mono text-[var(--text-muted)] leading-relaxed">
              Прогресс гостя хранится только в этой сессии: доступны лесорубство и рыбалка, 24 слота инвентаря.
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => navigate('/login')}
                className="flex-1 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
              >
                Создать аккаунт
              </button>
              <button
                onClick={() => { stopActiveActivities(); void signOut().then(() => navigate('/login')); }}
                className="flex-1 px-5 py-3 bg-[var(--bg-card-dark)] border border-[var(--border-default)] hover:border-[var(--border-accent)] text-[var(--text-secondary)] font-bold rounded-2xl text-xs transition-all active:scale-95"
              >
                Выйти из гостевого режима
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[var(--bg-slot)] border border-[var(--border-default)] flex items-center justify-center text-lg shrink-0">🛡️</div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {profile?.nickname || user?.email || 'Игрок'}
                </div>
                {user?.email && (
                  <div className="text-[11px] font-mono text-[var(--text-muted)] truncate">{user.email}</div>
                )}
              </div>
            </div>
            <div className="text-[11px] font-mono text-[var(--text-muted)]">Аккаунт подключён к Supabase — прогресс сохраняется в облаке.</div>
            <button
              onClick={() => { stopActiveActivities(); void signOut().then(() => navigate('/login')); }}
              className="w-full sm:w-auto px-5 py-3 bg-red-500 hover:bg-red-400 text-white font-extrabold rounded-2xl text-xs transition-all active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.25)] flex items-center justify-center gap-2"
            >
              Выйти из аккаунта
            </button>
          </div>
        )}
      </div>

      {/* Character (для аккаунтов) */}
      {!isGuest && activeCharacter && (
        <div className="fantasy-card border-amber-500/30 p-4 sm:p-5 rounded-3xl shadow-lg space-y-3">
          <h2 className="font-mono text-xs font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Персонаж
          </h2>

          {/* Карточка персонажа */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-slot)] border-2 border-[var(--border-accent)] overflow-hidden flex items-center justify-center shrink-0 shadow-[0_0_14px_rgba(200,136,10,0.25)]">
              <img src={getAvatarPath(activeCharacter.avatarId)} alt="" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-display font-black text-[var(--text-primary)] truncate">
                {activeCharacter.nickname}
              </div>
              <div className="text-[11px] font-mono text-[var(--text-muted)]">
                {getRaceLabel(activeCharacter.raceId, 'ru')}
              </div>
              <div className="text-[11px] font-mono text-amber-300/80">
                ⏱ Время в игре: {formatDuration(activeCharacter.saveData?.totalPlayTime ?? 0)}
              </div>
            </div>
          </div>

          {/* Смена ника / аватара */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={openNickname}
              className="px-4 py-2.5 bg-[var(--bg-card-dark)] border border-[var(--border-default)] hover:border-[var(--border-accent)] text-[var(--text-secondary)] font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              ✏️ Сменить ник
            </button>
            <button
              onClick={openAvatar}
              className="px-4 py-2.5 bg-[var(--bg-card-dark)] border border-[var(--border-default)] hover:border-[var(--border-accent)] text-[var(--text-secondary)] font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              🎭 Сменить аватар
            </button>
          </div>

          {/* Подсказка про лимит бесплатной смены */}
          <div className="text-[10px] font-mono text-amber-300/70 leading-relaxed">
            {!canEditNicknameFree && !canEditAvatarFree
              ? `Лимит бесплатной смены исчерпан. Далее — ${AVATAR_COST_LABEL} за смену (донат-валюта на аккаунте).`
              : (
                <>
                  Бесплатно: смена ника {canEditNicknameFree ? '✓ доступна' : '✗ использована'} · смена аватара {canEditAvatarFree ? '✓ доступна' : '✗ использована'}.
                  {(!canEditNicknameFree || !canEditAvatarFree) && ` Далее — ${AVATAR_COST_LABEL} за смену.`}
                </>
              )}
          </div>

          {/* Управление */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handleSwitchCharacter}
              className="px-4 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" /> Сменить персонажа
            </button>
            <button
              onClick={() => { setDeleteError(null); setDeleteModal(true); }}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-[var(--text-primary)] border border-red-500/30 font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Удалить персонажа
            </button>
          </div>

          {characters.length > 1 && (
            <div className="text-[10px] font-mono text-[var(--text-muted)]">
              Персонажей на аккаунте: {characters.filter(c => !c.isDeleted).length}
            </div>
          )}
        </div>
      )}

      {/* Language Selector */}
      <div className="fantasy-card border-stone-800 p-4 sm:p-5 rounded-3xl shadow-lg space-y-3">
        <h2 className="font-mono text-xs font-extrabold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-cyan-400" /> {t('settings.language')}
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => updateSetting('language', 'en')}
            className={`py-3 px-4 rounded-2xl font-black text-sm tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2 ${
              language === 'en'
                ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-[var(--bg-card-dark)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)]'
            }`}
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => updateSetting('language', 'ru')}
            className={`py-3 px-4 rounded-2xl font-black text-sm tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2 ${
              language === 'ru'
                ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-[var(--bg-card-dark)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)]'
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
          <h2 className="font-mono text-xs font-extrabold uppercase tracking-widest text-[var(--text-muted)]">{t('settings.gameplay')}</h2>

          <ToggleSetting
            label={t('settings.autoSave')}
            description={t('settings.autoSaveDesc')}
            checked={autoSaveEnabled}
            onChange={(v) => updateSetting('autoSaveEnabled', v)}
          />

          {autoSaveEnabled && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[var(--text-muted)] font-mono">{t('settings.autoSaveInterval')} (s)</span>
              <input
                type="number"
                value={autoSaveInterval}
                onChange={(e) => updateSetting('autoSaveInterval', Math.max(10, parseInt(e.target.value) || 30))}
                className="bg-[var(--bg-slot)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 w-20 text-right font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500"
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
          <h2 className="font-mono text-xs font-extrabold uppercase tracking-widest text-[var(--text-muted)]">{t('settings.display')}</h2>

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
              className="bg-[var(--bg-slot)] border border-[var(--border-default)] rounded-xl px-3 py-1.5 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
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

        {isGuest && (
          <div className="text-[11px] font-mono text-amber-300/80 leading-relaxed">
            {GUEST_NOTICE} Прогресс гостя сохраняется только в текущей сессии браузера.
          </div>
        )}

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
            className="flex-1 sm:flex-none px-5 py-2.5 bg-[var(--bg-card-dark)] border border-[var(--border-default)] hover:border-[var(--border-accent)] text-[var(--text-primary)] font-bold rounded-2xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            {t('settings.exportSave')}
          </button>
        </div>

        <div className="space-y-2 pt-3 border-t border-stone-800">
          <h3 className="font-mono text-xs text-[var(--text-muted)]">{t('ui.import')} Save (Base64)</h3>
          <textarea
            value={importString}
            onChange={(e) => setImportString(e.target.value)}
            placeholder="Paste your exported save data string here..."
            className="w-full h-20 bg-[var(--bg-slot)] border border-[var(--border-default)] rounded-2xl p-3 font-mono text-xs text-[var(--text-secondary)] focus:outline-none focus:border-amber-500 transition-colors resize-none placeholder:text-slate-600"
          />
          <button
            onClick={handleImport}
            disabled={!importString}
            className="w-full sm:w-auto px-5 py-2 bg-[var(--bg-card-dark)] border border-[var(--border-default)] hover:border-[var(--border-accent)] text-amber-300 font-bold rounded-xl text-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
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
            className="w-full sm:w-auto px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-[var(--text-primary)] border border-red-500/30 font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hard Reset Game
          </button>
        </div>
      </div>

      {/* ── Модалки персонажа ── */}
      <GModal open={nicknameModal} onClose={() => setNicknameModal(false)} title="Сменить ник" width={360}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {canEditNicknameFree ? (
            <>
              <p style={{ fontFamily: 'var(--app-font-sans)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                Первая смена — <b style={{ color: 'var(--text-primary)' }}>бесплатно</b>.
              </p>
              <GInput
                label="Новый ник"
                value={newNickname}
                onChange={v => { setNewNickname(v); setNicknameError(null); }}
                maxLength={20}
                icon="♙"
                autoFocus
                error={nicknameError ?? undefined}
              />
            </>
          ) : (
            <>
              <p style={{ fontFamily: 'var(--app-font-sans)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                Бесплатная смена использована. Смена ника стоит <b style={{ color: '#f0c030' }}>{DONATE_COST_NICKNAME} 💎</b>.
              </p>
              <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                На балансе: {donateCurrency} 💎
              </div>
              <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: 10, color: 'var(--text-dim, #8b6030)' }}>
                Система донат-валюты появится позже.
              </div>
            </>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <GButton variant="secondary" fullWidth onClick={() => setNicknameModal(false)}>Отмена</GButton>
            <GButton variant="primary" fullWidth disabled={!canEditNicknameFree || charBusy} onClick={handleSaveNickname}>
              {charBusy ? '...' : 'Сохранить'}
            </GButton>
          </div>
        </div>
      </GModal>

      <GModal open={avatarModal} onClose={() => setAvatarModal(false)} title="Сменить аватар" width={400}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!canEditAvatarFree && (
            <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
              Бесплатная смена использована. Далее — <b style={{ color: '#f0c030' }}>{DONATE_COST_AVATAR} 💎</b> (скоро).
              На балансе: {donateCurrency} 💎
            </div>
          )}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 10,
          }}>
            {getAvatarsForRace(activeCharacter?.raceId ?? 'human').map(aid => (
              <GCard key={aid} selected={newAvatarId === aid} hoverEffect onClick={() => { setNewAvatarId(aid); setAvatarError(null); }} style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
                <GAvatar src={getAvatarPath(aid)} size={48} borderColor={newAvatarId === aid ? 'var(--border-accent)' : 'var(--border-default)'} glow={newAvatarId === aid} />
              </GCard>
            ))}
          </div>
          {avatarError && (
            <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: 11, color: '#ff7060' }}>⚠ {avatarError}</div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <GButton variant="secondary" fullWidth onClick={() => setAvatarModal(false)}>Отмена</GButton>
            <GButton variant="primary" fullWidth disabled={!canEditAvatarFree || charBusy} onClick={handleSaveAvatar}>
              {charBusy ? '...' : 'Сохранить'}
            </GButton>
          </div>
        </div>
      </GModal>

      <GModal open={deleteModal} onClose={() => setDeleteModal(false)} title="⚠ Удалить персонажа?" width={380}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontFamily: 'var(--app-font-sans)', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
            Персонаж <b>{activeCharacter?.nickname}</b> будет удалён <b>безвозвратно</b> вместе с инвентарём и прогрессом.
            Донат-валюта на аккаунте не пострадает.
          </p>
          <div style={{
            padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-overlay)',
            border: '1px solid var(--border-default)',
          }}>
            <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
              Журнал удаления: прогресс и инвентарь удаляются, донат-валюта сохраняется.
            </div>
          </div>
          {deleteError && (
            <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: 11, color: '#ff7060' }}>⚠ {deleteError}</div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <GButton variant="secondary" fullWidth onClick={() => setDeleteModal(false)}>Отмена</GButton>
            <GButton variant="danger" fullWidth disabled={charBusy} onClick={handleDeleteCharacter}>
              {charBusy ? '...' : 'Удалить навсегда'}
            </GButton>
          </div>
        </div>
      </GModal>

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
        {description && <div className="text-[11px] text-[var(--text-muted)] leading-tight mt-0.5">{description}</div>}
      </div>
      <div
        className={`shrink-0 w-10 h-5 rounded-full transition-colors relative border ${
          checked ? 'bg-amber-500 border-amber-400' : 'bg-[var(--bg-card-dark)] border-[var(--border-default)]'
        }`}
      >
        <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full shadow transition-transform ${
          checked ? 'translate-x-5 bg-white' : 'translate-x-0.5 bg-[var(--border-default)]'
        }`} />
      </div>
    </div>
  );
}
