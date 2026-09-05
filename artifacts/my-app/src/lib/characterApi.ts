import { supabase, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import {
  isQaMockEnabled,
  qaCreateCharacter,
  qaFetchCharacter,
  qaFetchCharacters,
  qaIsNicknameTaken,
  qaLoadCharacterSave,
  qaSaveCharacter,
  qaSetSelectedCharacter,
  qaSoftDeleteCharacter,
  qaUpdateCharacter,
} from '@/lib/qaMock';
import type { SaveData } from '@/data/types';
import type { RaceId } from '@/data/characters';
import { withTimeout } from '@/lib/utils';
import { attachAttributesToSave, createDefaultAttributes } from '@/domain/attributes/characterAttributes';

/** Потолок сетевых вызовов Supabase: зависший запрос не должен блокировать UI. */
const API_TIMEOUT_MS = 12000;

/** Персонаж (строка таблицы public.characters). */
export interface Character {
  id: string;
  userId: string;
  nickname: string;
  avatarId: string;
  raceId: RaceId;
  saveData: SaveData | null;
  hasChangedNickname: boolean;
  hasChangedAvatar: boolean;
  selected: boolean;
  lastSavedAt: number;
  createdAt: number;
  updatedAt: number;
  isDeleted: boolean;
  deletedAt: number | null;
}

interface CharacterRow {
  id: string;
  user_id: string;
  nickname: string;
  avatar_id: string;
  race_id: string;
  save_data: SaveData | null;
  has_changed_nickname: boolean;
  has_changed_avatar: boolean;
  selected: boolean;
  last_saved_at: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
}

function toMs(value: string | null | undefined): number {
  if (!value) return Date.now();
  const t = Date.parse(value);
  return Number.isNaN(t) ? Date.now() : t;
}

function rowToCharacter(row: CharacterRow): Character {
  return {
    id: row.id,
    userId: row.user_id,
    nickname: row.nickname,
    avatarId: row.avatar_id,
    raceId: (row.race_id as RaceId) ?? 'human',
    saveData: row.save_data
      ? (attachAttributesToSave(row.save_data as unknown as Record<string, unknown>) as SaveData)
      : null,
    hasChangedNickname: row.has_changed_nickname ?? false,
    hasChangedAvatar: row.has_changed_avatar ?? false,
    selected: row.selected ?? false,
    lastSavedAt: toMs(row.last_saved_at),
    createdAt: toMs(row.created_at),
    updatedAt: toMs(row.updated_at),
    isDeleted: row.is_deleted ?? false,
    deletedAt: row.deleted_at ? toMs(row.deleted_at) : null,
  };
}

function requireClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase не настроен');
  }
  return getSupabaseClient();
}

/** Получить живых персонажей пользователя (без is_deleted). */
export async function fetchCharacters(userId: string): Promise<Character[]> {
  if (isQaMockEnabled()) return qaFetchCharacters(userId) as Character[];
  const client = requireClient();
  // Postgrest-builder — thenable; явно приводим к Promise для withTimeout.
  const query = client
    .from('characters')
    .select('*')
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true }) as unknown as Promise<{
    data: CharacterRow[] | null;
    error: { message: string } | null;
  }>;

  const { data, error } = await withTimeout(
    query,
    API_TIMEOUT_MS,
    'Загрузка персонажей заняла слишком много времени.',
  );

  if (error) {
    console.error('fetchCharacters error:', error);
    throw new Error(error.message);
  }
  return (data ?? []).map(rowToCharacter as (r: CharacterRow) => Character);
}

/** Проверка уникальности ника через RPC (security definer). */
export async function isNicknameTaken(nickname: string): Promise<boolean> {
  if (isQaMockEnabled()) return qaIsNicknameTaken(nickname);
  const client = requireClient();
  const { data, error } = await client.rpc('is_nickname_taken', {
    candidate: nickname.trim(),
  });

  if (error) {
    console.error('is_nickname_taken error:', error);
    throw new Error(error.message);
  }
  return Boolean(data);
}

/** Получить один персонаж по id. */
export async function fetchCharacter(characterId: string): Promise<Character | null> {
  if (isQaMockEnabled()) return qaFetchCharacter(characterId) as Character | null;
  const client = requireClient();
  const { data, error } = await client
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .eq('is_deleted', false)
    .maybeSingle();

  if (error) {
    console.error('fetchCharacter error:', error);
    throw new Error(error.message);
  }
  return data ? rowToCharacter(data as CharacterRow) : null;
}

