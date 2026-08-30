import { create } from 'zustand';
import {
  fetchCharacters,
  createCharacter,
  updateCharacter,
  setSelectedCharacter,
  softDeleteCharacter,
  isNicknameTaken,
  type Character,
} from '@/lib/characterApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { resetGameToFresh } from '@/lib/saveManager';
import type { RaceId } from '@/data/characters';

const LAST_CHAR_KEY = 'aethelia_last_active_character';

function readLastCharacterId(): string | null {
  try {
    return window.localStorage.getItem(LAST_CHAR_KEY);
  } catch {
    return null;
  }
}

function writeLastCharacterId(id: string | null): void {
  try {
    if (id) window.localStorage.setItem(LAST_CHAR_KEY, id);
    else window.localStorage.removeItem(LAST_CHAR_KEY);
  } catch {
    // ignore
  }
}

export interface CreateCharacterInput {
  nickname: string;
  avatarId: string;
  raceId: RaceId;
}

interface CharacterStore {
  characters: Character[];
  activeCharacter: Character | null;
  loading: boolean;
  error: string | null;
  /**
   * Для какого userId уже завершён loadCharacters (успех или ошибка).
   * Нужен, чтобы вывеска/акт 0 и auth не считали «готово» по первому
   * кадру, и чтобы повторный fetch не ронял loading в true после заставки.
   */
  loadedUserId: string | null;
  /** Последний персонаж, за которого играли (для оффлайна). */
  lastActiveCharacterId: string | null;

  loadCharacters: (userId: string) => Promise<void>;
  selectCharacter: (character: Character) => Promise<void>;
  selectCharacterById: (characterId: string) => Promise<void>;
  createNewCharacter: (input: CreateCharacterInput) => Promise<Character>;
  renameCharacter: (characterId: string, nickname: string) => Promise<void>;
  changeCharacterAvatar: (characterId: string, avatarId: string) => Promise<void>;
  deleteCharacter: (characterId: string) => Promise<void>;
  markCharacterActive: (writeLast: boolean) => void;
  clear: () => void;
}

/** Сливаем параллельные loadCharacters одного userId в один промис. */
let inflightLoad: { userId: string; promise: Promise<void> } | null = null;

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  characters: [],
  activeCharacter: null,
  loading: Boolean(isSupabaseConfigured),
  error: null,
  loadedUserId: null,
  lastActiveCharacterId: readLastCharacterId(),

  loadCharacters: async (userId) => {
    if (inflightLoad && inflightLoad.userId === userId) {
      return inflightLoad.promise;
    }
    if (get().loadedUserId === userId && !get().loading) {
      return;
    }

    const run = (async () => {
      if (!isSupabaseConfigured) {
        set({ characters: [], activeCharacter: null, loading: false, loadedUserId: userId });
        return;
      }

      set({ loading: true, error: null });
      try {
        const chars = await fetchCharacters(userId);
        set({ characters: chars, loading: false, loadedUserId: userId });
        // always_select: при логине экран выбора показывается всегда.
        // Не авто-выбираем; сохраняем активного только если он ещё в списке.
        const current = get().activeCharacter;
        if (current && chars.some(c => c.id === current.id && !c.isDeleted)) {
          // keep current selection
        } else {
          set({ activeCharacter: null });
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Не удалось загрузить персонажей.';
        console.error('loadCharacters failed:', e);
        set({ loading: false, error: message, loadedUserId: userId });
      }
    })();

    inflightLoad = { userId, promise: run };
    try {
      await run;
    } finally {
      if (inflightLoad?.promise === run) inflightLoad = null;
    }
  },

  selectCharacter: async (character) => {
    const userId = character.userId;
    try {
      await setSelectedCharacter(userId, character.id);
      set(state => ({
        characters: state.characters.map(c => ({ ...c, selected: c.id === character.id })),
        activeCharacter: character,
        lastActiveCharacterId: character.id,
      }));
      writeLastCharacterId(character.id);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Не удалось выбрать персонажа.';
      set({ error: message });
      throw e;
    }
  },

  selectCharacterById: async (characterId) => {
    const { characters } = get();
    const character = characters.find(c => c.id === characterId) ?? null;
    if (!character) return;
    await get().selectCharacter(character);
  },

  createNewCharacter: async (input) => {
    const { characters } = get();
    // У первого героя ещё нет строки в characters, поэтому берём id из auth.
    const userId = useAuthStore.getState().user?.id ?? characters[0]?.userId;
    if (!userId) throw new Error('Нет активного аккаунта. Войдите снова и повторите попытку.');

    // Уникальность ника — до создания.
    if (await isNicknameTaken(input.nickname)) {
      throw new Error('Этот ник уже занят. Выберите другой.');
    }

    // Если создаём нового — удаляем старого (мягко), чтобы был ровно один.
    const existing = characters.filter(c => !c.isDeleted);
    if (existing.length > 0) {
      await Promise.all(existing.map(c => softDeleteCharacter(c.id)));
    }

    const created = await createCharacter({
      userId,
      nickname: input.nickname,
      avatarId: input.avatarId,
      raceId: input.raceId,
    });

    // Держим в сторе только созданного + мягко удалённые старые (для честного списка).
    set(state => ({
      characters: [
        ...state.characters
          .filter(c => c.id !== created.id && !c.isDeleted)
          .map(c => ({ ...c, isDeleted: true, selected: false })),
        created,
      ],
      activeCharacter: created,
      lastActiveCharacterId: created.id,
    }));
    writeLastCharacterId(created.id);

    // Новый герой — стартовые характеристики идентичны у всех.
    resetGameToFresh();
    return created;
  },

  renameCharacter: async (characterId, nickname) => {
    const trimmed = nickname.trim();
    if (!trimmed) throw new Error('Введите ник.');
    const current = get().characters.find(c => c.id === characterId);
    if (current && current.nickname.toLowerCase() === trimmed.toLowerCase()) return; // не тратим смену

    if (await isNicknameTaken(trimmed)) {
      throw new Error('Этот ник уже занят.');
    }
    const updated = await updateCharacter(characterId, {
      nickname: trimmed,
      hasChangedNickname: true,
    });
    set(state => ({
      characters: state.characters.map(c => (c.id === characterId ? updated : c)),
      activeCharacter: state.activeCharacter?.id === characterId ? updated : state.activeCharacter,
    }));
  },

  changeCharacterAvatar: async (characterId, avatarId) => {
    const current = get().characters.find(c => c.id === characterId);
    if (current && current.avatarId === avatarId) return; // не тратим смену
    const updated = await updateCharacter(characterId, {
      avatarId,
      hasChangedAvatar: true,
    });
    set(state => ({
      characters: state.characters.map(c => (c.id === characterId ? updated : c)),
      activeCharacter: state.activeCharacter?.id === characterId ? updated : state.activeCharacter,
    }));
  },

  deleteCharacter: async (characterId) => {
    await softDeleteCharacter(characterId);
    set(state => ({
      characters: state.characters.map(c =>
        c.id === characterId ? { ...c, isDeleted: true, selected: false } : c,
      ),
      activeCharacter: null,
      lastActiveCharacterId: null,
    }));
    writeLastCharacterId(null);
  },

  markCharacterActive: (writeLast) => {
    const active = get().activeCharacter;
    if (active && writeLast) {
      writeLastCharacterId(active.id);
      set({ lastActiveCharacterId: active.id });
    }
  },

  clear: () => {
    inflightLoad = null;
    set({
      characters: [],
      activeCharacter: null,
      loading: false,
      error: null,
      loadedUserId: null,
      lastActiveCharacterId: null,
    });
    writeLastCharacterId(null);
  },
}));
