/**
 * Централизованный реестр иконок для всех профессий и навыков.
 * После раунда 6 в игре один реализованный навык — «Сбор»; легаси-навыки
 * (атака/сила/лесорубство/кузница и т.д.) удалены и сюда не возвращаются.
 */

export const SKILL_IMAGES: Record<string, string> = {
  // Будет заполнено готовыми файлами из public/assets/skills/
};

export const SKILL_ICONS: Record<string, string> = {
  gathering: '🌿',
  foraging: '🌿',
};

export const SKILL_SHORT_NAMES: Record<string, string> = {
  gathering: 'Сбор',
  foraging: 'Сбор',
};

export function getSkillVisual(skillId: string): { type: 'image' | 'emoji'; value: string } {
  if (SKILL_IMAGES[skillId]) {
    return { type: 'image', value: SKILL_IMAGES[skillId] };
  }
  return { type: 'emoji', value: SKILL_ICONS[skillId] || '🌿' };
}

export function getSkillShortName(skillId: string): string {
  return SKILL_SHORT_NAMES[skillId] || skillId;
}
