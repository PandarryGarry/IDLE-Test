import { RULES_VERSION, readLocalRulesAccepted } from '@/data/rules';
import { useAuthStore } from '@/store/authStore';
import { useCharacterStore } from '@/store/characterStore';

/** Живые (не мягко удалённые) герои в сторе. */
export function hasLiveCharacter(): boolean {
  return useCharacterStore.getState().characters.some(character => !character.isDeleted);
}

export function hasAcceptedCurrentRules(): boolean {
  const { profile, user } = useAuthStore.getState();
  const { acceptedVersion: localRules } = readLocalRulesAccepted(user?.id);
  const acceptedVersion = profile?.rulesVersion || localRules;
  return acceptedVersion === RULES_VERSION;
}

/**
 * Куда вести уже вошедший аккаунт.
 * Герой есть — сразу выбор. Героя нет — правила, затем создание.
 */
export function resolveLoggedInPath(): string {
  if (!hasAcceptedCurrentRules()) return '/rules';
  if (hasLiveCharacter()) return '/select-character';
  return '/create-character';
}
