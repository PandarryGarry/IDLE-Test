import type { PillarId } from './attributes';

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
    requires: { fortitude: 50, might: 30 },
    effectRu: '+10% урона за каждые 100 Стойкости.',
  },
  {
    id: 'quick_eye',
    nameRu: 'Быстрый глаз',
    childRu: 'Ловкий и чуткий после удачного удара быстрее готов снова.',
    requires: { finesse: 50, instinct: 30 },
    effectRu: 'Криты ускоряют перезарядку на 5%.',
  },
  {
    id: 'unstoppable',
    nameRu: 'Неудержимый',
    childRu: 'Сильный и быстрый иногда бьёт дважды.',
    requires: { might: 50, finesse: 30 },
    effectRu: 'Каждый пятый удар — двойной.',
  },
  {
    id: 'lucky_survivor',
    nameRu: 'Живучий везунчик',
    childRu: 'Когда совсем плохо — удача вспыхивает.',
    requires: { fortitude: 50, instinct: 30 },
    effectRu: 'При малом здоровье выше шанс критического удара.',
  },
  {
    id: 'tempo_master',
    nameRu: 'Мастер темпа',
    childRu: 'Быстрый и крепкий не бросает ночной путь из‑за элиты.',
    requires: { finesse: 70, fortitude: 40 },
    effectRu: 'Offline-фарм не прерывается элитными мобами.',
  },
  {
    id: 'destroyer',
    nameRu: 'Разрушитель',
    childRu: 'Сильный и чуткий больнее бьёт боссов на критах.',
    requires: { might: 70, instinct: 40 },
    effectRu: 'Боссы получают +15% урона от критов.',
  },
];
