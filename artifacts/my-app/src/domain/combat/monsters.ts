import type { Monster, CombatArea } from '../../data/types.ts';
import { COMBAT_AREAS as AREA_DEFINITIONS } from '../../data/combat/areas.ts';
import { FARMLANDS_MONSTERS } from '../../data/combat/mobs/farmlands.ts';
import { SPIDER_DEN_MONSTERS } from '../../data/combat/mobs/spiderDen.ts';
import { GRAVEYARD_MONSTERS } from '../../data/combat/mobs/graveyard.ts';
import { FOREST_MONSTERS } from '../../data/combat/mobs/forest.ts';
import { LAVA_LAKE_MONSTERS } from '../../data/combat/mobs/lavaLake.ts';
import { DRAGONS_LAIR_MONSTERS } from '../../data/combat/mobs/dragonsLair.ts';

/**
 * Фасад боевого каталога.
 *
 * Сами мобы живут отдельными файлами в `src/data/combat/mobs/*`: у каждого есть
 * характеристики, картинка, описание, способности, теги поведения и цикл
 * телеграфов. Здесь только сборка индексов для store/UI — без хардкода логики
 * «если id содержит spider».
 */
export const MONSTERS: Monster[] = [
  ...FARMLANDS_MONSTERS,
  ...SPIDER_DEN_MONSTERS,
  ...GRAVEYARD_MONSTERS,
  ...FOREST_MONSTERS,
  ...LAVA_LAKE_MONSTERS,
  ...DRAGONS_LAIR_MONSTERS,
];

export const COMBAT_AREAS: CombatArea[] = [...AREA_DEFINITIONS];

export const MONSTERS_MAP = Object.fromEntries(MONSTERS.map(m => [m.id, m])) as Record<string, Monster>;
export const AREAS_MAP = Object.fromEntries(COMBAT_AREAS.map(a => [a.id, a])) as Record<string, CombatArea>;

export const MONSTER_FALLBACK_ICON = 'characters/mobs/mob_goblin';

export function monsterIconPath(monsterIdOrMonster: string | Monster | null | undefined): string {
  if (!monsterIdOrMonster) return MONSTER_FALLBACK_ICON;
  const monster = typeof monsterIdOrMonster === 'string'
    ? MONSTERS_MAP[monsterIdOrMonster]
    : monsterIdOrMonster;
  return monster?.iconPath ?? MONSTER_FALLBACK_ICON;
}
