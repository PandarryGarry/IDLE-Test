/**
 * Локальная тестовая среда без Supabase.
 *
 * Включается ТОЛЬКО если:
 *   1) страница открыта с localhost / 127.0.0.1 / 0.0.0.0
 *   2) localStorage aethelia_qa_mock_v1 === '1'
 *
 * QA-скрипт ставит флаг через evaluateOnNewDocument до загрузки игры.
 * В Replit и на проде не срабатывает (другой hostname).
 */
import type { Session, User } from '@supabase/supabase-js';
import type { RaceId } from '@/data/characters';
import type { SaveData } from '@/data/types';

/** Совпадает с Character из characterApi — без импорта, чтобы не крутить цикл. */
export interface QaHero {
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

export const QA_MOCK_FLAG = 'aethelia_qa_mock_v1';
const DB_KEY = 'aethelia_qa_db_v1';

export function isQaMockEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const host = window.location.hostname;
    if (host !== '127.0.0.1' && host !== 'localhost' && host !== '0.0.0.0') return false;
    return window.localStorage.getItem(QA_MOCK_FLAG) === '1';
  } catch {
    return false;
  }
}

interface QaUser {
  id: string;
  email: string;
  password: string;
  createdAt: string;
  rulesVersion: string | null;
  rulesAcceptedAt: string | null;
}

interface QaDb {
  users: QaUser[];
  sessionUserId: string | null;
  characters: QaHero[];
}

function emptyDb(): QaDb {
  return { users: [], sessionUserId: null, characters: [] };
}

function readDb(): QaDb {
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) return emptyDb();
    const parsed = JSON.parse(raw) as QaDb;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessionUserId: parsed.sessionUserId ?? null,
      characters: Array.isArray(parsed.characters) ? parsed.characters : [],
    };
  } catch {
    return emptyDb();
  }
}

function writeDb(db: QaDb): void {
  window.localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function newId(prefix: string): string {
  const n = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${n}`;
}

function toUser(row: QaUser): User {
  return {
    id: row.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: row.email,
    app_metadata: { provider: 'qa-mock' },
    user_metadata: {
      rules_version: row.rulesVersion,
      rules_accepted_at: row.rulesAcceptedAt,
    },
    created_at: row.createdAt,
    updated_at: row.createdAt,
  } as User;
}

function toSession(user: User): Session {
  return {
    access_token: 'qa-mock-token',
    refresh_token: 'qa-mock-refresh',
    expires_in: 86400,
    expires_at: Math.floor(Date.now() / 1000) + 86400,
    token_type: 'bearer',
    user,
  } as Session;
}

export function qaMockReadSession(): Session | null {
  const db = readDb();
  const row = db.users.find(u => u.id === db.sessionUserId);
  if (!row) return null;
  return toSession(toUser(row));
}

export function qaMockProfileFields(user: User): {
  rulesVersion: string | null;
  rulesAcceptedAt: string | null;
} {
  const row = readDb().users.find(u => u.id === user.id);
  return {
    rulesVersion: row?.rulesVersion ?? null,
    rulesAcceptedAt: row?.rulesAcceptedAt ?? null,
  };
}

export function qaMockSignUp(email: string, password: string): { session: Session } {
  const db = readDb();
  const normalized = email.trim().toLowerCase();
  if (db.users.some(u => u.email === normalized)) {
    throw new Error('Этот email уже зарегистрирован.');
  }
  const row: QaUser = {
    id: newId('qa-user'),
    email: normalized,
    password,
    createdAt: new Date().toISOString(),
    rulesVersion: null,
    rulesAcceptedAt: null,
  };
  db.users.push(row);
  db.sessionUserId = row.id;
  writeDb(db);
  return { session: toSession(toUser(row)) };
}

export function qaMockSignIn(email: string, password: string): { session: Session } {
  const db = readDb();
  const normalized = email.trim().toLowerCase();
  const row = db.users.find(u => u.email === normalized);
  if (!row || row.password !== password) {
    throw new Error('Неверный email или пароль.');
  }
  db.sessionUserId = row.id;
  writeDb(db);
  return { session: toSession(toUser(row)) };
}

export function qaMockSignOut(): void {
  const db = readDb();
  db.sessionUserId = null;
  writeDb(db);
}

export function qaMockAcceptRules(userId: string, version: string): void {
  const db = readDb();
  const row = db.users.find(u => u.id === userId);
  if (!row) return;
  row.rulesVersion = version;
  row.rulesAcceptedAt = new Date().toISOString();
  writeDb(db);
}

export function qaFetchCharacters(userId: string): QaHero[] {
  return readDb().characters.filter(c => c.userId === userId && !c.isDeleted);
}

export function qaIsNicknameTaken(nickname: string): boolean {
  const needle = nickname.trim().toLowerCase();
  return readDb().characters.some(c => !c.isDeleted && c.nickname.toLowerCase() === needle);
}

export function qaCreateCharacter(params: {
  userId: string;
  nickname: string;
  avatarId: string;
  raceId: RaceId;
}): QaHero {
  const db = readDb();
  const now = Date.now();
  const created: QaHero = {
    id: newId('qa-hero'),
    userId: params.userId,
    nickname: params.nickname.trim(),
    avatarId: params.avatarId,
    raceId: params.raceId,
    saveData: null,
    hasChangedNickname: false,
    hasChangedAvatar: false,
    selected: true,
    lastSavedAt: now,
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
    deletedAt: null,
  };
  db.characters = db.characters.map(c =>
    c.userId === params.userId ? { ...c, selected: false } : c,
  );
  db.characters.push(created);
  writeDb(db);
  return created;
}

export function qaUpdateCharacter(
  characterId: string,
  patch: Partial<Pick<QaHero, 'nickname' | 'avatarId' | 'raceId' | 'hasChangedNickname' | 'hasChangedAvatar' | 'selected' | 'saveData'>>,
): QaHero {
  const db = readDb();
  const index = db.characters.findIndex(c => c.id === characterId);
  if (index < 0) throw new Error('Персонаж не найден');
  const cleaned = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as typeof patch;
  const next = { ...db.characters[index], ...cleaned, updatedAt: Date.now() };
  db.characters[index] = next;
  writeDb(db);
  return next;
}

export function qaSetSelectedCharacter(userId: string, characterId: string): void {
  const db = readDb();
  const now = Date.now();
  db.characters = db.characters.map(c => {
    if (c.userId !== userId) return c;
    if (c.id === characterId) return { ...c, selected: true, lastSavedAt: now };
    return { ...c, selected: false };
  });
  writeDb(db);
}

export function qaSoftDeleteCharacter(characterId: string): void {
  const db = readDb();
  db.characters = db.characters.map(c =>
    c.id === characterId
      ? { ...c, isDeleted: true, selected: false, deletedAt: Date.now() }
      : c,
  );
  writeDb(db);
}

export function qaFetchCharacter(characterId: string): QaHero | null {
  return readDb().characters.find(c => c.id === characterId && !c.isDeleted) ?? null;
}

export function qaSaveCharacter(characterId: string, saveData: SaveData): void {
  qaUpdateCharacter(characterId, { saveData });
}

export function qaLoadCharacterSave(characterId: string): SaveData | null {
  return qaFetchCharacter(characterId)?.saveData ?? null;
}
