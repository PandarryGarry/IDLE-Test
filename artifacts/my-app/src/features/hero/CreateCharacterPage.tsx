import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import {
  GButton, GInput, GModal, GBadge, GAvatar, GCard,
} from '@/shared/ui/gameUI';
import {
  RACES, RACE_MAP, getAvatarsForRace, getAvatarPath, prefetchAvatar, getRaceLabel, getRaceBlurb,
  type RaceId,
} from '@/data/characters';
import { PILLARS, PILLAR_IDS, RACE_BODY_CHILD_RU, RACE_PASSIVES } from '@/domain/attributes/attributes';
import { RACE_START_PILLARS, RACE_START_TOTAL, raceTierLabel } from '@/data/balance/races';
import { useCharacterStore } from '@/store/characterStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { OnboardingScene } from '@/components/OnboardingScene';
import { OnboardingAccountBar } from '@/features/auth/OnboardingAccountBar';
import { queueCinematic } from '@/lib/cinematicState';
import { describeCharacterError } from '@/lib/characterErrors';

type CreationStep = 'race' | 'identity';

export function CreateCharacterPage() {
  const [, navigate] = useLocation();
  const createNewCharacter = useCharacterStore(s => s.createNewCharacter);
  const characters = useCharacterStore(s => s.characters);
  const notifyError = useNotificationsStore(s => s.notifyInfo);

  const hasExisting = useMemo(() => characters.some(c => !c.isDeleted), [characters]);

  const [step, setStep] = useState<CreationStep>('race');
  const [selectedRace, setSelectedRace] = useState<RaceId>('human');
  const [avatarId, setAvatarId] = useState<string>('human_male_01');
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const avatars = useMemo(() => getAvatarsForRace(selectedRace), [selectedRace]);
  const race = RACE_MAP[selectedRace] ?? RACES[0];
  const storeError = useCharacterStore(s => s.error);

  useEffect(() => {
    RACES.forEach(candidate => prefetchAvatar(getAvatarsForRace(candidate.id)[0]));
  }, []);

  useEffect(() => {
    avatars.forEach(prefetchAvatar);
  }, [avatars]);

  const handleRaceClick = (raceId: RaceId) => {
    setSelectedRace(raceId);
    // При смене расы сразу показываем первый подходящий облик, ник не трогаем.
    setAvatarId(getAvatarsForRace(raceId)[0]);
    setLocalError(null);
  };

  const performCreate = async (name: string) => {
    setSubmitting(true);
    setLocalError(null);
    try {
      await createNewCharacter({ nickname: name, avatarId, raceId: selectedRace });
      // После того как герой действительно создан, даём истории выйти из таверны.
      queueCinematic('departure-new-hero');
      navigate('/');
    } catch (error) {
      const message = describeCharacterError(error, 'Не удалось создать персонажа.');
      setLocalError(message);
      notifyError(message);
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  };

  const handleSubmit = () => {
    if (submitting) return;
    const name = nickname.trim();
    if (!name) { setLocalError('Введите никнейм персонажа.'); return; }
    if (name.length < 2) { setLocalError('Ник должен быть не короче 2 символов.'); return; }
    if (name.length > 20) { setLocalError('Ник должен быть не длиннее 20 символов.'); return; }

    if (hasExisting) {
      setConfirmOpen(true);
    } else {
      void performCreate(name);
    }
  };

  const continueToIdentity = () => {
    setLocalError(null);
    setStep('identity');
  };

  return (
    <OnboardingScene variant="creation" ariaLabel="Создание персонажа">
      <div className="character-create-layout">
        <section className="character-create-panel" aria-labelledby="character-create-title">
          <header className="character-create-panel__header">
            <span className="onboarding-eyebrow">ЛОЖА ТАВЕРНЫ</span>
            <h1 id="character-create-title">Кем тебя узнает Этелия?</h1>
            <p>
              {step === 'race'
                ? 'Кто ты по крови? Ответь — и наследие станет частью будущего пути.'
                : 'Какое лицо запомнит Этелия — и какое имя она произнесёт?'}
            </p>
            <OnboardingAccountBar />
            <div className="character-create-steps" aria-label={`Шаг ${step === 'race' ? '1' : '2'} из 2`}>
              <span className={step === 'race' ? 'is-active' : 'is-done'}><b>1</b> Наследие</span>
              <i aria-hidden="true" />
              <span className={step === 'identity' ? 'is-active' : ''}><b>2</b> Имя и облик</span>
            </div>
          </header>

          {step === 'race' ? (
            <div className="character-create-section character-create-section--race">
              <div className="character-create-section__label">Кто ты по крови?</div>
              <div className="character-create-race-grid">
                {RACES.map(candidate => {
                  const active = selectedRace === candidate.id;
                  return (
                    <GCard
                      key={candidate.id}
                      className="character-create-race-card"
                      selected={active}
                      onClick={() => handleRaceClick(candidate.id)}
                      style={{ padding: '0.62rem' }}
                    >
                      <GAvatar
                        src={getAvatarPath(getAvatarsForRace(candidate.id)[0])}
                        size={36}
                        borderColor={active ? 'var(--border-accent)' : 'var(--border-light)'}
                        glow={active}
                      />
                      <span className="character-create-race-card__copy">
                        <strong>{getRaceLabel(candidate.id, 'ru')}</strong>
                        <small>{getRaceBlurb(candidate.id, 'ru')}</small>
                      </span>
                    </GCard>
                  );
                })}
              </div>

              <div className="character-create-bonus-card">
                <span className="character-create-bonus-card__label">
                  Тело: {getRaceLabel(selectedRace, 'ru')}
                </span>
                <div className="character-create-bonus-list">
                  {PILLAR_IDS.map(id => {
                    const pillar = PILLARS[id];
                    const value = RACE_START_PILLARS[selectedRace][id];
                    const tier = raceTierLabel(value);
                    const variant = tier === 'strong' ? 'green'
                      : tier === 'good' ? 'blue'
                      : tier === 'weak' ? 'gray'
                      : 'gold';
                    return (
                      <GBadge key={id} variant={variant} size="sm">
                        {pillar.icon} {pillar.nameRu} {value}
                      </GBadge>
                    );
                  })}
                </div>
                <p className="character-create-bonus-card__total">
                  Всего {RACE_START_TOTAL} — поровну у каждого народа. Разный только наклон.
                </p>
                <p>{RACE_BODY_CHILD_RU[selectedRace]}</p>
                <p>
                  Пассив «{RACE_PASSIVES[selectedRace].nameRu}»: {RACE_PASSIVES[selectedRace].childRu}
                  {' '}
                  {RACE_PASSIVES[selectedRace].whenRu}
                </p>
              </div>

              <GButton variant="primary" size="md" fullWidth onClick={continueToIdentity}>
                Выбрать облик
              </GButton>
            </div>
          ) : (
            <div className="character-create-section character-create-section--identity">
              <div className="character-create-section__label">
                Лицо · {getRaceLabel(selectedRace, 'ru')}
              </div>
              <div className="character-create-avatar-grid">
                {avatars.map((candidate, index) => {
                  const active = avatarId === candidate;
                  return (
                    <GCard
                      key={candidate}
                      className="character-create-avatar-card"
                      selected={active}
                      onClick={() => { setAvatarId(candidate); setLocalError(null); }}
                      style={{ padding: '0.48rem' }}
                    >
                      <GAvatar
                        src={getAvatarPath(candidate)}
                        size={48}
                        borderColor={active ? 'var(--border-accent)' : 'var(--border-light)'}
                        glow={active}
                      />
                      <span>Облик {index + 1}</span>
                    </GCard>
                  );
                })}
              </div>

              <div className="character-create-name-field">
                <GInput
                  label="Как тебя будут звать?"
                  placeholder="Имя, которое запомнит Этелия"
                  value={nickname}
                  onChange={value => { setNickname(value); setLocalError(null); }}
                  maxLength={20}
                  icon="✦"
                  autoFocus
                />
              </div>

              <div className="character-create-preview" aria-live="polite">
                <GAvatar src={getAvatarPath(avatarId)} size={62} borderColor="var(--border-accent)" glow />
                <div>
                  <span>Будущий герой</span>
                  <strong>{nickname.trim() || 'Безымянный путник'}</strong>
                  <p>{getRaceLabel(selectedRace, 'ru')} · Уровень 1 · очков столпов пока нет</p>
                </div>
              </div>

              {(localError || storeError) && (
                <p className="character-create-error">⚠ {localError || storeError}</p>
              )}

              {hasExisting && (
                <div className="character-create-replace-warning">
                  <GBadge variant="red">Новый герой заменит текущего после подтверждения</GBadge>
                </div>
              )}

              <div className="character-create-actions">
                <GButton variant="secondary" size="md" onClick={() => setStep('race')}>
                  Назад
                </GButton>
                <GButton variant="primary" size="md" fullWidth disabled={submitting} onClick={handleSubmit}>
                  {submitting ? 'Создаём историю…' : hasExisting ? 'Начать новую историю' : 'Создать героя'}
                </GButton>
              </div>
            </div>
          )}
        </section>
      </div>

      <GModal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Начать новую историю?" width={390}>
        <div className="character-create-confirm">
          <p>
            Новый герой заменит текущего вместе с его инвентарём и прогрессом.
            Донат-валюта останется на аккаунте.
          </p>
          <div>
            <GButton variant="secondary" fullWidth onClick={() => setConfirmOpen(false)}>Остаться с текущим</GButton>
            <GButton variant="danger" fullWidth disabled={submitting} onClick={() => void performCreate(nickname.trim())}>
              {submitting ? '...' : 'Удалить и создать'}
            </GButton>
          </div>
        </div>
      </GModal>
    </OnboardingScene>
  );
}

export default CreateCharacterPage;
