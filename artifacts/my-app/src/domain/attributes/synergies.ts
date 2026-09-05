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
  childRu: string;
  /** Ярус нити: I — первая награда, III — эндгейм. Канон BALANCE_FOUNDATION.md §6.5. */
  tier: ThreadTier;
  /** Столпы линии. Три столпа = тройная нить. */
  pillars: readonly PillarId[];
  /** Пороги по итоговым столпам, до эффектов самих синергий. */
  requires: Partial<Record<PillarId, number>>;
  /** Текст эффекта — для карточки позже. В 5A не применяется к бою. */
  effectRu: string;
}

export const SYNERGIES: readonly SynergyDef[] = [
  {
    id: 'solid_strike',
    pillars: ['fortitude', 'might'],
    nameRu: 'Крепкий удар',
    childRu: 'Крепкий и сильный бьёт больнее за свою крепость.',
    tier: 1,
    requires: thresholdsFor(1, 'fortitude', 'might'),
    effectRu: '+1% урона за каждые 10 очков Стойкости.',
  },
  {
    id: 'quick_eye',
    pillars: ['finesse', 'instinct'],
    nameRu: 'Быстрый глаз',
    childRu: 'Ловкий и чуткий переносит меткость на добычу.',
    tier: 1,
    requires: thresholdsFor(1, 'finesse', 'instinct'),
    effectRu: 'Криты срабатывают и на добыче ресурсов.',
  },
  {
    id: 'unstoppable',
    pillars: ['might', 'finesse'],
    nameRu: 'Неудержимый',
    childRu: 'Сильный и быстрый иногда бьёт дважды.',
    tier: 2,
    requires: thresholdsFor(2, 'might', 'finesse'),
    effectRu: 'Каждый пятый удар — двойной.',
  },
  {
    id: 'lucky_survivor',
    pillars: ['fortitude', 'instinct'],
    nameRu: 'Живучий везунчик',
    childRu: 'Когда совсем плохо — удача вспыхивает.',
    tier: 2,
    requires: thresholdsFor(2, 'fortitude', 'instinct'),
    effectRu: 'При малом здоровье выше шанс критического удара.',
  },
  {
    id: 'tempo_master',
    pillars: ['finesse', 'fortitude'],
    nameRu: 'Мастер темпа',
    childRu: 'Быстрый и крепкий не бросает ночной путь из‑за элиты.',
    tier: 3,
    requires: thresholdsFor(3, 'finesse', 'fortitude'),
    effectRu: 'Offline-фарм не прерывается элитными мобами.',
  },
  {
    id: 'destroyer',
    pillars: ['might', 'instinct'],
    nameRu: 'Разрушитель',
    childRu: 'Сильный и чуткий проламывает любую защиту.',
    tier: 3,
    requires: thresholdsFor(3, 'might', 'instinct'),
    effectRu: 'Криты игнорируют защиту цели полностью.',
  },
  {
    id: 'wall_of_muscle',
    pillars: ['fortitude', 'might'],
    nameRu: 'Стена мышц',
    childRu: 'Крепкий и сильный держит удар всем телом.',
    tier: 2,
    requires: thresholdsFor(2, 'fortitude', 'might'),
    effectRu: 'Часть урона по тебе уходит в ответный удар.',
  },
  {
    id: 'stone_skin',
    pillars: ['fortitude', 'might'],
    nameRu: 'Каменная кожа',
    childRu: 'Тебя уже почти не пробить.',
    tier: 3,
    requires: thresholdsFor(3, 'fortitude', 'might'),
    effectRu: 'Самый сильный удар за бой не проходит вовсе.',
  },
  {
    id: 'wind_shadow',
    pillars: ['finesse', 'instinct'],
    nameRu: 'Тень ветра',
    childRu: 'Ловкий и чуткий уходит раньше, чем его заметят.',
    tier: 2,
    requires: thresholdsFor(2, 'finesse', 'instinct'),
    effectRu: 'Уворот приносит редкую добычу.',
  },
  {
    id: 'storm_eye',
    pillars: ['finesse', 'instinct'],
    nameRu: 'Око бури',
    childRu: 'Видит спокойствие в самой гуще.',
    tier: 3,
    requires: thresholdsFor(3, 'finesse', 'instinct'),
    effectRu: 'Каждый десятый заход идёт без затрат.',
  },
  {
    id: 'blade_dance',
    pillars: ['might', 'finesse'],
    nameRu: 'Танец клинка',
    childRu: 'Сильный и быстрый не даёт врагу вдохнуть.',
    tier: 1,
    requires: thresholdsFor(1, 'might', 'finesse'),
    effectRu: 'Серия ударов подряд ускоряет следующий.',
  },
  {
    id: 'steel_vortex',
    pillars: ['might', 'finesse'],
    nameRu: 'Стальной вихрь',
    childRu: 'Замах достаёт всех вокруг.',
    tier: 3,
    requires: thresholdsFor(3, 'might', 'finesse'),
    effectRu: 'Удар по нескольким целям бьёт в полную силу.',
  },
  {
    id: 'root_of_life',
    pillars: ['fortitude', 'instinct'],
    nameRu: 'Корень жизни',
    childRu: 'Крепкий и чуткий берёт силу у земли.',
    tier: 1,
    requires: thresholdsFor(1, 'fortitude', 'instinct'),
    effectRu: 'Часть добычи превращается в здоровье.',
  },
  {
    id: 'ancestors_call',
    pillars: ['fortitude', 'instinct'],
    nameRu: 'Зов предков',
    childRu: 'Предки помнят тебя и помогают.',
    tier: 3,
    requires: thresholdsFor(3, 'fortitude', 'instinct'),
    effectRu: 'Раз за ночь смерть не отнимает добычу.',
  },
  {
    id: 'second_wind',
    pillars: ['finesse', 'fortitude'],
    nameRu: 'Второй ветер',
    childRu: 'Быстрый и крепкий находит силы там, где их нет.',
    tier: 1,
    requires: thresholdsFor(1, 'finesse', 'fortitude'),
    effectRu: 'Усталость ночью приходит вдвое позже.',
  },
  {
    id: 'iron_grip',
    pillars: ['finesse', 'fortitude'],
    nameRu: 'Железная хватка',
    childRu: 'Что взял — то твоё.',
    tier: 2,
    requires: thresholdsFor(2, 'finesse', 'fortitude'),
    effectRu: 'Добыча не теряется при прерывании.',
  },
  {
    id: 'crown_hunter',
    pillars: ['might', 'instinct'],
    nameRu: 'Охотник на корон',
    childRu: 'Сильный и чуткий выбирает добычу покрупнее.',
    tier: 1,
    requires: thresholdsFor(1, 'might', 'instinct'),
    effectRu: 'Крупные враги роняют больше золота.',
  },
  {
    id: 'blood_oath',
    pillars: ['might', 'instinct'],
    nameRu: 'Клятва крови',
    childRu: 'Платит здоровьем за силу удара.',
    tier: 2,
    requires: thresholdsFor(2, 'might', 'instinct'),
    effectRu: 'Чем меньше здоровья, тем сильнее удар.',
  },
  {
    id: 'thunder_step',
    pillars: ['might', 'finesse', 'fortitude'],
    nameRu: 'Громовой шаг',
    childRu: 'Быстрый, сильный и крепкий идёт как гроза.',
    tier: 3,
    requires: { might: TRIPLE_THREAD_THRESHOLD, finesse: TRIPLE_THREAD_THRESHOLD, fortitude: TRIPLE_THREAD_THRESHOLD },
    effectRu: 'Каждый третий заход мгновенный.',
  },
  {
    id: 'storm_fury',
    pillars: ['might', 'finesse', 'instinct'],
    nameRu: 'Ярость бури',
    childRu: 'Всё, что умеешь, бьёт разом.',
    tier: 3,
    requires: { might: TRIPLE_THREAD_THRESHOLD, finesse: TRIPLE_THREAD_THRESHOLD, instinct: TRIPLE_THREAD_THRESHOLD },
    effectRu: 'Криты бьют по всем целям сразу.',
  },
  {
    id: 'dark_bargain',
    pillars: ['fortitude', 'instinct', 'might'],
    nameRu: 'Тёмная сделка',
    childRu: 'Отдаёшь покой — получаешь силу.',
    tier: 3,
    requires: { fortitude: TRIPLE_THREAD_THRESHOLD, instinct: TRIPLE_THREAD_THRESHOLD, might: TRIPLE_THREAD_THRESHOLD },
    effectRu: 'Ночь идёт вдвое дольше, но опаснее.',
  },
];
