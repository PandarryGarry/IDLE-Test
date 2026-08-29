import React, { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import {
  GPanel, GButton, GInput, GModal, GDivider, GBadge, GAvatar, GCard,
} from '@/shared/ui/gameUI';
import {
  RACES, RACE_MAP, getAvatarsForRace, getAvatarPath, getRaceLabel, getRaceBlurb,
  STAT_LABELS_RU, type RaceId,
} from '@/data/characters';
import { useCharacterStore } from '@/store/characterStore';
import { useNotificationsStore } from '@/store/notificationsStore';

export function CreateCharacterPage() {
  const [, navigate] = useLocation();
  const createNewCharacter = useCharacterStore(s => s.createNewCharacter);
  const characters = useCharacterStore(s => s.characters);
  const notifyError = useNotificationsStore(s => s.notifyInfo);

  const hasExisting = useMemo(() => characters.some(c => !c.isDeleted), [characters]);

  const [selectedRace, setSelectedRace] = useState<RaceId>('human');
  const [avatarId, setAvatarId] = useState<string>('human_male_01');
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const avatars = useMemo(() => getAvatarsForRace(selectedRace), [selectedRace]);

  const handleRaceClick = (raceId: RaceId) => {
    setSelectedRace(raceId);
    // авто-выбираем первый аватар новой расы
    setAvatarId(getAvatarsForRace(raceId)[0]);
    setLocalError(null);
  };

  const performCreate = async (name: string) => {
    setSubmitting(true);
    setLocalError(null);
    try {
      await createNewCharacter({ nickname: name, avatarId, raceId: selectedRace });
      navigate('/');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Не удалось создать персонажа.';
      setLocalError(msg);
      notifyError(msg);
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

  const confirmDelete = () => {
    void performCreate(nickname.trim());
  };

  const race = RACE_MAP[selectedRace];

  return (
    <main className="min-h-screen w-full flex items-start justify-center px-3 py-6 overflow-y-auto"
      style={{ background: 'linear-gradient(180deg,#2a1508 0%,#1a0e04 100%)' }}>
      <div style={{ width: 'min(560px, 100%)', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Заголовок */}
        <GPanel variant="gold" style={{ padding: '16px 18px' }}>
          <h1 style={{
            fontFamily: 'var(--app-font-display)', fontSize: 22, fontWeight: 900,
            color: 'var(--text-primary)', margin: 0, textShadow: '0 2px 6px rgba(0,0,0,0.5)',
          }}>
            Создание персонажа
          </h1>
          <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
            Шаг 1 из 2: выберите расу
          </div>
        </GPanel>

        {/* Шаг 1: раса */}
        <GPanel variant="plain" style={{ padding: 14 }}>
          <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim, #8b6030)', marginBottom: 10 }}>
            Раса
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            {RACES.map(r => {
              const isActive = selectedRace === r.id;
              return (
                <GCard key={r.id} selected={isActive} onClick={() => handleRaceClick(r.id)} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{r.id === 'human' ? '🧑' : r.id === 'elf' ? '🧝' : r.id === 'dwarf' ? '🧔' : r.id === 'orc' ? '👹' : '🐺'}</span>
                    <span style={{ fontFamily: 'var(--app-font-display)', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>
                      {getRaceLabel(r.id, 'ru')}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--app-font-sans)', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {getRaceBlurb(r.id, 'ru')}
                  </div>
                </GCard>
              );
            })}
          </div>
        </GPanel>

        {/* Бонусы выбранной расы */}
        <GPanel variant="dark" style={{ padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--app-font-display)', fontWeight: 800, fontSize: 13, color: 'var(--text-secondary)' }}>
              Бонусы расы: {getRaceLabel(selectedRace, 'ru')}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {race.bonuses.map((b, i) => (
              <GBadge key={i} variant={b.positive ? 'green' : 'red'} size="md">
                {b.positive ? '+' : '−'}{b.value} {STAT_LABELS_RU[b.stat]}
              </GBadge>
            ))}
          </div>
        </GPanel>

        {/* Шаг 2: аватар */}
        <GPanel variant="plain" style={{ padding: 14 }}>
          <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim, #8b6030)', marginBottom: 10 }}>
            Аватар — {getRaceLabel(selectedRace, 'ru')} ({avatars.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10 }}>
            {avatars.map(aid => (
              <GCard key={aid} selected={avatarId === aid} hoverEffect={!hasExisting} onClick={() => { setAvatarId(aid); setLocalError(null); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 10 }}>
                <GAvatar src={getAvatarPath(aid)} size={56} borderColor={avatarId === aid ? 'var(--border-accent)' : 'var(--border-default)'} glow={avatarId === aid} />
                <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>
                  {aid.split('_').slice(1).join(' ')}
                </span>
              </GCard>
            ))}
          </div>
        </GPanel>

        {/* Ник */}
        <GPanel variant="plain" style={{ padding: 14 }}>
          <GInput
            label="Никнейм персонажа"
            placeholder="Введите имя героя"
            value={nickname}
            onChange={v => { setNickname(v); setLocalError(null); }}
            maxLength={20}
            icon="♙"
            autoFocus
          />
          {localError && (
            <div style={{ marginTop: 8, fontFamily: 'var(--app-font-mono)', fontSize: 11, color: '#ff7060' }}>
              ⚠ {localError}
            </div>
          )}
        </GPanel>

        {/* Превью */}
        <GPanel variant="gold" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <GAvatar src={getAvatarPath(avatarId)} size={64} borderColor="var(--border-accent)" glow />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--app-font-display)', fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {nickname.trim() || '…'}
              </div>
              <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {getRaceLabel(selectedRace, 'ru')} • Ур. 1 • ❤ 10
              </div>
            </div>
          </div>
        </GPanel>

        <GButton variant="primary" size="lg" fullWidth disabled={submitting} onClick={handleSubmit}>
          {submitting ? '...' : hasExisting ? 'Создать нового (удалить старого)' : 'Создать персонажа'}
        </GButton>

        {hasExisting && (
          <div style={{ textAlign: 'center' }}>
            <GBadge variant="red">⚠ При создании нового — старый персонаж будет удалён навсегда</GBadge>
          </div>
        )}
      </div>

      {/* Двойное подтверждение удаления старого */}
      <GModal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="⚠ Удалить старого персонажа?" width={380}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontFamily: 'var(--app-font-sans)', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
            Создание нового персонажа <b>безвозвратно удалит</b> текущего персонажа со всем его инвентарём и прогрессом.
            Донат-валюта на аккаунте не будет затронута.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <GButton variant="secondary" fullWidth onClick={() => setConfirmOpen(false)}>Отмена</GButton>
            <GButton variant="danger" fullWidth disabled={submitting} onClick={confirmDelete}>
              {submitting ? '...' : 'Удалить и создать'}
            </GButton>
          </div>
        </div>
      </GModal>
    </main>
  );
}

export default CreateCharacterPage;
