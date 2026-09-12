import type { Monster } from '../../types.ts';

export const DRAGONS_LAIR_MONSTERS = [
  {
    id: 'green_dragon',
    name: 'Зелёный дракон',
    areaId: 'dragons_lair',
    description: 'Молодой дракон из влажной расселины. Это тестовый босс с фазами: дыхание, ярость, стойка чешуи и тяжёлые окна.',
    iconPath: 'characters/animals/animal_11_crocodile',
    role: 'boss',
    traits: ['boss', 'elite', 'armored', 'venom'],
    intentCycle: ['heavy', 'enrage', 'strike', 'guard', 'venom'],
    abilities: [
      {
        id: 'viridian-breath',
        name: 'Зелёное дыхание',
        description: 'Тяжёлый телеграф с большим уроном. В фазах 2–3 становится опаснее.',
        intent: 'heavy',
        counterplay: 'Держите Щит под дыхание, а не под обычный удар.',
      },
      {
        id: 'scale-guard',
        name: 'Чешуйчатая стойка',
        description: 'Дракон закрывается крылом и резко повышает броню.',
        intent: 'guard',
        counterplay: 'Пробой и фокус «Броня» сокращают окно стойки.',
      },
      {
        id: 'toxic-snap',
        name: 'Ядовитый рывок',
        description: 'Ядовитое окно, которое наказывает героя без еды.',
        intent: 'venom',
        counterplay: 'Авто-еда и осторожная стратегия дают запас на ошибку.',
      },
    ],
    maxHp: 500, attackLevel: 80, strengthLevel: 80, defenceLevel: 65,
    attackBonus: 65, strengthBonus: 60, defenceBonus: 60,
    maxHit: 50, attackInterval: 3000,
    combatLevel: 130,
    drops: [
      { itemId: 'leather_scaled', chance: 1.0, quantity: [1, 3] },
      { itemId: 'bar_orichalcum', chance: 0.1, quantity: [1, 1] },
      { itemId: 'gear_sword_1h_t12', chance: 0.01, quantity: [1, 1] },
      { itemId: 'gear_plate_chest_t11', chance: 0.05, quantity: [1, 1] },
    ],
    gpDrop: [500, 2000],
    isBoss: true,
  },
] satisfies Monster[];
