import type { CatalogItem } from './types.ts';

import { LOGS } from './resources/logs.ts';
import { ORES } from './resources/ores.ts';
import { BARS } from './resources/bars.ts';
import { FISH } from './resources/fish.ts';
import { MINERALS } from './resources/minerals.ts';
import { FORAGE_WOOD } from './foraging/wood.ts';
import { FORAGE_FUNGI } from './foraging/fungi.ts';
import { FORAGE_BITS } from './foraging/bits.ts';

/** Полный каталог предметов (батч 1: ресурсы + «Сбор»). */
export const CATALOG: CatalogItem[] = [
  ...LOGS,
  ...ORES,
  ...BARS,
  ...FISH,
  ...MINERALS,
  ...FORAGE_WOOD,
  ...FORAGE_FUNGI,
  ...FORAGE_BITS,
];

/** Версия каталога — фундамент миграции на БД (§8 плана). */
export const CATALOG_VERSION = 1;

/** Сводка по семействам — для админ-каталога. */
export const CATALOG_SUMMARY = {
  logs: LOGS.length,
  ores: ORES.length,
  bars: BARS.length,
  rawFish: FISH.length / 2,
  cookedFish: FISH.length / 2,
  minerals: MINERALS.length,
  forageWood: FORAGE_WOOD.length,
  forageFungi: FORAGE_FUNGI.length / 2,
  forageBits: FORAGE_BITS.length,
};
