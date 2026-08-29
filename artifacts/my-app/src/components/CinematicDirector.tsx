import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCharacterStore } from '@/store/characterStore';
import {
  CINEMATIC_QUEUE_EVENT,
  clearQueuedCinematic,
  getQueuedCinematic,
  hasSeenEntranceCinematic,
  hasSeenFullPrologue,
  markEntranceCinematicSeen,
  markFullPrologueSeen,
  type QueuedCinematic,
} from '@/lib/cinematicState';
import {
  DEPARTURE_NEW_HERO,
  DEPARTURE_RETURNING,
  ENTRANCE_SHORT,
  FULL_PROLOGUE_READY,
  LODGE_CONNECT,
  PROLOGUE_FULL,
  interpolateBeats,
  type StoryBeat,
} from '@/data/onboardingStory';
import { StoryScene } from './StoryScene';

interface CinematicDirectorProps {
  /** SplashScreen уже завершился; до этого поверх него ничего не рисуем. */
  splashComplete: boolean;
  onBusyChange?: (busy: boolean) => void;
  /** Пред-auth история (пролог или короткий вход) закончилась — можно показывать маршруты. */
  onEntranceFinished?: () => void;
}

type ActiveStoryKind = 'prologue' | 'entrance' | QueuedCinematic;

interface ActiveStory {
  kind: ActiveStoryKind;
  beats: StoryBeat[];
}

/**
 * Режиссёр «дороги» героя: решает, какую историю-биты показать.
 *
 * - prologue: полный пролог первому игроку на устройстве (после того, как
 *   владелец утвердит новые арты — см. FULL_PROLOGUE_READY);
 * - entrance: короткий вход (1 бит) при повторном визите незалогиненного;
 * - lodge / departure-*: оверлеи в очередь от страниц rules/create/select.
 */
export function CinematicDirector({
  splashComplete,
  onBusyChange,
  onEntranceFinished,
}: CinematicDirectorProps) {
  const authLoading = useAuthStore((s) => s.loading);
  const hasUser = useAuthStore((s) => Boolean(s.user));
  const isGuest = useAuthStore((s) => s.isGuest);
  const nickname = useCharacterStore((s) => s.activeCharacter?.nickname ?? '');

  const [entranceSeen, setEntranceSeen] = useState(hasSeenEntranceCinematic);
  const [prologueSeen, setPrologueSeen] = useState(hasSeenFullPrologue);
  const [queued, setQueued] = useState<QueuedCinematic | null>(getQueuedCinematic);

  useEffect(() => {
    const handleQueued = () => {
      setQueued(getQueuedCinematic());
    };

    window.addEventListener(CINEMATIC_QUEUE_EVENT, handleQueued);
    return () => window.removeEventListener(CINEMATIC_QUEUE_EVENT, handleQueued);
  }, []);

  const preAuthAllowed =
    splashComplete && !authLoading && !hasUser && !isGuest && !entranceSeen;

  const showFullPrologue = preAuthAllowed && FULL_PROLOGUE_READY && !prologueSeen;
  const showShortEntrance = preAuthAllowed && !showFullPrologue;

  const activeStory: ActiveStory | null = showFullPrologue
    ? { kind: 'prologue', beats: PROLOGUE_FULL }
    : showShortEntrance
      ? { kind: 'entrance', beats: ENTRANCE_SHORT }
      : queued === 'lodge'
        ? { kind: 'lodge', beats: LODGE_CONNECT }
        : queued === 'departure-new-hero'
          ? { kind: 'departure-new-hero', beats: interpolateBeats(DEPARTURE_NEW_HERO, nickname) }
          : queued === 'departure-returning'
            ? { kind: 'departure-returning', beats: interpolateBeats(DEPARTURE_RETURNING, nickname) }
            : null;

  useEffect(() => {
    onBusyChange?.(Boolean(activeStory));
  }, [activeStory, onBusyChange]);

  useEffect(() => () => onBusyChange?.(false), []);

  if (!activeStory) return null;

  const finishStory = () => {
    if (activeStory.kind === 'prologue') {
      markFullPrologueSeen();
      setPrologueSeen(true);
      markEntranceCinematicSeen();
      setEntranceSeen(true);
      onEntranceFinished?.();
      return;
    }

    if (activeStory.kind === 'entrance') {
      markEntranceCinematicSeen();
      setEntranceSeen(true);
      onEntranceFinished?.();
      return;
    }

    clearQueuedCinematic();
    setQueued(null);
  };

  return (
    <StoryScene
      key={activeStory.kind}
      beats={activeStory.beats}
      onComplete={finishStory}
      ariaLabel={activeStory.kind === 'prologue' ? 'Пролог Aethelia' : undefined}
    />
  );
}

export default CinematicDirector;
