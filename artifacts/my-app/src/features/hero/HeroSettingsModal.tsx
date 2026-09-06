import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  GAvatar, GButton, GCard, GInfoRow, GInput, GModal,
} from '@/shared/ui/gameUI';
import { useAuthStore } from '@/store/authStore';
import { useCharacterStore } from '@/store/characterStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { getAvatarPath, getAvatarsForRace, getRaceLabel } from '@/data/characters';
import {
  FREE_RESPEC_LIMIT,
  remainingFreeRespecs,
  spentBranchRanks,
  spentPillarRanks,
  getLiveAttributes,
} from '@/domain/attributes/characterAttributes';

const DONATE_COST_NICKNAME = 10;
const DONATE_COST_AVATAR = 10;
const AVATAR_COST_LABEL = '10 💎';

type SettingsView = 'main' | 'nickname' | 'avatar' | 'delete';

export function HeroSettingsModal({
  open, state, onClose, onRespecPillars, onRespecBranches,
}: {
  open: boolean;
  state: ReturnType<typeof getLiveAttributes>;
  onClose: () => void;
  onRespecPillars: () => void;
  onRespecBranches: () => void;
}) {
  const [, navigate] = useLocation();
  const profile = useAuthStore(s => s.profile);
  const donateCurrency = profile?.donateCurrency ?? 0;
  const active = useCharacterStore(s => s.activeCharacter);
  const renameCharacter = useCharacterStore(s => s.renameCharacter);
  const changeCharacterAvatar = useCharacterStore(s => s.changeCharacterAvatar);
  const deleteCharacter = useCharacterStore(s => s.deleteCharacter);
  const notifyInfo = useNotificationsStore(s => s.notifyInfo);

  const [view, setView] = useState<SettingsView>('main');
  const [busy, setBusy] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [newAvatarId, setNewAvatarId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setView('main');
      setError(null);
      setBusy(false);
    }
  }, [open]);

  const left = remainingFreeRespecs(state);
  const spentP = spentPillarRanks(state);
  const spentB = spentBranchRanks(state);
  const canPillars = left > 0 && spentP > 0;
  const canBranches = left > 0 && spentB > 0;
  const canEditNicknameFree = active ? !active.hasChangedNickname : false;
  const canEditAvatarFree = active ? !active.hasChangedAvatar : false;

  const close = () => {
    setView('main');
    setError(null);
    setBusy(false);
    onClose();
  };

  const back = () => {
    setView('main');
    setError(null);
  };

  const openNickname = () => {
    setNewNickname(active?.nickname ?? '');
    setError(null);
    setView('nickname');
  };

  const openAvatar = () => {
    if (!active) return;
    setNewAvatarId(active.avatarId);
    setError(null);
    setView('avatar');
  };

  const saveNickname = async () => {
    if (!active || busy) return;
    const name = newNickname.trim();
    if (name.length < 2 || name.length > 20) {
      setError('Ник должен быть от 2 до 20 символов.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await renameCharacter(active.id, name);
      notifyInfo('Ник обновлён ✓');
      setView('main');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сменить ник.');
    } finally {
      setBusy(false);
    }
  };

  const saveAvatar = async () => {
    if (!active || busy) return;
    setBusy(true);
    setError(null);
    try {
      await changeCharacterAvatar(active.id, newAvatarId);
      notifyInfo('Аватар обновлён ✓');
      setView('main');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сменить аватар.');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!active || busy) return;
    setBusy(true);
    setError(null);
    try {
      await deleteCharacter(active.id);
      notifyInfo('Персонаж удалён. Создайте нового.');
      close();
      navigate('/select-character');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить персонажа.');
    } finally {
      setBusy(false);
    }
  };

  const title = view === 'nickname' ? 'Сменить ник'
    : view === 'avatar' ? 'Сменить аватар'
      : view === 'delete' ? 'Удалить персонажа?'
        : 'Настройки персонажа';

  return (
    <GModal open={open} onClose={view === 'main' ? close : back} title={title} width={380}>
      {view === 'main' && (
        <div className="hero-settings">
          {active && (
            <>
              <div className="hero-settings__who">
                <GAvatar src={getAvatarPath(active.avatarId)} size={56} glow />
                <div>
                  <strong>{active.nickname}</strong>
                  <p>{getRaceLabel(active.raceId, 'ru')}</p>
                </div>
              </div>
              <div className="hero-settings__grid">
                <GButton size="sm" variant="secondary" onClick={openNickname}>Сменить ник</GButton>
                <GButton size="sm" variant="secondary" onClick={openAvatar}>Сменить аватар</GButton>
              </div>
              <p className="hero-settings__hint">
                {!canEditNicknameFree && !canEditAvatarFree
                  ? `Лимит бесплатной смены исчерпан. Далее — ${AVATAR_COST_LABEL}.`
                  : `Бесплатно: ник ${canEditNicknameFree ? 'ещё можно' : 'уже использован'} · аватар ${canEditAvatarFree ? 'ещё можно' : 'уже использован'}.`}
              </p>
              <div className="hero-settings__grid">
                <GButton size="sm" variant="secondary" onClick={() => { close(); navigate('/select-character'); }}>
                  Сменить героя
                </GButton>
                <GButton size="sm" variant="danger" onClick={() => { setError(null); setView('delete'); }}>
                  Удалить героя
                </GButton>
              </div>
              <div className="hero-settings__rule" />
            </>
          )}
          <GInfoRow label="Бесплатных сбросов" value={`${left} / ${FREE_RESPEC_LIMIT}`} />
          <GButton size="sm" fullWidth disabled={!canPillars} onClick={onRespecPillars}>
            {left < 1
              ? 'Столпы — за золото'
              : spentP === 0
                ? 'Столпы: сбрасывать нечего'
                : 'Сбросить очки столпов'}
          </GButton>
          <GButton size="sm" fullWidth variant="secondary" disabled={!canBranches} onClick={onRespecBranches}>
            {left < 1
              ? 'Пассивки — за золото'
              : spentB === 0
                ? 'Пассивки: сбрасывать нечего'
                : 'Сбросить очки пассивок'}
          </GButton>
          <p className="hero-settings__hint">Дальше сброс — за золото. Цена не назначена.</p>
        </div>
      )}

      {view === 'nickname' && (
        <div className="hero-settings">
          {canEditNicknameFree ? (
            <>
              <p className="hero-settings__hint">Первая смена — бесплатно.</p>
              <GInput
                label="Новый ник"
                value={newNickname}
                onChange={v => { setNewNickname(v); setError(null); }}
                maxLength={20}
                icon="♙"
                autoFocus
                error={error ?? undefined}
              />
            </>
          ) : (
            <>
              <p className="hero-settings__hint">
                Бесплатная смена использована. Смена ника стоит {DONATE_COST_NICKNAME} 💎.
              </p>
              <p className="hero-settings__hint">На балансе: {donateCurrency} 💎. Система донат-валюты появится позже.</p>
            </>
          )}
          <div className="hero-settings__grid">
            <GButton variant="secondary" fullWidth onClick={back}>Назад</GButton>
            <GButton variant="primary" fullWidth disabled={!canEditNicknameFree || busy} onClick={() => void saveNickname()}>
              {busy ? '...' : 'Сохранить'}
            </GButton>
          </div>
        </div>
      )}

      {view === 'avatar' && (
        <div className="hero-settings">
          {!canEditAvatarFree && (
            <p className="hero-settings__hint">
              Бесплатная смена использована. Далее — {DONATE_COST_AVATAR} 💎 (скоро). На балансе: {donateCurrency} 💎
            </p>
          )}
          <div className="hero-settings__avatars">
            {getAvatarsForRace(active?.raceId ?? 'human').map(aid => (
              <GCard
                key={aid}
                selected={newAvatarId === aid}
                hoverEffect
                onClick={() => { setNewAvatarId(aid); setError(null); }}
                style={{ display: 'flex', justifyContent: 'center', padding: 8 }}
              >
                <GAvatar
                  src={getAvatarPath(aid)}
                  size={48}
                  borderColor={newAvatarId === aid ? 'var(--border-accent)' : 'var(--border-default)'}
                  glow={newAvatarId === aid}
                />
              </GCard>
            ))}
          </div>
          {error && <p className="hero-settings__error">{error}</p>}
          <div className="hero-settings__grid">
            <GButton variant="secondary" fullWidth onClick={back}>Назад</GButton>
            <GButton variant="primary" fullWidth disabled={!canEditAvatarFree || busy} onClick={() => void saveAvatar()}>
              {busy ? '...' : 'Сохранить'}
            </GButton>
          </div>
        </div>
      )}

      {view === 'delete' && (
        <div className="hero-settings">
          <p className="hero-settings__warn">
            Герой <b>{active?.nickname}</b> будет удалён безвозвратно вместе с инвентарём и прогрессом.
            Донат-валюта на аккаунте не пострадает.
          </p>
          {error && <p className="hero-settings__error">{error}</p>}
          <div className="hero-settings__grid">
            <GButton variant="secondary" fullWidth onClick={back}>Отмена</GButton>
            <GButton variant="danger" fullWidth disabled={busy} onClick={() => void confirmDelete()}>
              {busy ? '...' : 'Удалить навсегда'}
            </GButton>
          </div>
        </div>
      )}
    </GModal>
  );
}
