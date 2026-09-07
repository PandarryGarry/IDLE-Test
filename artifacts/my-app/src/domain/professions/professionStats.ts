import type { SkillId } from '../../data/types.ts';

/**
 * Фундамент «Характеристики профессий».
 *
 * Каждая профессия качается и даёт СОБСТВЕННЫЕ статы (этот файл) + вклад
 * в персонажа (см. PROFESSION_FEEDS). Данные отделены от кода и от UI:
 * их можно править в админке без редактирования TypeScript.
 *
 * Волны бонусов:
 *   early  — открываются с первых уровней (старт ощутимый);
 *   master — открываются ближе к максимуму (70/80/99), дают стимул
 *            прокачать профессию до конца.
 */

export type ProfessionStatKind = 'flat' | 'percent' | 'rating';
export type ProfessionStatTier = 'early' | 'master';

export interface ProfessionStatDef {
  id: string;
  skillId: SkillId;
  nameRu: string;
  descriptionRu: string;
  kind: ProfessionStatKind;
  /** Волна открытия бонуса. */
  tier: ProfessionStatTier;
  /** Уровень профессии, с которого стата становится активной. */
  unlockLevel: number;
  /** Значение на `unlockLevel` (или при 0 очков для rating/percent). */
  base: number;
  /** Прирост за уровень профессии (после unlockLevel). */
  perLevel: number;
  /** Жёсткий кап для percent / асимптота для rating. Для flat опционально. */
  cap?: number;
  /** Рейтинг, дающий половину капа. Только rating. */
  k?: number;
  icon?: string;
}

export const PROFESSION_STAT_DEFS: readonly ProfessionStatDef[] = [
  // ── Сбор ──────────────────────────────────────────────────────
  {
    id: 'forage_speed',
    skillId: 'foraging',
    nameRu: 'Скорость сбора',
    descriptionRu: 'Сокращает время одного цикла сбора. Не разгоняет остальные навыки.',
    kind: 'percent',
    tier: 'early',
    unlockLevel: 1,
    base: 0,
    perLevel: 0.4,
    cap: 40,
    icon: '⚡',
  },
  {
    id: 'forage_double_loot',
    skillId: 'foraging',
    nameRu: 'Двойная находка',
    descriptionRu: 'Шанс получить найденный предмет в двойном количестве.',
    kind: 'percent',
    tier: 'early',
    unlockLevel: 1,
    base: 2,
    perLevel: 0.05,
    cap: 10,
    icon: '✕2',
  },
  {
    id: 'forage_rare_find',
    skillId: 'foraging',
    nameRu: 'Редкая находка',
    descriptionRu: 'Шанс найти особый предмет своей зоны (капается низко, хард-idle).',
    kind: 'percent',
    tier: 'early',
    unlockLevel: 5,
    base: 0.5,
    perLevel: 0.05,
    cap: 8,
    icon: '✨',
  },
  {
    id: 'forage_shop_discount',
    skillId: 'foraging',
    nameRu: 'Скидка на покупку',
    descriptionRu: 'Минимальная скидка при покупке в будущей экономике. Цены продажи не меняет.',
    kind: 'percent',
    tier: 'master',
    unlockLevel: 70,
    base: 0,
    perLevel: 0.05,
    cap: 3,
    icon: '🪙',
  },
  {
    id: 'forage_attention',
    skillId: 'foraging',
    nameRu: 'Внимательность',
    descriptionRu: 'Немного повышает качество находок и снижает долю пустых циклов.',
    kind: 'percent',
    tier: 'master',
    unlockLevel: 80,
    base: 0,
    perLevel: 0.05,
    cap: 3,
    icon: '👁️',
  },
  {
    id: 'forage_full_profession',
    skillId: 'foraging',
    nameRu: 'Мастер-собиратель',
    descriptionRu: 'Финальный бонус профессии: в конце цикла — один дополнительный результат.',
    kind: 'flat',
    tier: 'master',
    unlockLevel: 99,
    base: 1,
    perLevel: 0,
    cap: 1,
    icon: '🏆',
  },
];

export const PROFESSION_STAT_BY_ID = Object.fromEntries(
  PROFESSION_STAT_DEFS.map(def => [def.id, def]),
) as Record<string, ProfessionStatDef>;

export function getProfessionStatDefsForSkill(skillId: SkillId): ProfessionStatDef[] {
  return PROFESSION_STAT_DEFS.filter(def => def.skillId === skillId);
}

/**
 * Эффективное значение статы с учётом уровня профессии.
 * Единая формула для всех kind; кап применяется внутри расчёта.
 */
export function effectiveStatValue(def: ProfessionStatDef, level: number, override?: Partial<ProfessionStatDef>): number {
  const d = { ...def, ...override };
  const above = Math.max(0, level - d.unlockLevel);
  const raw = d.base + above * d.perLevel;

  if (d.kind === 'percent') {
    return d.cap !== undefined ? Math.min(d.cap, Math.max(0, raw)) : Math.max(0, raw);
  }
  if (d.kind === 'rating') {
    const r = Math.max(0, raw);
    const cap = d.cap ?? 100;
    const k = d.k ?? 100;
    return d.cap !== undefined ? (cap * r) / (r + k) : r;
  }
  return Math.max(0, raw);
}
