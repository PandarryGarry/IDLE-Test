import type { SkillId } from '@/data/types';

/**
 * Канонические русские названия навыков/профессий.
 * Сейчас в игре один навык — «Сбор». Всё остальное (боевые навыки,
 * старые ремёсла) — пережитки прошлой модели и удалено.
 */
export const SKILL_NAMES_RU: Record<SkillId, string> = {
  foraging: 'Сбор',
};

export function skillNameRu(skillId: SkillId): string {
  return SKILL_NAMES_RU[skillId] ?? skillId;
}
