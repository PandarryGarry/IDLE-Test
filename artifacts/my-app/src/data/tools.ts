import type { SkillId } from './types';

export interface Tool {
  id: string;
  name: string;
  skillId: SkillId;
  tier: number;
  levelRequired: number;
  speedBonus: number;   // % бонус скорости
  durability: number;   // максимальная прочность
  icon: string;
  description?: string;
}

function T(
  skillId: SkillId, icon: string, tier: number, name: string,
  levelRequired: number, speedBonus: number, durability: number,
): Tool {
  return { id: `${skillId}_tool_t${tier}`, skillId, icon, tier, name, levelRequired, speedBonus, durability };
}

export const TOOLS: Tool[] = [
  // Woodcutting — топоры
  T('woodcutting', '🪓', 1, 'Медный топор',     1,  0,  100),
  T('woodcutting', '🪓', 2, 'Бронзовый топор',   15, 5,  150),
  T('woodcutting', '🪓', 3, 'Железный топор',   30, 10, 200),
  T('woodcutting', '🪓', 4, 'Стальной топор',   50, 20, 300),
  T('woodcutting', '🪓', 5, 'Мифриловый топор', 75, 30, 500),

  // Mining — кирки
  T('mining', '⛏️', 1, 'Медная кирка',     1,  0,  100),
  T('mining', '⛏️', 2, 'Бронзовая кирка',   15, 5,  150),
  T('mining', '⛏️', 3, 'Железная кирка',   30, 10, 200),
  T('mining', '⛏️', 4, 'Стальная кирка',   50, 20, 300),
  T('mining', '⛏️', 5, 'Мифриловая кирка', 75, 30, 500),

  // Fishing — удочки
  T('fishing', '🎣', 1, 'Медная удочка',     1,  0,  100),
  T('fishing', '🎣', 2, 'Бронзовая удочка',   15, 5,  150),
  T('fishing', '🎣', 3, 'Железная удочка',   30, 10, 200),
  T('fishing', '🎣', 4, 'Стальная удочка',   50, 20, 300),
  T('fishing', '🎣', 5, 'Мифриловая удочка', 75, 30, 500),

  // Smithing — молоты
  T('smithing', '🔨', 1, 'Медный молот',     1,  0,  100),
  T('smithing', '🔨', 2, 'Бронзовый молот',   15, 5,  150),
  T('smithing', '🔨', 3, 'Железный молот',   30, 10, 200),
  T('smithing', '🔨', 4, 'Стальной молот',   50, 20, 300),
  T('smithing', '🔨', 5, 'Мифриловый молот', 75, 30, 500),

  // Cooking — сковороды
  T('cooking', '🍳', 1, 'Сковорода',            1,  0,  100),
  T('cooking', '🍳', 2, 'Бронзовая сковорода',   15, 5,  150),
  T('cooking', '🍳', 3, 'Железная сковорода',   30, 10, 200),
  T('cooking', '🍳', 4, 'Стальная сковорода',   50, 20, 300),
  T('cooking', '🍳', 5, 'Мифриловая сковорода', 75, 30, 500),

  // Firemaking — кремень
  T('firemaking', '🔥', 1, 'Кремень',            1,  0,  100),
  T('firemaking', '🔥', 2, 'Бронзовый кремень',   15, 5,  150),
  T('firemaking', '🔥', 3, 'Железный кремень',   30, 10, 200),
  T('firemaking', '🔥', 4, 'Стальной кремень',   50, 20, 300),
  T('firemaking', '🔥', 5, 'Мифриловый кремень', 75, 30, 500),
];

export const TOOLS_MAP: Record<string, Tool> = Object.fromEntries(TOOLS.map(t => [t.id, t]));

export function getToolsForSkill(skillId: SkillId): Tool[] {
  return TOOLS.filter(t => t.skillId === skillId).sort((a, b) => a.tier - b.tier);
}

/** Лучший инструмент, доступный на указанном уровне */
export function getToolForLevel(skillId: SkillId, level: number): Tool | undefined {
  const list = getToolsForSkill(skillId).filter(t => t.levelRequired <= level);
  return list[list.length - 1];
}
