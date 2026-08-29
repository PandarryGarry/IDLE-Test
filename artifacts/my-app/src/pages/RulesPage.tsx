import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { GPanel, GButton, GDivider, GBadge } from '@/shared/ui/gameUI';
import { RULES, RULES_VERSION, writeLocalRulesAccepted } from '@/data/rules';
import { useAuthStore } from '@/store/authStore';
import { useCharacterStore } from '@/store/characterStore';

export function RulesPage() {
  const [, navigate] = useLocation();
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const acceptRules = useAuthStore(s => s.acceptRules);
  const characters = useCharacterStore(s => s.characters);

  const handleContinue = async () => {
    if (!accepted || submitting) return;
    setSubmitting(true);
    try {
      writeLocalRulesAccepted(RULES_VERSION);
      await acceptRules(RULES_VERSION);
      // После правил — либо создание персонажа (если его нет), либо выбор.
      const hasAny = characters.some(c => !c.isDeleted);
      navigate(hasAny ? '/select-character' : '/create-character');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center px-3 py-6"
      style={{ background: 'linear-gradient(180deg,#2a1508 0%,#1a0e04 100%)' }}>
      <div style={{ width: 'min(520px, 100%)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <GPanel variant="gold" style={{ padding: 18 }}>
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 34 }}>📜</div>
            <h1 style={{
              fontFamily: 'var(--app-font-display)', fontSize: 22, fontWeight: 900,
              color: 'var(--text-primary)', margin: '4px 0 2px', textShadow: '0 2px 6px rgba(0,0,0,0.5)',
            }}>
              Правила Aethelia
            </h1>
            <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
              Ознакомьтесь и примите условия, чтобы продолжить
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {RULES.map((rule, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-overlay)', border: '1px solid var(--border-default)',
              }}>
                <div style={{ fontSize: 22, lineHeight: 1.2, flexShrink: 0 }}>{rule.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--app-font-display)', fontWeight: 800, fontSize: 13,
                    color: 'var(--text-secondary)', marginBottom: 3,
                  }}>
                    {rule.title}
                  </div>
                  <div style={{ fontFamily: 'var(--app-font-sans)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {rule.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <GDivider label={`Версия правил v${RULES_VERSION}`} icon="🛡️" />

          {/* Галочка принятия */}
          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
            padding: '12px 14px', borderRadius: 'var(--radius-md)',
            background: accepted ? 'rgba(26,158,90,0.12)' : 'var(--bg-overlay)',
            border: `1px solid ${accepted ? 'var(--accent-emerald)' : 'var(--border-default)'}`,
            transition: 'all 0.15s ease', marginTop: 4,
          }}>
            <input
              type="checkbox"
              checked={accepted}
              onChange={e => setAccepted(e.target.checked)}
              style={{
                width: 20, height: 20, accentColor: 'var(--accent-emerald)', marginTop: 1,
                cursor: 'pointer', flexShrink: 0,
              }}
            />
            <span style={{ fontFamily: 'var(--app-font-sans)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5 }}>
              Я принимаю правила проекта
            </span>
          </label>

          <div style={{ marginTop: 16 }}>
            <GButton variant="primary" size="md" fullWidth disabled={!accepted || submitting} onClick={handleContinue}>
              {submitting ? '...' : 'Продолжить'}
            </GButton>
          </div>

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <GBadge variant="gray">Обновление правил попросит принять их заново</GBadge>
          </div>
        </GPanel>
      </div>
    </main>
  );
}

export default RulesPage;
