/**
 * Вторые эффекты ветвей. Канон: BALANCE_FOUNDATION.md §6.
 *
 * У ветви два слоя:
 *   Эффект 1 — усиление своей подхарактеристики (BRANCH_RANK_IN_PILLAR_POINTS = 8 очков столпа).
 *   Эффект 2 — уникальная механика в профессиях/idle, которой у столпов НЕТ никогда.
 *
 * Столпы делают героя СИЛЬНЕЕ, ветви делают его ВЫГОДНЕЕ:
 * фарм быстрее, крафт дешевле, ночь продуктивнее.
 *
 * Hard-Idle: фарм и крафт ресурсов высокого яруса всё дороже и дольше,
 * поэтому ускорение и удешевление — главная валюта прогресса.
 */
import type { BranchId } from '../../domain/attributes/attributes.ts';

/** Куда бьёт второй эффект. Нужен, чтобы системы забирали только своё. */
export type BranchEffectDomain =
  | 'offline'      // ночной прогресс
  | 'gathering'    // добыча ресурсов
  | 'crafting'     // ремесло и переработка
  | 'loot'         // качество добычи
  | 'economy'      // золото и цены
  | 'progression'; // опыт и доступ к ярусам

export interface BranchEffect {
  branch: BranchId;
  domain: BranchEffectDomain;
  nameRu: string;
  /** Правило для карточки узла. */
  ruleRu: string;
  /** Прирост за 1 ранг. Ранги 1→3. */
  perRank: number;
  /** Единица: percent — проценты, hours — часы, flat — штуки. */
  unit: 'percent' | 'hours' | 'flat';
  /** Итог на 3 ранге — для карточки узла. */
  atMaxRu: string;
}

/**
 * Ровно 12 — по одному на ветвь. Домены раскиданы так, чтобы каждый столп
 * закрывал свою зону, а игрок не был обязан качать один «правильный» столп.
 */
export const BRANCH_EFFECTS: Record<BranchId, BranchEffect> = {
  // ── Стойкость: длительность вылазки ──────────────────────────
  health: {
    branch: 'health', domain: 'offline',
    nameRu: 'Долгая ночь', ruleRu: '+2 ч к пределу ночного накопления за ранг.',
    perRank: 2, unit: 'hours', atMaxRu: '+6 ч к пределу ночного накопления',
  },
  armor: {
    branch: 'armor', domain: 'gathering',
    nameRu: 'Крепкая спина', ruleRu: '+8% добычи в опасных зонах за ранг.',
    perRank: 8, unit: 'percent', atMaxRu: '+24% добычи в опасных зонах',
  },
  will: {
    branch: 'will', domain: 'offline',
    nameRu: 'Твёрдый уговор', ruleRu: '−25% потерь голодной ночи за ранг.',
    perRank: 25, unit: 'percent', atMaxRu: 'потери голодной ночи меньше на 75%',
  },

  // ── Мощь: скорость убийства ──────────────────────────────────
  strike: {
    branch: 'strike', domain: 'gathering',
    nameRu: 'Силовая добыча', ruleRu: '+7% скорости тяжёлой добычи за ранг.',
    perRank: 7, unit: 'percent', atMaxRu: '+21% скорости тяжёлой добычи',
  },
  onslaught: {
    branch: 'onslaught', domain: 'gathering',
    nameRu: 'Широкий замах', ruleRu: '+5% шанс лишней единицы за цикл добычи за ранг.',
    perRank: 5, unit: 'percent', atMaxRu: '15% шанс лишней единицы за цикл',
  },
  /** Пробой (бывш. Разрушение). */
  destruction: {
    branch: 'destruction', domain: 'progression',
    nameRu: 'Взлом яруса', ruleRu: '+1 ярус к доступной переработке материалов за ранг.',
    perRank: 1, unit: 'flat', atMaxRu: 'переработка материалов на 3 яруса выше',
  },

  // ── Сноровка: плотность действий ─────────────────────────────
  tempo: {
    branch: 'tempo', domain: 'gathering',
    nameRu: 'Без остановки', ruleRu: '−10% штрафа яруса за ранг.',
    perRank: 10, unit: 'percent', atMaxRu: 'штраф яруса меньше на 30%',
  },
  evasion: {
    branch: 'evasion', domain: 'offline',
    nameRu: 'Ночной ход', ruleRu: '+12% шанс игнорировать прерывание ночи за ранг.',
    perRank: 12, unit: 'percent', atMaxRu: '36% прерываний ночи проходят мимо',
  },
  /** Сноровка рук (бывш. Реакция). */
  reaction: {
    branch: 'reaction', domain: 'crafting',
    nameRu: 'Ловкие пальцы', ruleRu: '+9% скорости ремесла за ранг.',
    perRank: 9, unit: 'percent', atMaxRu: '+27% скорости ремесла',
  },

  // ── Чутьё: качество результата ───────────────────────────────
  luck: {
    branch: 'luck', domain: 'loot',
    nameRu: 'Золотой тик', ruleRu: '+4% шанс двойной добычи за цикл за ранг.',
    perRank: 4, unit: 'percent', atMaxRu: '12% шанс двойной добычи',
  },
  resourcefulness: {
    branch: 'resourcefulness', domain: 'crafting',
    nameRu: 'Ничего не пропадёт', ruleRu: '+8% сырья возвращается при крафте за ранг.',
    perRank: 8, unit: 'percent', atMaxRu: '24% сырья возвращается при крафте',
  },
  intuition: {
    branch: 'intuition', domain: 'economy',
    nameRu: 'Знает цену', ruleRu: '+6% к выгоде сделок (продажа выше, покупка ниже) за ранг.',
    perRank: 6, unit: 'percent', atMaxRu: '+18% выгоды в сделках',
  },
};

/** Значение второго эффекта на текущем ранге. Ранг 0 — эффекта нет. */
export function branchEffectValue(branch: BranchId, rank: number): number {
  const safe = Math.max(0, Math.min(3, Math.floor(rank)));
  return BRANCH_EFFECTS[branch].perRank * safe;
}

/** Все активные вторые эффекты — для сводки в UI и для систем idle. */
export function activeBranchEffects(
  branchRanks: Partial<Record<BranchId, number>>,
): { effect: BranchEffect; rank: number; value: number }[] {
  const out: { effect: BranchEffect; rank: number; value: number }[] = [];
  for (const [id, rank] of Object.entries(branchRanks) as [BranchId, number][]) {
    if (!rank || rank < 1) continue;
    out.push({ effect: BRANCH_EFFECTS[id], rank, value: branchEffectValue(id, rank) });
  }
  return out;
}
