import { useGameStore } from '@/store/gameStore';
import { useCombatStore } from '@/store/combatStore';
import { usePlayerStore } from '@/store/playerStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useAuthStore } from '@/store/authStore';
import { useCharacterStore } from '@/store/characterStore';

/** Stops any in-progress skill/combat activity (used when leaving an account). */
export function stopActiveActivities(): void {
  useGameStore.getState().stopAction();
  useCombatStore.getState().stopCombat();
}

/** Выход с онбординга или из сломанного экрана — стор персонажей тоже чистим. */
export async function leaveAccount(): Promise<void> {
  stopActiveActivities();
  try {
    await useAuthStore.getState().signOut();
  } catch (error) {
    console.warn('leaveAccount signOut failed:', error);
  }
  useCharacterStore.getState().clear();
}

/** Prepares a fresh guest session that cannot inherit a registered user's data. */
export function resetForGuestStart(): void {
  stopActiveActivities();
  usePlayerStore.getState().reset();
  useInventoryStore.getState().reset();
  useCombatStore.getState().reset();
  useGameStore.getState().reset();
}
