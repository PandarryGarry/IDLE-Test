import type { SkillId } from '@/data/types';

export const GUEST_NOTICE = 'Зарегистрируйся, чтобы сохранить прогресс.';

/**
 * Единственный навык — «Сбор». Гостю он доступен как раньше базовые
 * добывающие навыки. Бой для гостя остаётся закрыт.
 */
export const GUEST_ALLOWED_SKILLS: SkillId[] = ['foraging'];

export const GUEST_BLOCKED_PATHS = ['/combat'] as const;

export function isSkillAllowedForGuest(skillId: SkillId): boolean {
  return GUEST_ALLOWED_SKILLS.includes(skillId);
}

export function isGuestBlockedPath(pathname: string): boolean {
  return GUEST_BLOCKED_PATHS.some((path) => pathname === path);
}
