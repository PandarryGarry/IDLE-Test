import type { PillarId } from './attributes';
import { THREAD_TIER_THRESHOLDS, type ThreadTier } from './balance/threads.ts';

export type SynergyId =
  | 'solid_strike'
  | 'quick_eye'
  | 'unstoppable'
  | 'lucky_survivor'
  | 'tempo_master'
  | 'destroyer';

export interface SynergyDef {
  id: SynergyId;
  nameRu: string;
  childRu: string;
  /** Ярус нити: I — первая награда, III — эндгейм. Канон BALANCE_FOUNDATION.md §6.5. */
  tier: ThreadTier;
  /** Пороги по итоговым столпам, до эффектов самих синергий. */
  requires: Partial<Record<PillarId, number>>;
  /** Текст эффекта — для карточки позже. В 5A не применяется к бою. */
  effectRu: string;
}

export const SYNERGIES: readonly SynergyDef[] = [
  {
    id: 'solid_strike',
    nameRu: 'Крепкий удар',
    childRu: 'Крепкий и сильный бьёт больнее за свою крепость.',
    tier: 1,
    requires: { fortitude: 25, might: 15 },
    effectRu: '+1% урона за каждые 10 очков Стойкости.',
  },
  {
    id: 'quick_eye',
    nameRu: 'Быстрый глаз',
    childRu: 'Ловкий и чуткий переносит меткость на добычу.',
    tier: 1,
    requires: { finesse: 25, instinct: 15 },
    effectRu: 'Криты срабатывают и на добыче ресурсов.',
  },
  {
    id: 'unstoppable',
    nameRu: 'Неудержимый',
    childRu: 'Сильный и быстрый иногда бьёт дважды.',
    tier: 2,
    requires: { might: 40, finesse: 25 },
    effectRu: 'Каждый пятый удар — двойной.',
  },
  {
    id: 'lucky_survivor',
    nameRu: 'Живучий везунчик',
    childRu: 'Когда совсем плохо — удача вспыхивает.',
    tier: 2,
    requires: { fortitude: 40, instinct: 25 },
    effectRu: 'При малом здоровье выше шанс критического удара.',
  },
  {
    id: 'tempo_master',
    nameRu: 'Мастер темпа',
    childRu: 'Быстрый и крепкий не бросает ночной путь из‑за элиты.',
    tier: 3,
    requires: { finesse: 55, fortitude: 35 },
    effectRu: 'Offline-фарм не прерывается элитными мобами.',
  },
  {
    id: 'destroyer',
    nameRu: 'Разрушитель',
    childRu: 'Сильный и чуткий проламывает любую защиту.',
    tier: 3,
    requires: { might: 55, instinct: 35 },
    effectRu: 'Криты игнорируют защиту цели полностью.',
  },
];
