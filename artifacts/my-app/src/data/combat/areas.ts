import type { CombatArea } from '../types.ts';

export const COMBAT_AREAS = [
  {
    id: 'farmlands',
    name: 'Дальние фермы',
    monsterIds: ['chicken', 'cow', 'goblin', 'hobgoblin'],
    description: 'Разминка и первые стаи: безопасно изучать таймеры и добивания.',
  },
  {
    id: 'spider_den',
    name: 'Паучье логово',
    monsterIds: ['cave_slime', 'spider', 'giant_spider'],
    combatLevelRequired: 15,
    description: 'Яд, быстрые окна и давление несколькими целями.',
  },
  {
    id: 'undead_graveyard',
    name: 'Старое кладбище',
    monsterIds: ['skeleton', 'bone_archer', 'undead_warrior'],
    combatLevelRequired: 25,
    description: 'Броня, стрелки и тяжёлые удары: пригодится Пробой.',
  },
  {
    id: 'forest',
    name: 'Тёмная чаща',
    monsterIds: ['wolf', 'forest_boar', 'orc_raider'],
    combatLevelRequired: 20,
    description: 'Звери и налётчики атакуют часто: Манёвр ценнее грубой брони.',
  },
  {
    id: 'lava_lake',
    name: 'Лавовый берег',
    monsterIds: ['ash_hound', 'fire_elemental', 'basalt_orc'],
    combatLevelRequired: 80,
    description: 'Высокий входящий урон и длинная вылазка для подготовленного героя.',
  },
  {
    id: 'dragons_lair',
    name: 'Драконья расселина',
    monsterIds: ['green_dragon'],
    combatLevelRequired: 100,
    isDungeon: true,
    description: 'Босс-событие с тяжёлыми телеграфами и окнами реакции.',
  },
] satisfies CombatArea[];