/** Создать персонажа. */
export async function createCharacter(params: {
  userId: string;
  nickname: string;
  avatarId: string;
  raceId: RaceId;
  saveData?: SaveData;
}): Promise<Character> {
  if (isQaMockEnabled()) {
    return qaCreateCharacter({
      userId: params.userId,
      nickname: params.nickname,
      avatarId: params.avatarId,
      raceId: params.raceId,
    }) as Character;
  }
  const client = requireClient();
  const { data, error } = await client
    .from('characters')
    .insert({
      user_id: params.userId,
      nickname: params.nickname.trim(),
      avatar_id: params.avatarId,
      race_id: params.raceId,
      save_data: params.saveData ?? { attributes: createDefaultAttributes() },
      selected: true,
    })
    .select('*')
    .single();

  if (error) {
    console.error('createCharacter error:', error);
    throw new Error(error.message);
  }
  return rowToCharacter(data as CharacterRow);
}

/** Обновить произвольные поля персонажа. */
export async function updateCharacter(
  characterId: string,
  patch: Partial<{ nickname: string; avatarId: string; raceId: string; hasChangedNickname: boolean; hasChangedAvatar: boolean; selected: boolean; saveData: SaveData }>,
): Promise<Character> {
  if (isQaMockEnabled()) {
    return qaUpdateCharacter(characterId, {
      nickname: patch.nickname,
      avatarId: patch.avatarId,
      raceId: patch.raceId as RaceId | undefined,
      hasChangedNickname: patch.hasChangedNickname,
      hasChangedAvatar: patch.hasChangedAvatar,
      selected: patch.selected,
      saveData: patch.saveData,
    }) as Character;
  }
  const client = requireClient();

  const dbPatch: Record<string, unknown> = {};
  if (patch.nickname !== undefined) dbPatch.nickname = patch.nickname.trim();
  if (patch.avatarId !== undefined) dbPatch.avatar_id = patch.avatarId;
  if (patch.raceId !== undefined) dbPatch.race_id = patch.raceId;
  if (patch.hasChangedNickname !== undefined) dbPatch.has_changed_nickname = patch.hasChangedNickname;
  if (patch.hasChangedAvatar !== undefined) dbPatch.has_changed_avatar = patch.hasChangedAvatar;
  if (patch.selected !== undefined) dbPatch.selected = patch.selected;
  if (patch.saveData !== undefined) dbPatch.save_data = patch.saveData;

  if (Object.keys(dbPatch).length === 0) {
    const existing = await fetchCharacter(characterId);
    if (!existing) throw new Error('Персонаж не найден');
    return existing;
  }

  const { data, error } = await client
    .from('characters')
    .update(dbPatch)
    .eq('id', characterId)
    .select('*')
    .single();

  if (error) {
    console.error('updateCharacter error:', error);
    throw new Error(error.message);
  }
  return rowToCharacter(data as CharacterRow);
}

/** Пометить персонажа активным (снять флаг с остальных). */
export async function setSelectedCharacter(userId: string, characterId: string): Promise<void> {
  if (isQaMockEnabled()) {
    qaSetSelectedCharacter(userId, characterId);
    return;
  }
  const client = requireClient();
  const { error: resetError } = await client
    .from('characters')
    .update({ selected: false })
    .eq('user_id', userId)
    .neq('id', characterId);

  if (resetError) {
    console.error('setSelectedCharacter reset error:', resetError);
    throw new Error(resetError.message);
  }

  const { error } = await client
    .from('characters')
    .update({ selected: true, last_saved_at: new Date().toISOString() })
    .eq('id', characterId);

  if (error) {
    console.error('setSelectedCharacter error:', error);
    throw new Error(error.message);
  }
}

/** Мягко удалить персонажа (is_deleted=true, selected=false). */
export async function softDeleteCharacter(characterId: string): Promise<void> {
  if (isQaMockEnabled()) {
    qaSoftDeleteCharacter(characterId);
    return;
  }
  const client = requireClient();
  const { error } = await client
    .from('characters')
    .update({ is_deleted: true, deleted_at: new Date().toISOString(), selected: false })
    .eq('id', characterId);

  if (error) {
    console.error('softDeleteCharacter error:', error);
    throw new Error(error.message);
  }
}

/** Сохранить save_data персонажа в облако (для сейва). */
export async function saveCharacterToCloud(
  characterId: string,
  saveData: SaveData,
): Promise<void> {
  if (isQaMockEnabled()) {
    qaSaveCharacter(characterId, saveData);
    return;
  }
  const client = requireClient();
  const { error } = await client
    .from('characters')
    .update({
      save_data: saveData,
      last_saved_at: new Date().toISOString(),
    })
    .eq('id', characterId);

  if (error) {
    console.error('saveCharacterToCloud error:', error);
    throw new Error(error.message);
  }
}

/** Загрузить save_data персонажа из облака. */
export async function loadCharacterFromCloud(characterId: string): Promise<SaveData | null> {
  const client = requireClient();
  const { data, error } = await client
    .from('characters')
    .select('save_data')
    .eq('id', characterId)
    .eq('is_deleted', false)
    .single();

  if (error) {
    console.error('loadCharacterFromCloud error:', error);
    throw new Error(error.message);
  }
  return (data?.save_data as SaveData | null) ?? null;
}
