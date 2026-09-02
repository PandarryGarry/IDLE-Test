import {
  Component,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { describeCaughtRenderError } from '@/lib/characterErrors';
import { leaveAccount } from '@/lib/authActions';

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent?: ComponentType<ErrorFallbackProps>;
  /** Changing this clears a caught error. Pass the route to recover on navigation. */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  error: Error | null;
}

function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }
  if (typeof value === 'string') {
    return new Error(value);
  }
  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error(String(value));
  }
}

function DefaultFallback({ error, resetError }: ErrorFallbackProps) {
  const friendly = describeCaughtRenderError(error);

  const handleLeave = () => {
    void leaveAccount().finally(() => {
      window.location.assign('/login');
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: 'var(--bg-header)' }}>
      <div className="max-w-lg w-full text-center">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--app-font-display)' }}>
          Экран не открылся
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          {friendly}
        </p>
        {import.meta.env.DEV ? (
          <pre className="mt-4 overflow-x-auto rounded p-3 text-left text-xs" style={{ background: 'rgba(0,0,0,0.35)', color: 'var(--text-muted)' }}>
            {error.message || String(error)}
          </pre>
        ) : null}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={resetError}
            className="rounded px-4 py-2 text-sm"
            style={{ background: 'var(--accent-gold)', color: 'var(--text-white)' }}
          >
            Попробовать снова
          </button>
          <button
            type="button"
            onClick={handleLeave}
            className="rounded px-4 py-2 text-sm"
            style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}
          >
            Сменить аккаунт
          </button>
        </div>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: toError(error) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error(
      'ErrorBoundary caught an error:',
      toError(error),
      info.componentStack,
    );
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (
      this.state.error !== null &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.resetError();
    }
  }

  resetError = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error === null) {
      return this.props.children;
    }
    const Fallback = this.props.FallbackComponent ?? DefaultFallback;
    return <Fallback error={error} resetError={this.resetError} />;
  }
}
