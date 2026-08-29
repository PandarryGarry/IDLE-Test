import { FormEvent, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useLocation } from 'wouter';

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
  switchLabel: string;
}> = {
  login: {
    eyebrow: 'ЖИВАЯ ТАВЕРНА',
    headline: 'Вернись к своему герою',
    subtitle: 'Сохрани прогресс и продолжи путь у очага.',
    formEyebrow: 'ВХОД',
    formTitle: 'Вход',
    formSubtitle: 'Продолжи путь.',
    submit: 'Войти',
    switchLabel: 'Создать аккаунт',
  },
  register: {
    eyebrow: 'ЖИВАЯ ТАВЕРНА',
    headline: 'Создай своего героя',
    subtitle: 'Аккаунт сохранит ремёсла, добычу и прогресс.',
    formEyebrow: 'АККАУНТ',
    formTitle: 'Регистрация',
    formSubtitle: 'Сохрани прогресс.',
    submit: 'Создать',
    switchLabel: 'Уже есть аккаунт? Войти',
  },
};

function AuthTextField({
  id,
  label,
  placeholder,
  type = 'text',
  icon,
  autoComplete,
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  icon: string;
  autoComplete?: string;
}) {
  return (
    <label className="auth-field" htmlFor={id}>
      <span className="auth-field__label">{label}</span>
      <span className="auth-field__control">
        <span className="auth-field__icon" aria-hidden="true">{icon}</span>
        <input id={id} type={type} placeholder={placeholder} autoComplete={autoComplete} />
      </span>
    </label>
  );
}

export function AuthPage({ initialMode = 'login' }: AuthPageProps) {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const copy = modeCopy[mode];
  const isRegister = mode === 'register';

  const switchMode = () => {
    const nextMode: AuthMode = isRegister ? 'login' : 'register';
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
      />,
      <AuthTextField
        key="password"
        id="auth-password"
        label="Пароль"
        placeholder="••••••••"
        type="password"
        icon="◆"
        autoComplete={isRegister ? 'new-password' : 'current-password'}
      />,
    ];

    if (!isRegister) {
      return shared;
    }

    return [
      <AuthTextField
        key="name"
        id="auth-name"
        label="Имя"
        placeholder="Garry"
        icon="♙"
        autoComplete="nickname"
      />,
      ...shared,
      <AuthTextField
        key="password-repeat"
        id="auth-password-repeat"
        label="Повтор"
        placeholder="••••••••"
        type="password"
        icon="✓"
        autoComplete="new-password"
      />,
    ];
  }, [isRegister]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <main className={`auth-screen auth-screen--${mode}`} aria-label="Aethelia authorization">
      <div className="auth-screen__firelight" aria-hidden="true" />
      <div className="auth-screen__embers" aria-hidden="true">
        {Array.from({ length: 26 }, (_, index) => (
          <span key={index} style={{ '--i': index } as CSSProperties} />
        ))}
      </div>

      <div className="auth-stage">
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
                  <input type="checkbox" />
                  <span>Запомнить</span>
                </label>
              )}

              <div className="auth-actions">
                <button className="auth-button auth-button--primary" type="submit">
                  {copy.submit}
                </button>
                <button className="auth-button auth-button--secondary" type="button">
                  Google
                </button>
              </div>

              <button className="auth-link" type="button" onClick={switchMode}>
                {copy.switchLabel}
              </button>
              {!isRegister && (
                <button className="auth-link auth-link--guest" type="button" onClick={() => navigate('/')}>
                  Войти гостем
                </button>
              )}
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AuthPage;
