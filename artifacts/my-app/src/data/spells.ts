import type { Spell } from './types';

export const SPELLS: Spell[] = [
  // Standard
  { id: 'wind_strike',    name: 'Wind Strike',    levelRequired: 1,  runes: [{ runeId: 'air_rune', qty: 1 },   { runeId: 'mind_rune', qty: 1 }],                                             baseMaxHit: 2,  xpPerCast: 5.5,  element: 'air'   },
  { id: 'water_strike',   name: 'Water Strike',   levelRequired: 5,  runes: [{ runeId: 'water_rune', qty: 1 }, { runeId: 'air_rune', qty: 1 }, { runeId: 'mind_rune', qty: 1 }],             baseMaxHit: 4,  xpPerCast: 7.5,  element: 'water' },
  { id: 'earth_strike',   name: 'Earth Strike',   levelRequired: 9,  runes: [{ runeId: 'earth_rune', qty: 2 }, { runeId: 'air_rune', qty: 1 }, { runeId: 'mind_rune', qty: 1 }],             baseMaxHit: 6,  xpPerCast: 9.5,  element: 'earth' },
  { id: 'fire_strike',    name: 'Fire Strike',    levelRequired: 13, runes: [{ runeId: 'fire_rune', qty: 3 },  { runeId: 'air_rune', qty: 2 }, { runeId: 'mind_rune', qty: 1 }],             baseMaxHit: 8,  xpPerCast: 11.5, element: 'fire'  },
  { id: 'wind_bolt',      name: 'Wind Bolt',      levelRequired: 17, runes: [{ runeId: 'air_rune', qty: 2 },   { runeId: 'chaos_rune', qty: 1 }],                                            baseMaxHit: 9,  xpPerCast: 13.5, element: 'air'   },
  { id: 'water_bolt',     name: 'Water Bolt',     levelRequired: 23, runes: [{ runeId: 'water_rune', qty: 2 }, { runeId: 'air_rune', qty: 2 }, { runeId: 'chaos_rune', qty: 1 }],            baseMaxHit: 10, xpPerCast: 16.5, element: 'water' },
  { id: 'earth_bolt',     name: 'Earth Bolt',     levelRequired: 29, runes: [{ runeId: 'earth_rune', qty: 3 }, { runeId: 'air_rune', qty: 2 }, { runeId: 'chaos_rune', qty: 1 }],            baseMaxHit: 11, xpPerCast: 19.5, element: 'earth' },
  { id: 'fire_bolt',      name: 'Fire Bolt',      levelRequired: 35, runes: [{ runeId: 'fire_rune', qty: 4 },  { runeId: 'air_rune', qty: 3 }, { runeId: 'chaos_rune', qty: 1 }],            baseMaxHit: 12, xpPerCast: 22.5, element: 'fire'  },
  { id: 'wind_blast',     name: 'Wind Blast',     levelRequired: 41, runes: [{ runeId: 'air_rune', qty: 3 },   { runeId: 'death_rune', qty: 1 }],                                            baseMaxHit: 13, xpPerCast: 25.5, element: 'air'   },
  { id: 'water_blast',    name: 'Water Blast',    levelRequired: 47, runes: [{ runeId: 'water_rune', qty: 3 }, { runeId: 'air_rune', qty: 3 }, { runeId: 'death_rune', qty: 1 }],            baseMaxHit: 14, xpPerCast: 28.5, element: 'water' },
  { id: 'earth_blast',    name: 'Earth Blast',    levelRequired: 53, runes: [{ runeId: 'earth_rune', qty: 4 }, { runeId: 'air_rune', qty: 3 }, { runeId: 'death_rune', qty: 1 }],            baseMaxHit: 15, xpPerCast: 31.5, element: 'earth' },
  { id: 'fire_blast',     name: 'Fire Blast',     levelRequired: 59, runes: [{ runeId: 'fire_rune', qty: 5 },  { runeId: 'air_rune', qty: 4 }, { runeId: 'death_rune', qty: 1 }],            baseMaxHit: 16, xpPerCast: 34.5, element: 'fire'  },
  { id: 'wind_wave',      name: 'Wind Wave',      levelRequired: 62, runes: [{ runeId: 'air_rune', qty: 5 },   { runeId: 'blood_rune', qty: 1 }],                                            baseMaxHit: 17, xpPerCast: 36,   element: 'air'   },
  { id: 'water_wave',     name: 'Water Wave',     levelRequired: 65, runes: [{ runeId: 'water_rune', qty: 7 }, { runeId: 'air_rune', qty: 5 }, { runeId: 'blood_rune', qty: 1 }],            baseMaxHit: 18, xpPerCast: 37.5, element: 'water' },
  { id: 'earth_wave',     name: 'Earth Wave',     levelRequired: 70, runes: [{ runeId: 'earth_rune', qty: 7 }, { runeId: 'air_rune', qty: 5 }, { runeId: 'blood_rune', qty: 1 }],            baseMaxHit: 19, xpPerCast: 40,   element: 'earth' },
  { id: 'fire_wave',      name: 'Fire Wave',      levelRequired: 75, runes: [{ runeId: 'fire_rune', qty: 7 },  { runeId: 'air_rune', qty: 5 }, { runeId: 'blood_rune', qty: 1 }],            baseMaxHit: 20, xpPerCast: 42.5, element: 'fire'  },
  // Ancient
  { id: 'ice_barrage',    name: 'Ice Barrage',    levelRequired: 94, runes: [{ runeId: 'water_rune', qty: 6 }, { runeId: 'blood_rune', qty: 2 }, { runeId: 'ancient_rune', qty: 4 }],        baseMaxHit: 30, xpPerCast: 52,   element: 'water' },
  { id: 'blood_barrage',  name: 'Blood Barrage',  levelRequired: 92, runes: [{ runeId: 'blood_rune', qty: 4 }, { runeId: 'ancient_rune', qty: 4 }],                                         baseMaxHit: 29, xpPerCast: 51,   element: 'none'  },
];

export const SPELLS_MAP = Object.fromEntries(SPELLS.map(s => [s.id, s]));
