// XP table matching Melvor Idle / RuneScape formula
// cumXP[level] = total XP needed to reach that level (1-indexed, 0 = unused, 1 = 0 XP)

function buildXpTable(): number[] {
  const table: number[] = [0, 0]; // indices 0 and 1
  let cumulative = 0;
  for (let level = 1; level <= 98; level++) {
    const xp = Math.floor((level + 300 * Math.pow(2, level / 7)) / 4);
    cumulative += xp;
    table.push(cumulative);
  }
  return table;
}

export const XP_TABLE: number[] = buildXpTable(); // XP_TABLE[level] = XP needed to reach 'level'
export const MAX_LEVEL = 99;

export function getLevelForXp(xp: number): number {
  for (let level = MAX_LEVEL; level >= 1; level--) {
    if (xp >= XP_TABLE[level]) return level;
  }
  return 1;
}

export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level > MAX_LEVEL) return XP_TABLE[MAX_LEVEL];
  return XP_TABLE[level];
}

export function getXpToNextLevel(currentXp: number): number {
  const currentLevel = getLevelForXp(currentXp);
  if (currentLevel >= MAX_LEVEL) return 0;
  return getXpForLevel(currentLevel + 1) - currentXp;
}

export function getLevelProgress(currentXp: number): number {
  const currentLevel = getLevelForXp(currentXp);
  if (currentLevel >= MAX_LEVEL) return 1;
  const levelStartXp = getXpForLevel(currentLevel);
  const levelEndXp = getXpForLevel(currentLevel + 1);
  return (currentXp - levelStartXp) / (levelEndXp - levelStartXp);
}

export function formatXp(xp: number): string {
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(2)}M`;
  if (xp >= 1_000) return `${(xp / 1_000).toFixed(1)}K`;
  return xp.toFixed(1);
}
