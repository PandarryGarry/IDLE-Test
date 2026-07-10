import type { FiremakingLog } from './types';

export const FIREMAKING_LOGS: FiremakingLog[] = [
  { id: 'burn_normal',    name: 'Logs',            levelRequired: 1,  xp: 30,    masteryXp: 3,  interval: 3000, logId: 'normal_logs',   ashId: 'ash' },
  { id: 'burn_oak',       name: 'Oak Logs',        levelRequired: 15, xp: 60,    masteryXp: 4,  interval: 3000, logId: 'oak_logs',      ashId: 'ash' },
  { id: 'burn_willow',    name: 'Willow Logs',     levelRequired: 30, xp: 90,    masteryXp: 5,  interval: 3000, logId: 'willow_logs',   ashId: 'ash' },
  { id: 'burn_teak',      name: 'Teak Logs',       levelRequired: 35, xp: 105,   masteryXp: 5,  interval: 3000, logId: 'teak_logs',     ashId: 'ash' },
  { id: 'burn_maple',     name: 'Maple Logs',      levelRequired: 45, xp: 135,   masteryXp: 6,  interval: 3000, logId: 'maple_logs',    ashId: 'ash' },
  { id: 'burn_mahogany',  name: 'Mahogany Logs',   levelRequired: 55, xp: 165,   masteryXp: 7,  interval: 3000, logId: 'mahogany_logs', ashId: 'ash' },
  { id: 'burn_magic',     name: 'Magic Logs',      levelRequired: 75, xp: 247.5, masteryXp: 8,  interval: 3000, logId: 'magic_logs',    ashId: 'ash' },
  { id: 'burn_redwood',   name: 'Redwood Logs',    levelRequired: 90, xp: 350,   masteryXp: 10, interval: 3000, logId: 'redwood_logs',  ashId: 'ash' },
];

export const FIREMAKING_MAP = Object.fromEntries(FIREMAKING_LOGS.map(l => [l.id, l]));
