/**
 * Централизованный реестр иконок для всех профессий и навыков.
 * Сюда будут привязаны распакованные арты из ваших архивов.
 */

export const SKILL_IMAGES: Record<string, string> = {
  // Будет заполнено вашими готовыми файлами из public/assets/skills/
};

export const SKILL_ICONS: Record<string, string> = {
  combat: '⚔️',
  attack: '⚔️',
  strength: '💪',
  defence: '🛡️',
  hitpoints: '❤️',
  ranged: '🏹',
  magic: '🧙',
  prayer: '🙏',
  slayer: '💀',
  woodcutting: '🪓',
  fishing: '🎣',
  mining: '⛏️',
  firemaking: '🔥',
  cooking: '🍳',
  smithing: '🔨',
  fletching: '🏹',
  crafting: '✂️',
  runecrafting: '📿',
  herblore: '🌿',
  farming: '🌱',
  agility: '🏃',
  thieving: '🤫',
  summoning: '📜',
  astrology: '⭐',
  township: '🏘️',
};

export const SKILL_SHORT_NAMES: Record<string, string> = {
  combat: 'Бой',
  attack: 'Атака',
  strength: 'Сила',
  defence: 'Защита',
  hitpoints: 'Здоровье',
  ranged: 'Стрельба',
  magic: 'Магия',
  prayer: 'Молитва',
  slayer: 'Истребление',
  woodcutting: 'Лесоруб',
  mining: 'Горное дело',
  fishing: 'Рыбалка',
  firemaking: 'Огонь',
  cooking: 'Кулинария',
  smithing: 'Кузница',
  fletching: 'Стрелы',
  crafting: 'Ремесло',
  runecrafting: 'Руны',
  herblore: 'Травы',
  farming: 'Ферма',
  agility: 'Ловкость',
  thieving: 'Воровство',
  summoning: 'Призыв',
  astrology: 'Звезды',
  township: 'Город',
};

export function getSkillVisual(skillId: string): { type: 'image' | 'emoji'; value: string } {
  if (SKILL_IMAGES[skillId]) {
    return { type: 'image', value: SKILL_IMAGES[skillId] };
  }
  return { type: 'emoji', value: SKILL_ICONS[skillId] || '⚔️' };
}

export function getSkillShortName(skillId: string): string {
  return SKILL_SHORT_NAMES[skillId] || skillId;
}
