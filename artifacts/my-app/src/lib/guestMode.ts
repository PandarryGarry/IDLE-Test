import type { SkillId } from '@/data/types';

export const GUEST_NOTICE = 'Зарегистрируйся, чтобы сохранить прогресс.';

export const GUEST_ALLOWED_SKILLS: SkillId[] = ['woodcutting', 'fishing'];

export const GUEST_BLOCKED_PATHS = [
  '/mining',
  '/combat',
  '/cooking',
  '/smithing',
  '/firemaking',
] as const;

export function isSkillAllowedForGuest(skillId: SkillId): boolean {
  return GUEST_ALLOWED_SKILLS.includes(skillId);
}

export function isGuestBlockedPath(pathname: string): boolean {
  return GUEST_BLOCKED_PATHS.some((path) => pathname === path);
}
