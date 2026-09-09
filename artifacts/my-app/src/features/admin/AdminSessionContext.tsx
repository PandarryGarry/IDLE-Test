import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCharacterStore } from '@/store/characterStore';
import type { Character } from '@/lib/characterApi';
import { getAvatarPath } from '@/data/characters';

interface AdminSessionValue {
  targetId: string | null;
  setTargetId: (id: string | null) => void;
  target: Character | null;
  living: Character[];
}

const AdminSessionContext = createContext<AdminSessionValue | null>(null);

const TARGET_KEY = 'aethelia_admin_target_character';

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const characters = useCharacterStore((s) => s.characters);
  const activeCharacter = useCharacterStore((s) => s.activeCharacter);
  const [targetId, setTargetIdState] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(TARGET_KEY);
    } catch {
      return null;
    }
  });

  const living = useMemo(() => characters.filter((c) => !c.isDeleted), [characters]);

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
    const fallback = (activeCharacter && living.some((c) => c.id === activeCharacter.id)
      ? activeCharacter.id
      : living[0].id);
    setTargetIdState(fallback);
  }, [living, targetId, activeCharacter]);

  const setTargetId = (id: string | null) => {
    setTargetIdState(id);
    try {
      if (id) window.localStorage.setItem(TARGET_KEY, id);
      else window.localStorage.removeItem(TARGET_KEY);
    } catch {
      // ignore
    }
  };

  const target = living.find((c) => c.id === targetId) ?? null;

  return (
    <AdminSessionContext.Provider value={{ targetId, setTargetId, target, living }}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession(): AdminSessionValue {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) throw new Error('useAdminSession вне AdminSessionProvider');
  return ctx;
}

export function AdminTargetBar() {
  const { target, living, setTargetId } = useAdminSession();

  return (
    <div className="admin-target">
      <span className="admin-target__label">Кому выдаём</span>
      {living.length === 0 ? (
        <span className="admin-target__empty">Нет персонажей — сначала создай героя</span>
      ) : (
        <label className="admin-target__pick">
          {target && (
            <img src={getAvatarPath(target.avatarId)} alt="" className="admin-target__avatar" />
          )}
          <select
            value={target?.id ?? ''}
            onChange={(e) => setTargetId(e.target.value || null)}
          >
            {living.map((c) => (
              <option key={c.id} value={c.id}>{c.nickname}</option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
