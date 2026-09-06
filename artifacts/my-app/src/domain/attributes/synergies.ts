import type { PillarId } from './attributes.ts';
import {
  TRIPLE_THREAD_THRESHOLD,
  thresholdsFor,
  type ThreadTier,
} from '../../data/balance/threads.ts';

export type SynergyId =
  // Стойкость + Мощь
  | 'solid_strike' | 'wall_of_muscle' | 'stone_skin'
  // Сноровка + Чутьё
  | 'quick_eye' | 'wind_shadow' | 'storm_eye'
  // Мощь + Сноровка
  | 'unstoppable' | 'blade_dance' | 'steel_vortex'
  // Стойкость + Чутьё
  | 'lucky_survivor' | 'root_of_life' | 'ancestors_call'
  // Сноровка + Стойкость
  | 'tempo_master' | 'second_wind' | 'iron_grip'
  // Мощь + Чутьё
  | 'destroyer' | 'crown_hunter' | 'blood_oath'
  // Тройные нити — три столпа сразу, эндгейм
  | 'thunder_step' | 'storm_fury' | 'dark_bargain';

export interface SynergyDef {
  id: SynergyId;
  nameRu: string;
  /** Ярус нити: I — первая награда, III — эндгейм. Канон BALANCE_FOUNDATION.md §6.5. */
  tier: ThreadTier;
  /** Столпы линии. Три столпа = тройная нить. */
  pillars: readonly PillarId[];
  /** Пороги по итоговым столпам, до эффектов самих синергий. */
  requires: Partial<Record<PillarId, number>>;
  /**
   * Правило нити. Бой и idle его ещё не применяют —
   * карточка показывает правило и порог, не «скоро будет красиво».
   */
  effectRu: string;
}

