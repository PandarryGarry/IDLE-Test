import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/store/authStore';
import { useCharacterStore } from '@/store/characterStore';
import { GPanel, GButton, GAvatar, GBadge } from '@/shared/ui/gameUI';
import { getAvatarPath, getRaceLabel } from '@/data/characters';
import { formatDuration } from '@/lib/utils';
import { OnboardingScene } from '@/components/OnboardingScene';
import { OnboardingAccountBar } from '@/features/auth/OnboardingAccountBar';
import { queueCinematic } from '@/lib/cinematicState';

export function SelectCharacterPage() {
  const [, navigate] = useLocation();
  const user = useAuthStore(s => s.user);
  const loadCharacters = useCharacterStore(s => s.loadCharacters);
  const characters = useCharacterStore(s => s.characters);
  const selectCharacterById = useCharacterStore(s => s.selectCharacterById);
  const loading = useCharacterStore(s => s.loading);
  const storeError = useCharacterStore(s => s.error);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      void loadCharacters(user.id);
    }
  }, [loadCharacters, user]);

  const liveCharacters = characters.filter(character => !character.isDeleted);
  const hasAny = liveCharacters.length > 0;
  const displayedError = actionError || storeError;

  const handlePlay = async (characterId: string) => {
    if (selectingId) return;
    setSelectingId(characterId);
    setActionError(null);
    try {
      await selectCharacterById(characterId);
      // Экран растворяется в короткой сцене выхода, затем открывается сама игра.
      queueCinematic('departure-returning');
      navigate('/');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Не удалось подготовить героя к пути.');
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <OnboardingScene variant="selection" ariaLabel="Выбор персонажа">
      <div className="character-select-layout">
        <section className="character-select-panel" aria-labelledby="character-select-title">
          <header className="character-select-panel__header">
            <span className="onboarding-eyebrow">У ПОРОГА ТАВЕРНЫ</span>
            <h1 id="character-select-title">Кого ждёт Этелия?</h1>
            <p>Выберите героя — и город снова откроет перед ним свой путь.</p>
            <OnboardingAccountBar />
          </header>

          {loading && (
            <GPanel variant="dark" className="character-select-state" style={{ background: 'var(--onboarding-panel)' }}>
              <span className="character-select-state__spark" aria-hidden="true">✦</span>
              Загрузка историй…
            </GPanel>
          )}

          {displayedError && (
            <GPanel variant="combat" className="character-select-state character-select-state--error">
              ⚠ {displayedError}
            </GPanel>
          )}

          {!loading && hasAny && (
            <div className="character-select-list">
              {liveCharacters.map(character => (
                <GPanel
                  key={character.id}
                  variant="gold"
                  className="character-select-card"
                  style={{ background: 'var(--onboarding-panel)', border: '1px solid var(--onboarding-panel-edge)', boxShadow: 'var(--onboarding-panel-shadow)' }}
                >
                  <div className="character-select-card__hero">
                    <GAvatar
                      src={getAvatarPath(character.avatarId)}
                      size={76}
                      borderColor="var(--border-accent)"
                      glow={character.selected}
                    />
                    <div className="character-select-card__identity">
                      <span>Путник Этелии</span>
                      <strong>{character.nickname}</strong>
                      <p>{getRaceLabel(character.raceId, 'ru')}</p>
                    </div>
                    {character.selected && <GBadge variant="green" size="sm">Активен</GBadge>}
                  </div>

                  <div className="character-select-card__memory">
                    <span>Пройдено вместе</span>
                    <strong>⌛ {formatDuration(character.saveData?.totalPlayTime ?? 0)}</strong>
                  </div>

                  <div className="character-select-card__actions">
                    <GButton
                      variant="primary"
                      fullWidth
                      disabled={Boolean(selectingId)}
                      onClick={() => void handlePlay(character.id)}
                    >
                      {selectingId === character.id ? 'Открываем путь…' : 'Продолжить путь'}
                    </GButton>
                    <GButton variant="ghost" onClick={() => navigate('/create-character')}>
                      Новая история
                    </GButton>
                  </div>
                </GPanel>
              ))}
            </div>
          )}

          {!loading && !hasAny && (
            <GPanel
              variant="dark"
              className="character-select-empty"
              style={{ background: 'var(--onboarding-panel)', border: '1px solid var(--onboarding-panel-edge)' }}
            >
              <span aria-hidden="true">✦</span>
              <strong>Здесь ещё нет истории</strong>
              <p>Создайте первого героя, чтобы сделать шаг в город Этелии.</p>
              <GButton variant="primary" fullWidth onClick={() => navigate('/create-character')}>
                Создать героя
              </GButton>
            </GPanel>
          )}

          {!loading && hasAny && (
            <p className="character-select-note">Новая история заменит текущего героя после подтверждения.</p>
          )}
        </section>
      </div>
    </OnboardingScene>
  );
}

export default SelectCharacterPage;
