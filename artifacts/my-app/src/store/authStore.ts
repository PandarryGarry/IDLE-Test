import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import {
  supabase,
  isSupabaseConfigured,
  SUPABASE_CONFIG_MESSAGE,
} from '@/lib/supabase';

export interface AuthProfile {
  id: string;
  email: string | null;
  nickname?: string;
  avatarId?: string;
  createdAt?: string;
  // ── Этап 4: аккаунт ────────────────────────────────────────
  role?: 'user' | 'admin';
  donateCurrency?: number;
  rulesAcceptedAt?: string | null;
  rulesVersion?: string | null;
  selectedCharacterId?: string | null;
}

export interface AuthResult {
  ok: boolean;
  message?: string;
  needsEmailConfirmation?: boolean;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  loading: boolean;
  isGuest: boolean;
  isSupabaseConfigured: boolean;
  authError: string | null;
  authMessage: string | null;

  restoreSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, unknown>,
  ) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  clearAuthFeedback: () => void;
  acceptRules: (version: string) => Promise<void>;
}

const GUEST_KEY = 'aethelia_guest';

type AuthListener = {
  data: {
    subscription: {
      unsubscribe: () => void;
    };
  };
};
let authSubscription: AuthListener | null = null;

function isStorageAvailable(storage: Storage): boolean {
  try {
    const probe = '__aethelia_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function readGuest(): boolean {
  try {
    if (!isStorageAvailable(window.sessionStorage)) return false;
    return window.sessionStorage.getItem(GUEST_KEY) === '1';
  } catch {
    return false;
  }
}

function writeGuest(value: boolean): void {
  try {
    if (value) {
      window.sessionStorage.setItem(GUEST_KEY, '1');
    } else {
      window.sessionStorage.removeItem(GUEST_KEY);
    }
  } catch {
    // ignore storage failures
  }
}

type AuthSet = (partial: Partial<AuthState>) => void;

function rowToProfile(row: Record<string, unknown>, user: User): AuthProfile {
  const nicknameValue = row.nickname ?? row.username ?? null;
  const metadata = user.user_metadata ?? {};

  return {
    id: (row.id as string) ?? user.id,
    email: (row.email as string | null) ?? user.email ?? null,
    nickname:
      (nicknameValue as string | null) ??
      (metadata.nickname as string | undefined) ??
      undefined,
    avatarId:
      (row.avatar_id as string | undefined) ??
      (row.avatarId as string | undefined) ??
      (metadata.avatar_id as string | undefined) ??
      (metadata.avatarId as string | undefined) ??
      undefined,
    createdAt: (row.created_at as string | undefined) ?? user.created_at,
    role: (row.role as 'user' | 'admin' | undefined) ?? (metadata.role as 'user' | 'admin' | undefined) ?? 'user',
    donateCurrency:
      (row.donate_currency as number | undefined) ??
      (metadata.donate_currency as number | undefined) ??
      0,
    rulesAcceptedAt:
      (row.rules_accepted_at as string | null | undefined) ??
      (metadata.rules_accepted_at as string | undefined) ??
      null,
    rulesVersion:
      (row.rules_version as string | null | undefined) ??
      (metadata.rules_version as string | undefined) ??
      null,
    selectedCharacterId:
      (row.selected_character_id as string | null | undefined) ??
      (metadata.selected_character_id as string | undefined) ??
      null,
  };
}

function fallbackProfile(user: User): AuthProfile {
  const metadata = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? null,
    nickname: (metadata.nickname as string | undefined) ?? undefined,
    avatarId:
      (metadata.avatar_id as string | undefined) ??
      (metadata.avatarId as string | undefined) ??
      undefined,
    createdAt: user.created_at,
    role: (metadata.role as 'user' | 'admin' | undefined) ?? 'user',
    donateCurrency: (metadata.donate_currency as number | undefined) ?? 0,
    rulesAcceptedAt: (metadata.rules_accepted_at as string | undefined) ?? null,
    rulesVersion: (metadata.rules_version as string | undefined) ?? null,
    selectedCharacterId: (metadata.selected_character_id as string | undefined) ?? null,
  };
}

async function applyAuthSession(set: AuthSet, session: Session | null) {
  if (!session) {
    set({
      session: null,
      user: null,
      profile: null,
      isGuest: readGuest(),
      authError: null,
    });
    return;
  }

  const user = session.user;
  set({
    session,
    user,
    profile: fallbackProfile(user),
    isGuest: false,
    authError: null,
    authMessage: null,
  });

  if (!supabase) return;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data) {
      set({ profile: rowToProfile(data as Record<string, unknown>, user) });
    }
  } catch (error) {
    console.warn('Failed to load profile:', error);
  }
}

function attachAuthListener(set: AuthSet) {
  if (authSubscription || !supabase) return;

  authSubscription = supabase.auth.onAuthStateChange((_event, session) => {
    void applyAuthSession(set, session);
  });
}

function setConfigError(set: AuthSet): AuthResult {
  set({ authError: SUPABASE_CONFIG_MESSAGE });
  return { ok: false, message: SUPABASE_CONFIG_MESSAGE };
}