export const SYNERGIES: readonly SynergyDef[] = [
  {
    id: 'solid_strike',
    pillars: ['fortitude', 'might'],
    nameRu: 'Крепкий удар',
    tier: 1,
    requires: thresholdsFor(1, 'fortitude', 'might'),
    effectRu: '+1% урона за каждые 10 итоговых очков Стойкости.',
  },
  {
    id: 'quick_eye',
    pillars: ['finesse', 'instinct'],
    nameRu: 'Быстрый глаз',
    tier: 1,
    requires: thresholdsFor(1, 'finesse', 'instinct'),
    effectRu: 'Критический удар срабатывает и на цикле добычи ресурса.',
  },
  {
    id: 'unstoppable',
    pillars: ['might', 'finesse'],
    nameRu: 'Неудержимый',
    tier: 2,
    requires: thresholdsFor(2, 'might', 'finesse'),
    effectRu: 'Каждый пятый удар наносит урон дважды.',
  },
  {
    id: 'lucky_survivor',
    pillars: ['fortitude', 'instinct'],
    nameRu: 'Живучий везунчик',
    tier: 2,
    requires: thresholdsFor(2, 'fortitude', 'instinct'),
    effectRu: 'Ниже порога HP повышается шанс критического удара.',
  },
  {
    id: 'tempo_master',
    pillars: ['finesse', 'fortitude'],
    nameRu: 'Мастер темпа',
    tier: 3,
    requires: thresholdsFor(3, 'finesse', 'fortitude'),
    effectRu: 'Ночная добыча не прерывается элитой.',
  },
  {
    id: 'destroyer',
    pillars: ['might', 'instinct'],
    nameRu: 'Разрушитель',
    tier: 3,
    requires: thresholdsFor(3, 'might', 'instinct'),
    effectRu: 'Критический удар полностью игнорирует защиту цели.',
  },
  {
    id: 'wall_of_muscle',
    pillars: ['fortitude', 'might'],
    nameRu: 'Стена мышц',
    tier: 2,
    requires: thresholdsFor(2, 'fortitude', 'might'),
    effectRu: 'Часть входящего урона возвращается цели ответным ударом.',
  },
  {
    id: 'stone_skin',
    pillars: ['fortitude', 'might'],
    nameRu: 'Каменная кожа',
    tier: 3,
    requires: thresholdsFor(3, 'fortitude', 'might'),
    effectRu: 'Самый сильный удар по вам за бой не наносит урона.',
  },
  {
    id: 'wind_shadow',
    pillars: ['finesse', 'instinct'],
    nameRu: 'Тень ветра',
    tier: 2,
    requires: thresholdsFor(2, 'finesse', 'instinct'),
    effectRu: 'Успешный уворот дополнительно бросает таблицу редкого дропа.',
  },
  {
    id: 'storm_eye',
    pillars: ['finesse', 'instinct'],
    nameRu: 'Око бури',
    tier: 3,
    requires: thresholdsFor(3, 'finesse', 'instinct'),
    effectRu: 'Каждый десятый цикл действия не тратит энергию и время.',
  },
  {
    id: 'blade_dance',
    pillars: ['might', 'finesse'],
    nameRu: 'Танец клинка',
    tier: 1,
    requires: thresholdsFor(1, 'might', 'finesse'),
    effectRu: 'Каждый удар подряд сокращает интервал следующего.',
  },
  {
    id: 'steel_vortex',
    pillars: ['might', 'finesse'],
    nameRu: 'Стальной вихрь',
    tier: 3,
    requires: thresholdsFor(3, 'might', 'finesse'),
    effectRu: 'Удар по нескольким целям наносит полный урон каждой, без деления.',
  },
  {
    id: 'root_of_life',
    pillars: ['fortitude', 'instinct'],
    nameRu: 'Корень жизни',
    tier: 1,
    requires: thresholdsFor(1, 'fortitude', 'instinct'),
    effectRu: 'Часть полученной добычи конвертируется в здоровье.',
  },
  {
    id: 'ancestors_call',
    pillars: ['fortitude', 'instinct'],
    nameRu: 'Зов предков',
    tier: 3,
    requires: thresholdsFor(3, 'fortitude', 'instinct'),
    effectRu: 'Один раз за ночь смерть не отнимает добычу этой вылазки.',
  },
  {
    id: 'second_wind',
    pillars: ['finesse', 'fortitude'],
    nameRu: 'Второй ветер',
    tier: 1,
    requires: thresholdsFor(1, 'finesse', 'fortitude'),
    effectRu: 'Лимит ночного накопления наступает вдвое позже.',
  },
  {
    id: 'iron_grip',
    pillars: ['finesse', 'fortitude'],
    nameRu: 'Железная хватка',
    tier: 2,
    requires: thresholdsFor(2, 'finesse', 'fortitude'),
    effectRu: 'Прерывание действия не сбрасывает уже собранную добычу цикла.',
  },
  {
    id: 'crown_hunter',
    pillars: ['might', 'instinct'],
    nameRu: 'Охотник на корон',
    tier: 1,
    requires: thresholdsFor(1, 'might', 'instinct'),
    effectRu: 'Элита и боссы роняют больше золота.',
  },
  {
    id: 'blood_oath',
    pillars: ['might', 'instinct'],
    nameRu: 'Клятва крови',
    tier: 2,
    requires: thresholdsFor(2, 'might', 'instinct'),
    effectRu: 'Чем ниже доля текущего HP, тем выше урон удара.',
  },
  {
    id: 'thunder_step',
    pillars: ['might', 'finesse', 'fortitude'],
    nameRu: 'Громовой шаг',
    tier: 3,
    requires: { might: TRIPLE_THREAD_THRESHOLD, finesse: TRIPLE_THREAD_THRESHOLD, fortitude: TRIPLE_THREAD_THRESHOLD },
    effectRu: 'Каждый третий цикл действия выполняется мгновенно.',
  },
  {
    id: 'storm_fury',
    pillars: ['might', 'finesse', 'instinct'],
    nameRu: 'Ярость бури',
    tier: 3,
    requires: { might: TRIPLE_THREAD_THRESHOLD, finesse: TRIPLE_THREAD_THRESHOLD, instinct: TRIPLE_THREAD_THRESHOLD },
    effectRu: 'Критический удар наносит полный урон всем целям в зоне Натиска.',
  },
  {
    id: 'dark_bargain',
    pillars: ['fortitude', 'instinct', 'might'],
    nameRu: 'Тёмная сделка',
    tier: 3,
    requires: { fortitude: TRIPLE_THREAD_THRESHOLD, instinct: TRIPLE_THREAD_THRESHOLD, might: TRIPLE_THREAD_THRESHOLD },
    effectRu: 'Ночь длится вдвое дольше. Шанс прерывания и потери добычи тоже вдвое выше.',
  },
];
