import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  CINEMATIC_QUEUE_EVENT,
  clearQueuedCinematic,
  getQueuedCinematic,
  hasSeenEntranceCinematic,
  markEntranceCinematicSeen,
  type QueuedCinematic,
} from "@/lib/cinematicState";
import { CinematicScene, type CinematicSceneId } from "./CinematicScene";

interface CinematicDirectorProps {
  /** SplashScreen уже завершился; до этого поверх него ничего не рисуем. */
  splashComplete: boolean;
  onBusyChange?: (busy: boolean) => void;
  /** Входная катсцена закончилась — можно показывать маршруты (auth). */
  onEntranceFinished?: () => void;
}

/**
 * Режиссёр коротких перебивок между крупными шагами пути.
 *
 * - entrance: только раз за вкладку, после splash и перед auth у незалогиненного;
 * - departure: приходит в очередь после создания/выбора героя.
 */
export function CinematicDirector({
  splashComplete,
  onBusyChange,
  onEntranceFinished,
}: CinematicDirectorProps) {
  const authLoading = useAuthStore((s) => s.loading);
  const hasUser = useAuthStore((s) => Boolean(s.user));
  const isGuest = useAuthStore((s) => s.isGuest);

  const [entranceSeen, setEntranceSeen] = useState(hasSeenEntranceCinematic);
  const [queued, setQueued] = useState<QueuedCinematic | null>(
    getQueuedCinematic,
  );

  useEffect(() => {
    const handleQueued = (event: Event) => {
      const scene = (event as CustomEvent<QueuedCinematic>).detail;
      setQueued(scene === "departure" ? scene : getQueuedCinematic());
    };

    window.addEventListener(CINEMATIC_QUEUE_EVENT, handleQueued);
    setQueued(getQueuedCinematic());
    return () =>
      window.removeEventListener(CINEMATIC_QUEUE_EVENT, handleQueued);
  }, []);

  const shouldShowEntrance =
    splashComplete && !authLoading && !hasUser && !isGuest && !entranceSeen;

  const activeScene: CinematicSceneId | null = shouldShowEntrance
    ? "entrance"
    : splashComplete && queued === "departure"
      ? "departure"
      : null;

  useEffect(() => {
    onBusyChange?.(Boolean(activeScene));
  }, [activeScene, onBusyChange]);

  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);

  if (!activeScene) return null;

  const finishScene = () => {
    if (activeScene === "entrance") {
      markEntranceCinematicSeen();
      setEntranceSeen(true);
      onEntranceFinished?.();
      return;
    }

    clearQueuedCinematic();
    setQueued(null);
  };

  return (
    <CinematicScene
      key={activeScene}
      scene={activeScene}
      onComplete={finishScene}
    />
  );
}

export default CinematicDirector;
