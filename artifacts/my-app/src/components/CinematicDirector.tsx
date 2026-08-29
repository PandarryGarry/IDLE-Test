import { useEffect, useState } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import {
  CINEMATIC_QUEUE_EVENT,
  clearQueuedCinematic,
  getQueuedCinematic,
  type QueuedCinematic,
} from '@/lib/cinematicState';
import {
  DEPARTURE_NEW_HERO,
  DEPARTURE_RETURNING,
  LODGE_CONNECT,
  interpolateBeats,
  type StoryBeat,
} from '@/data/onboardingStory';
import { StoryScene } from './StoryScene';

interface CinematicDirectorProps {
  onBusyChange?: (busy: boolean) => void;
}

/**
 * Режиссёр оверлейных историй «дороги»:
 *
 * - lodge: связка «трактирщик приводит в ложу» после принятия правил;
 * - departure-new-hero: 3 бита с именем героя после создания персонажа;
 * - departure-returning: короткий выход после выбора персонажа.
 *
 * Пролог первого запуска живёт ДО заставки (FirstLaunchIntro) и здесь
 * не участвует.
 */
export function CinematicDirector({ onBusyChange }: CinematicDirectorProps) {
  const nickname = useCharacterStore((s) => s.activeCharacter?.nickname ?? '');

  const [queued, setQueued] = useState<QueuedCinematic | null>(getQueuedCinematic);

  useEffect(() => {
    const handleQueued = () => {
      setQueued(getQueuedCinematic());
    };

    window.addEventListener(CINEMATIC_QUEUE_EVENT, handleQueued);
    return () => window.removeEventListener(CINEMATIC_QUEUE_EVENT, handleQueued);
  }, []);

  const activeBeats: StoryBeat[] | null =
    queued === 'lodge'
      ? LODGE_CONNECT
      : queued === 'departure-new-hero'
        ? interpolateBeats(DEPARTURE_NEW_HERO, nickname)
        : queued === 'departure-returning'
          ? interpolateBeats(DEPARTURE_RETURNING, nickname)
          : null;

  useEffect(() => {
    onBusyChange?.(Boolean(activeBeats));
  }, [activeBeats, onBusyChange]);

  useEffect(() => () => onBusyChange?.(false), []);

  if (!activeBeats) return null;

  const finishStory = () => {
    clearQueuedCinematic();
    setQueued(null);
  };

  return (
    <StoryScene
      key={queued}
      beats={activeBeats}
      onComplete={finishStory}
    />
  );
}

export default CinematicDirector;
