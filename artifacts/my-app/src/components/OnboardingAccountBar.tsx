import { useState } from 'react';
import { useLocation } from 'wouter';
import { GButton } from '@/shared/ui/gameUI';
import { useAuthStore } from '@/store/authStore';
import { leaveAccount } from '@/lib/authActions';

/** Выход с экранов правил / создания / выбора — иначе застрявший игрок не сменит аккаунт. */
export function OnboardingAccountBar() {
  const [, navigate] = useLocation();
  const email = useAuthStore(s => s.user?.email ?? null);
  const [busy, setBusy] = useState(false);

  const handleLeave = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await leaveAccount();
      navigate('/login');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="onboarding-account-bar">
      {email ? <span className="onboarding-account-bar__email">{email}</span> : null}
      <GButton variant="ghost" size="sm" disabled={busy} onClick={() => void handleLeave()}>
        {busy ? 'Выходим…' : 'Сменить аккаунт'}
      </GButton>
    </div>
  );
}

export default OnboardingAccountBar;
