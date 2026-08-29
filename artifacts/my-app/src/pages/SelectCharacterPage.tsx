import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/store/authStore';
import { useCharacterStore } from '@/store/characterStore';
import { GPanel, GButton, GAvatar, GBadge } from '@/shared/ui/gameUI';
import { getAvatarPath, getRaceLabel } from '@/data/characters';
import { formatDuration } from '@/lib/utils';

export function SelectCharacterPage() {
  const [, navigate] = useLocation();
  const user = useAuthStore(s => s.user);
  const loadCharacters = useCharacterStore(s => s.loadCharacters);
  const characters = useCharacterStore(s => s.characters);
  const selectCharacterById = useCharacterStore(s => s.selectCharacterById);
  const loading = useCharacterStore(s => s.loading);
  const error = useCharacterStore(s => s.error);

  useEffect(() => {
    if (user) {
      void loadCharacters(user.id);
    }
  }, [user]);

  const hasAny = characters.some(c => !c.isDeleted);

  const handlePlay = async (characterId: string) => {
    await selectCharacterById(characterId);
    navigate('/');
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center px-3 py-6"
      style={{
        background:
          'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%), url(/assets/art/auth_tavern_background.webp) center / cover no-repeat',
      }}>
      <div style={{ width: 'min(540px, 100%)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <GPanel variant="gold" style={{ padding: '16px 18px', background: 'rgba(30,18,8,0.88)' }}>
          <h1 style={{
            fontFamily: 'var(--app-font-display)', fontSize: 22, fontWeight: 900,
            color: 'var(--text-primary)', margin: 0, textShadow: '0 2px 6px rgba(0,0,0,0.5)',
          }}>
            Выбор персонажа
          </h1>
          <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
            Выберите, за кого хотите играть
          </div>
        </GPanel>

        {loading && (
          <GPanel variant="plain" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
              Загрузка персонажей...
            </div>
          </GPanel>
        )}

        {error && (
          <GPanel variant="combat" style={{ padding: 12 }}>
            <div style={{ fontFamily: 'var(--app-font-sans)', fontSize: 12, color: '#ff8060' }}>⚠ {error}</div>
          </GPanel>
        )}

        {!loading && hasAny && (
          characters.filter(c => !c.isDeleted).map(character => (
            <GPanel key={character.id} variant="gold" style={{ background: 'rgba(30,18,8,0.86)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <GAvatar src={getAvatarPath(character.avatarId)} size={72} borderColor="var(--border-accent)" glow={character.selected} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontFamily: 'var(--app-font-display)', fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {character.nickname}
                  </div>
                  <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                    {getRaceLabel(character.raceId, 'ru')}
                  </div>
                  <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: 10, color: 'var(--text-dim, #8b6030)', marginTop: 2 }}>
                    ⏱ Играет: {formatDuration(character.saveData?.totalPlayTime ?? 0)}
                  </div>
                </div>
                {character.selected && <GBadge variant="green">Активен</GBadge>}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <GButton variant="primary" fullWidth onClick={() => handlePlay(character.id)}>
                  Играть за этого персонажа
                </GButton>
                <GButton variant="secondary" onClick={() => navigate('/create-character')}>
                  Создать нового
                </GButton>
              </div>
            </GPanel>
          ))
        )}

        {!loading && !hasAny && (
          <GPanel variant="plain" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🛡️</div>
            <div style={{ fontFamily: 'var(--app-font-display)', fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>
              У вас пока нет персонажа
            </div>
            <div style={{ fontFamily: 'var(--app-font-sans)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Создайте первого героя, чтобы начать путешествие по Этелии.
            </div>
            <GButton variant="primary" fullWidth onClick={() => navigate('/create-character')}>
              Создать персонажа
            </GButton>
          </GPanel>
        )}

        {/* Подсказка про переключение */}
        <div style={{ textAlign: 'center' }}>
          <GBadge variant="gray">Создание нового персонажа удаляет текущего</GBadge>
        </div>
      </div>
    </main>
  );
}

export default SelectCharacterPage;
