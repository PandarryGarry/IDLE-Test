import { useState, type CSSProperties } from 'react';
import { useLocation } from 'wouter';
import { GPanel, GButton, GDivider, GBadge } from '@/shared/ui/gameUI';
import { RULES, RULES_VERSION, writeLocalRulesAccepted } from '@/data/rules';
import { useAuthStore } from '@/store/authStore';
import { useCharacterStore } from '@/store/characterStore';
import { OnboardingScene } from '@/components/OnboardingScene';

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
      const hasAny = characters.some(character => !character.isDeleted);
      navigate(hasAny ? '/select-character' : '/create-character');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OnboardingScene variant="rules" ariaLabel="Правила Aethelia">
      <div className="rules-layout">
        <GPanel
          variant="gold"
          className="rules-panel"
          style={{ background: 'var(--onboarding-panel)', border: '1px solid var(--onboarding-panel-edge)', boxShadow: 'var(--onboarding-panel-shadow)' }}
        >
          <header className="rules-panel__header">
            <span className="onboarding-eyebrow">ПЕРЕД ПУТЁМ</span>
            <span className="rules-panel__sigil" aria-hidden="true">✦</span>
            <h1>Правила Aethelia</h1>
            <p>Прочитайте их один раз — и таверна откроет вам дорогу дальше.</p>
          </header>

          <div className="rules-list">
            {RULES.map((rule, index) => (
              <article key={rule.title} className="rules-card" style={{ '--rule-index': index } as CSSProperties}>
                <span className="rules-card__icon" aria-hidden="true">{rule.icon}</span>
                <div>
                  <h2>{rule.title}</h2>
                  <p>{rule.text}</p>
                </div>
              </article>
            ))}
          </div>

          <GDivider label={`Версия правил v${RULES_VERSION}`} icon="✦" />

          <label className={`rules-accept${accepted ? ' is-accepted' : ''}`}>
            <input
              type="checkbox"
              checked={accepted}
              onChange={event => setAccepted(event.target.checked)}
            />
            <span>Я принимаю правила проекта</span>
          </label>

          <div className="rules-panel__action">
            <GButton variant="primary" size="md" fullWidth disabled={!accepted || submitting} onClick={() => void handleContinue()}>
              {submitting ? 'Открываем путь…' : 'Продолжить'}
            </GButton>
          </div>

          <div className="rules-panel__footer">
            <GBadge variant="gray" size="sm">При обновлении правил мы попросим принять их снова</GBadge>
          </div>
        </GPanel>
      </div>
    </OnboardingScene>
  );
}

export default RulesPage;
