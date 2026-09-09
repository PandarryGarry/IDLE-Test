import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCharacterStore } from '@/store/characterStore';
import { getAvatarPath, getRaceLabel, type RaceId } from '@/data/characters';
import { GModal } from '@/shared/ui/gameUI';

export interface AdminHeroChip {
  id: string;
  nickname: string;
  avatarId: string;
  raceId: RaceId;
}

interface AdminSessionValue {
  targetId: string | null;
  setTargetId: (id: string | null) => void;
  target: AdminHeroChip | null;
  living: AdminHeroChip[];
}

const AdminSessionContext = createContext<AdminSessionValue | null>(null);

const TARGET_KEY = 'aethelia_admin_target_character';

function chipsFromStore(): AdminHeroChip[] {
  return useCharacterStore.getState().characters
    .filter((c) => !c.isDeleted)
    .map((c) => ({
      id: c.id,
      nickname: c.nickname,
      avatarId: c.avatarId,
      raceId: c.raceId,
    }));
}

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const livingKey = useCharacterStore((s) =>
    s.characters
      .filter((c) => !c.isDeleted)
      .map((c) => `${c.id}:${c.nickname}:${c.avatarId}:${c.raceId}`)
      .join('|'),
  );
  const activeCharacterId = useCharacterStore((s) => s.activeCharacter?.id ?? null);
  const [targetId, setTargetIdState] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(TARGET_KEY);
    } catch {
      return null;
    }
  });

  const living = useMemo(() => chipsFromStore(), [livingKey]);

  useEffect(() => {
    if (user && useCharacterStore.getState().loadedUserId !== user.id) {
      void useCharacterStore.getState().loadCharacters(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (living.length === 0) {
      if (targetId) setTargetIdState(null);
      return;
    }
    if (targetId && living.some((c) => c.id === targetId)) return;
    const fallback = (activeCharacterId && living.some((c) => c.id === activeCharacterId)
      ? activeCharacterId
      : living[0].id);
    setTargetIdState(fallback);
  }, [living, targetId, activeCharacterId]);

  const setTargetId = useCallback((id: string | null) => {
    setTargetIdState(id);
    try {
      if (id) window.localStorage.setItem(TARGET_KEY, id);
      else window.localStorage.removeItem(TARGET_KEY);
    } catch {
      // ignore
    }
  }, []);

  const target = living.find((c) => c.id === targetId) ?? null;

  const value = useMemo(
    () => ({ targetId, setTargetId, target, living }),
    [targetId, setTargetId, target, living],
  );

  return (
    <AdminSessionContext.Provider value={value}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession(): AdminSessionValue {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) throw new Error('useAdminSession вне AdminSessionProvider');
  return ctx;
}

export function AdminCharacterPickerModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { living, targetId, setTargetId } = useAdminSession();

  return (
    <GModal open={open} onClose={onClose} title="Выбор персонажа" width={480}>
      {living.length === 0 ? (
        <p className="admin-char-pick__empty">Нет персонажей — сначала создай героя.</p>
      ) : (
        <div className="admin-char-pick__grid">
          {living.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`admin-char-pick__card${c.id === targetId ? ' is-on' : ''}`}
              onClick={() => {
                setTargetId(c.id);
                onClose();
              }}
            >
              <img src={getAvatarPath(c.avatarId)} alt="" className="admin-char-pick__avatar" />
              <span className="admin-char-pick__name">{c.nickname}</span>
              <span className="admin-char-pick__race">{getRaceLabel(c.raceId, 'ru')}</span>
            </button>
          ))}
        </div>
      )}
    </GModal>
  );
}

export function AdminTargetBar() {
  const { target, living } = useAdminSession();
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-target">
      <span className="admin-target__label">Кому выдаём</span>
      {living.length === 0 ? (
        <span className="admin-target__empty">Нет персонажей — сначала создай героя</span>
      ) : (
        <button
          type="button"
          className="admin-target__pick"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
        >
          {target && (
            <img src={getAvatarPath(target.avatarId)} alt="" className="admin-target__avatar" />
          )}
          <span className="admin-target__nick">{target?.nickname ?? 'Выбрать'}</span>
        </button>
      )}
      <AdminCharacterPickerModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
