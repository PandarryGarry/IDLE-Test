/**
 * Централизованный реестр иконок для всех профессий и навыков.
 * Поддерживает как сгенерированные графические изображения (PNG), так и эмодзи-фоллбэки.
 */

export const SKILL_IMAGES: Record<string, string> = {
  woodcutting: '/assets/images/skills/woodcutting.png',
  mining:      '/assets/images/skills/mining.png',
  fishing:     '/assets/images/skills/fishing.png',
  smithing:    '/assets/images/skills/smithing.png',
  cooking:     '/assets/images/skills/cooking.png',
  firemaking:  '/assets/images/skills/firemaking.png',
  combat:      '/assets/images/skills/combat.png',
  attack:      '/assets/images/skills/combat.png',
};

export const SKILL_ICONS: Record<string, string> = {
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

export function getSkillVisual(skillId: string): { type: 'image' | 'emoji'; value: string } {
  if (SKILL_IMAGES[skillId]) {
    return { type: 'image', value: SKILL_IMAGES[skillId] };
  }
  return { type: 'emoji', value: SKILL_ICONS[skillId] || '❓' };
}

export function getSkillIcon(skillId: string): string {
  return SKILL_ICONS[skillId] || '❓';
}
