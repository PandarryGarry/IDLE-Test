import type { SkillId } from '@/data/types';

/**
 * Канонические русские названия навыков/профессий.
 * Используются в шапках навыков, сайдбаре и уведомлениях, чтобы
 * пользователь всегда видел понятный русский термин независимо от
 * временного состояния перевода/сохранённой локали.
 */
export const SKILL_NAMES_RU: Record<SkillId, string> = {
  attack: 'Атака',
  strength: 'Сила',
  defence: 'Защита',
  hitpoints: 'Очки здоровья',
  ranged: 'Стрельба',
  magic: 'Магия',
  prayer: 'Молитва',
  slayer: 'Охота на монстров',
  woodcutting: 'Лесорубство',
  fishing: 'Рыбалка',
  firemaking: 'Разжигание огня',
  cooking: 'Кулинария',
  mining: 'Горное дело',
  smithing: 'Кузнечное дело',
  foraging: 'Сбор',
  thieving: 'Воровство',
  fletching: 'Изготовление стрел',
  crafting: 'Крафт',
  runecrafting: 'Руны',
  herblore: 'Травничество',
  farming: 'Фермерство',
  agility: 'Ловкость',
  summoning: 'Призыв',
  astrology: 'Астрология',
  township: 'Поселение',
};

export function skillNameRu(skillId: SkillId): string {
  return SKILL_NAMES_RU[skillId] ?? skillId;
}
