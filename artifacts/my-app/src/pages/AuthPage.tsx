import { FormEvent, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/store/authStore';
import { resetForGuestStart } from '@/lib/authActions';
import { isSupabaseConfigured, SUPABASE_CONFIG_MESSAGE } from '@/lib/supabase';

type AuthMode = 'login' | 'register';

type AuthPageProps = {
  initialMode?: AuthMode;
};

const modeCopy: Record<AuthMode, {
  eyebrow: string;
  headline: string;
  subtitle: string;
  formEyebrow: string;
  formTitle: string;
  formSubtitle: string;
  submit: string;
  switchWord: string;
}> = {
  login: {
    eyebrow: 'ЖИВАЯ ТАВЕРНА',
    headline: 'Вернись к своему герою',
    subtitle: 'Сохрани прогресс и продолжи путь у очага.',
    formEyebrow: 'ВХОД',
    formTitle: 'Вход',
    formSubtitle: 'Продолжи путь.',
    submit: 'Войти',
    switchWord: 'Создать аккаунт',
  },
  register: {
    eyebrow: 'ЖИВАЯ ТАВЕРНА',
    headline: 'Создай своего героя',
    subtitle: 'Аккаунт сохранит ремёсла, добычу и прогресс.',
    formEyebrow: 'АККАУНТ',
    formTitle: 'Регистрация',
    formSubtitle: 'Сохрани прогресс.',
    submit: 'Создать',
    switchWord: 'Уже есть аккаунт? Войти',
  },
};

function AuthTextField({
  id,
  label,
  placeholder,
  type = 'text',
  icon,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  icon: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="auth-field" htmlFor={id}>
      <span className="auth-field__label">{label}</span>
      <span className="auth-field__control">
        <span className="auth-field__icon" aria-hidden="true">{icon}</span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
        />
      </span>
    </label>
  );
}

export function AuthPage({ initialMode = 'login' }: AuthPageProps) {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const authError = useAuthStore(s => s.authError);
  const authMessage = useAuthStore(s => s.authMessage);
  const clearAuthFeedback = useAuthStore(s => s.clearAuthFeedback);
  const signIn = useAuthStore(s => s.signIn);
  const signUp = useAuthStore(s => s.signUp);
  const signInWithGoogle = useAuthStore(s => s.signInWithGoogle);
  const continueAsGuest = useAuthStore(s => s.continueAsGuest);

  useEffect(() => {
    setMode(initialMode);
    setLocalError(null);
    clearAuthFeedback();
  }, [initialMode]);

  const copy = modeCopy[mode];
  const isRegister = mode === 'register';

  const switchMode = () => {
    const nextMode: AuthMode = isRegister ? 'login' : 'register';
    setLocalError(null);
    clearAuthFeedback();
    setMode(nextMode);
    navigate(nextMode === 'register' ? '/register' : '/login');
  };

  const formFields = useMemo(() => {
    const shared = [
      <AuthTextField
        key="email"
        id="auth-email"
        label="Email"
        placeholder="you@example.com"
        type="email"
        icon="✉"
        autoComplete="email"
        value={email}
        onChange={setEmail}
      />,
      <AuthTextField
        key="password"
        id="auth-password"
        label="Пароль"
        placeholder="••••••••"
        type="password"
        icon="◆"
        autoComplete={isRegister ? 'new-password' : 'current-password'}
        value={password}
        onChange={setPassword}
      />,
    ];

    if (!isRegister) {
      return shared;
    }

    return [
      ...shared,
      <AuthTextField
        key="password-repeat"
        id="auth-password-repeat"
        label="Повтор"
        placeholder="••••••••"
        type="password"
        icon="✓"
        autoComplete="new-password"
        value={passwordRepeat}
        onChange={setPasswordRepeat}
      />,
    ];
  }, [email, password, passwordRepeat, isRegister]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setLocalError(null);
    clearAuthFeedback();

    if (!isSupabaseConfigured) {
      setLocalError(SUPABASE_CONFIG_MESSAGE);
      return;
    }

    if (!email.trim() || !password) {
      setLocalError('Заполните email и пароль.');
      return;
    }

    if (isRegister) {
      if (password.length < 6) {
        setLocalError('Пароль должен быть не короче 6 символов.');
        return;
      }
      if (password !== passwordRepeat) {
        setLocalError('Пароли не совпадают.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        const result = await signUp(email.trim(), password);
        if (!result.ok) return;
        if (result.needsEmailConfirmation) return;
        navigate('/');
      } else {
        const result = await signIn(email.trim(), password);
        if (!result.ok) return;
        navigate('/');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (submitting || googleLoading) return;

    setLocalError(null);
    clearAuthFeedback();

    if (!isSupabaseConfigured) {
      setLocalError(SUPABASE_CONFIG_MESSAGE);
      return;
    }

    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.ok) return;
      // Supabase handles the OAuth redirect.
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGuest = () => {
    clearAuthFeedback();
    setLocalError(null);
    resetForGuestStart();
    continueAsGuest();
    navigate('/');
  };

  const displayedError = localError || authError;

  return (
    <main className={`auth-screen auth-screen--${mode}`} aria-label="Aethelia authorization">
      <div className="auth-screen__firelight" aria-hidden="true" />
      <div className="auth-screen__embers" aria-hidden="true">
        {Array.from({ length: 26 }, (_, index) => (
          <span key={index} style={{ '--i': index } as CSSProperties} />
        ))}
      </div>

      <div className="auth-stage">
        <div className="auth-stage__body">
        <section className="auth-story" aria-label="Описание мира Aethelia">
          <span className="auth-pill">{copy.eyebrow}</span>
          <h1>{copy.headline}</h1>
          <p>{copy.subtitle}</p>
        </section>

        <section className="auth-card" aria-label={isRegister ? 'Регистрация' : 'Вход'}>
          <div className="auth-card__content">
            <span className="auth-pill auth-pill--form">{copy.formEyebrow}</span>
            <h2>{copy.formTitle}</h2>
            <p>{copy.formSubtitle}</p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form__fields">{formFields}</div>

              {!isRegister && (
                <label className="auth-remember">
                  <input type="checkbox" defaultChecked />
                  <span>Запомнить</span>
                </label>
              )}

              {!isSupabaseConfigured && (
                <div className="auth-config-warning">
                  Supabase не настроен. Добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.
                </div>
              )}

              {(displayedError || authMessage) && (
                <div className={displayedError ? 'auth-error' : 'auth-message'}>
                  {displayedError || authMessage}
                </div>
              )}

              <div className="auth-actions">
                <button
                  className="auth-button auth-button--primary"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? '...' : copy.submit}
                </button>
                <button
                  className="auth-button auth-button--secondary"
                  type="button"
                  onClick={switchMode}
                >
                  {copy.switchWord}
                </button>
              </div>

              {!isRegister && (
                <>
                  <div className="auth-or" aria-hidden="true">
                    <span>или</span>
                  </div>
                  <button
                    className="auth-button auth-button--secondary auth-button--google"
                    type="button"
                    onClick={handleGoogle}
                    disabled={submitting || googleLoading}
                  >
                    {googleLoading ? '...' : 'Google'}
                  </button>
                </>
              )}

              {!isRegister && (
                <button className="auth-link auth-link--guest" type="button" onClick={handleGuest}>
                  Войти гостем
                </button>
              )}
            </form>
          </div>
        </section>
        </div>
      </div>
    </main>
  );
}

export default AuthPage;
