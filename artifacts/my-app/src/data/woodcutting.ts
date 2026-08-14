import type { WoodcuttingTree } from './types';

export const TREES: WoodcuttingTree[] = [
  { id: 'normal_tree',    name: 'Tree',           icon: '🌳', levelRequired: 1,   xp: 25,   masteryXp: 3,   interval: 3000,  logId: 'normal_logs',   quantity: [1, 1] },
  { id: 'oak_tree',       name: 'Oak Tree',       icon: '🌲', levelRequired: 15,  xp: 37.5, masteryXp: 4,   interval: 4000,  logId: 'oak_logs',      quantity: [1, 1] },
  { id: 'willow_tree',    name: 'Willow Tree',    icon: '🎋', levelRequired: 30,  xp: 56.5, masteryXp: 5,   interval: 5000,  logId: 'willow_logs',   quantity: [1, 1] },
  { id: 'teak_tree',      name: 'Teak Tree',      icon: '🌴', levelRequired: 35,  xp: 62,   masteryXp: 6,   interval: 5000,  logId: 'teak_logs',     quantity: [1, 1] },
  { id: 'maple_tree',     name: 'Maple Tree',     icon: '🍁', levelRequired: 45,  xp: 100,  masteryXp: 7,   interval: 5000,  logId: 'maple_logs',    quantity: [1, 1] },
  { id: 'mahogany_tree',  name: 'Mahogany Tree',  icon: '🎍', levelRequired: 55,  xp: 155,  masteryXp: 8,   interval: 5000,  logId: 'mahogany_logs', quantity: [1, 1] },
  { id: 'magic_tree',     name: 'Magic Tree',     icon: '🎄', levelRequired: 75,  xp: 250,  masteryXp: 9,   interval: 7000,  logId: 'magic_logs',    quantity: [1, 1] },
  { id: 'redwood_tree',   name: 'Redwood Tree',   icon: '🌲', levelRequired: 90,  xp: 350,  masteryXp: 10,  interval: 8000,  logId: 'redwood_logs',  quantity: [1, 2] },
];

export const WOODCUTTING_TREES_MAP = Object.fromEntries(TREES.map(t => [t.id, t]));
