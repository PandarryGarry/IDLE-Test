import { useGameStore } from '@/store/gameStore';
import { useCombatStore } from '@/store/combatStore';
import { usePlayerStore } from '@/store/playerStore';
import { useInventoryStore } from '@/store/inventoryStore';

/** Stops any in-progress skill/combat activity (used when leaving an account). */
export function stopActiveActivities(): void {
  useGameStore.getState().stopAction();
  useCombatStore.getState().stopCombat();
}

/** Prepares a fresh guest session that cannot inherit a registered user's data. */
export function resetForGuestStart(): void {
  stopActiveActivities();
  usePlayerStore.getState().reset();
  useInventoryStore.getState().reset();
  useCombatStore.getState().reset();
  useGameStore.getState().reset();
}