/** True when the API failed at the network/transport layer (not an API response). */
function isNetworkError(err: unknown): boolean {
  const msg = String((err as { message?: string })?.message ?? err ?? '').toLowerCase();
  return (
    /failed to fetch|load failed|networkerror|network error|fetch failed|typeerror|aborted|econnrefused|offline|internet/i.test(msg) ||
    /Failed to fetch/i.test(msg)
  );
}

/** Returns a user-facing, human readable message for an auth/API error. */
function describeAuthError(err: unknown, fallback: string): string {
  const msg = String((err as { message?: string })?.message ?? err ?? '').trim();
  if (!msg || isNetworkError(err)) {
    return 'Не удаётся связаться с сервером. Проверьте интернет, а также переменные VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в Replit Secrets.';
  }
  return msg;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isGuest: readGuest(),
  isSupabaseConfigured,
  authError: null,
  authMessage: null,

  restoreSession: async () => {
    set({ loading: true, authError: null });

    if (!supabase) {
      set({
        session: null,
        user: null,
        profile: null,
        isGuest: readGuest(),
        loading: false,
      });
      return;
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        set({
          authError: error.message,
          session: null,
          user: null,
          profile: null,
          isGuest: readGuest(),
        });
      } else {
        await applyAuthSession(set, data.session);
      }
    } catch (error) {
      console.warn('Failed to restore auth session:', error);
      set({
        session: null,
        user: null,
        profile: null,
        isGuest: readGuest(),
        authError: 'Не удалось восстановить сессию.',
      });
    } finally {
      attachAuthListener(set);
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    set({
      authError: null,
      authMessage: null,
      session: null,
      user: null,
      profile: null,
      isGuest: false,
    });

    if (!supabase) return setConfigError(set);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('signIn API error:', error);
        const message = describeAuthError(error, 'Не удалось войти. Проверьте email и пароль.');
        set({ authError: message });
        return { ok: false, message };
      }

      await applyAuthSession(set, data.session);
      return { ok: true };
    } catch (error) {
      console.error('signIn failed:', error);
      const message = describeAuthError(error, 'Не удалось войти. Попробуйте ещё раз.');
      set({ authError: message });
      return { ok: false, message };
    }
  },

  signUp: async (email, password, metadata) => {
    set({ authError: null, authMessage: null });

    if (!supabase) return setConfigError(set);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata ?? {},
        },
      });

      if (error) {
        console.error('signUp API error:', error);
        const message = describeAuthError(error, 'Не удалось создать аккаунт. Проверьте email и пароль.');
        set({ authError: message });
        return { ok: false, message };
      }

      if (data.session) {
        await applyAuthSession(set, data.session);
        return { ok: true };
      }

      const message = 'Аккаунт создан. Проверьте почту, чтобы подтвердить email.';
      set({ authMessage: message });
      return { ok: true, needsEmailConfirmation: true, message };
    } catch (error) {
      console.error('signUp failed:', error);
      const message = describeAuthError(error, 'Не удалось создать аккаунт. Попробуйте ещё раз.');
      set({ authError: message });
      return { ok: false, message };
    }
  },

  signInWithGoogle: async () => {
    set({ authError: null, authMessage: null });

    if (!supabase) return setConfigError(set);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'online',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        console.error('Google sign-in API error:', error);
        const message = describeAuthError(error, 'Не удалось открыть Google-вход. Проверьте настройку Google provider.');
        set({ authError: message });
        return { ok: false, message };
      }

      return { ok: true };
    } catch (error) {
      console.error('Google sign-in failed:', error);
      const message = describeAuthError(error, 'Не удалось открыть Google-вход. Попробуйте ещё раз.');
      set({ authError: message });
      return { ok: false, message };
    }
  },

  signOut: async () => {
    writeGuest(false);

    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.warn('signOut failed:', error);
      }
    }

    set({
      session: null,
      user: null,
      profile: null,
      isGuest: false,
      authError: null,
      authMessage: null,
    });
  },

  continueAsGuest: () => {
    writeGuest(true);
    set({
      session: null,
      user: null,
      profile: null,
      isGuest: true,
      authError: null,
      authMessage: null,
    });
  },

  clearAuthFeedback: () => {
    set({ authError: null, authMessage: null });
  },

  acceptRules: async (version) => {
    const now = new Date().toISOString();

    set(state => ({
      profile: state.profile
        ? { ...state.profile, rulesAcceptedAt: now, rulesVersion: version }
        : state.profile,
    }));

    if (supabase) {
      try {
        const { data: { user: signedIn } } = await supabase.auth.getUser();
        if (signedIn) {
          await supabase
            .from('profiles')
            .upsert(
              { id: signedIn.id, rules_accepted_at: now, rules_version: version },
              { onConflict: 'id' },
            );
          await supabase.auth.updateUser({
            data: { rules_accepted_at: now, rules_version: version },
          });
        }
      } catch (e) {
        console.warn('acceptRules: failed to persist rules acceptance:', e);
      }
    }

    set(state => ({
      profile: state.profile
        ? { ...state.profile, rulesAcceptedAt: now, rulesVersion: version }
        : state.profile,
      authMessage: null,
    }));
  },
}));
