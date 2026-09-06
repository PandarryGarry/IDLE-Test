/**
 * Четыре Столпа — канон Этапа 5.
 * Ярлыка класса нет. Профессия = ремесло (не здесь).
 * Числа кривых — только src/data/balance/. Здесь имена, ветви, расы.
 */
/** Совпадает с RaceId в characters.ts — без импорта, чтобы не крутить цикл. */
export type AttributeRaceId = 'human' | 'elf' | 'dwarf' | 'orc' | 'beastfolk';

export const ATTRIBUTE_STATE_VERSION = 1 as const;

export type PillarId = 'fortitude' | 'might' | 'finesse' | 'instinct';

export type BranchId =
  | 'health' | 'armor' | 'will'
  | 'strike' | 'onslaught' | 'destruction'
  | 'tempo' | 'evasion' | 'reaction'
  | 'luck' | 'resourcefulness' | 'intuition';

export const PILLAR_IDS: readonly PillarId[] = ['fortitude', 'might', 'finesse', 'instinct'];

export const BRANCH_IDS: readonly BranchId[] = [
  'health', 'armor', 'will',
  'strike', 'onslaught', 'destruction',
  'tempo', 'evasion', 'reaction',
  'luck', 'resourcefulness', 'intuition',
];

export const BRANCHES_BY_PILLAR: Record<PillarId, readonly BranchId[]> = {
  fortitude: ['health', 'armor', 'will'],
  might: ['strike', 'onslaught', 'destruction'],
  finesse: ['tempo', 'evasion', 'reaction'],
  instinct: ['luck', 'resourcefulness', 'intuition'],
};

export const PILLAR_OF_BRANCH: Record<BranchId, PillarId> = {
  health: 'fortitude', armor: 'fortitude', will: 'fortitude',
  strike: 'might', onslaught: 'might', destruction: 'might',
  tempo: 'finesse', evasion: 'finesse', reaction: 'finesse',
  luck: 'instinct', resourcefulness: 'instinct', intuition: 'instinct',
};

export interface NamedBlurb {
  id: string;
  nameRu: string;
  /** Правило для игрока: что делает, где работает, с числами если они закрыты. */
  ruleRu: string;
}

export const PILLARS: Record<PillarId, NamedBlurb & { icon: string }> = {
  fortitude: {
    id: 'fortitude',
    nameRu: 'Стойкость',
    icon: '🛡',
    ruleRu: 'Длительность вылазки. Каждое очко поднимает Здоровье, Броню и Волю. 1 очко столпа за уровень героя.',
  },
  might: {
    id: 'might',
    nameRu: 'Мощь',
    icon: '⚔',
    ruleRu: 'Скорость убийства. Каждое очко поднимает Удар, Натиск и Пробой.',
  },
  finesse: {
    id: 'finesse',
    nameRu: 'Сноровка',
    icon: '💨',
    ruleRu: 'Плотность действий. Каждое очко поднимает Темп, Уворот и Сноровку рук.',
  },
  instinct: {
    id: 'instinct',
    nameRu: 'Чутьё',
    icon: '👁',
    ruleRu: 'Качество результата. Каждое очко поднимает Удачу, Находчивость и Интуицию.',
  },
};

export const BRANCHES: Record<BranchId, NamedBlurb> = {
  health: {
    id: 'health', nameRu: 'Здоровье',
    ruleRu: 'Максимум HP. База 120, +14 за очко Стойкости, без потолка. Бой: пул здоровья и порог авто-еды. Вылазка: как долго идёшь без возврата.',
  },
  armor: {
    id: 'armor', nameRu: 'Броня',
    ruleRu: 'Снижает входящий урон. Рейтинг → % (асимптота 75%, половина при рейтинге 80). С другими снижениями складывается умножением остатка: 100% неуязвимости нет. Только бой.',
  },
  will: {
    id: 'will', nameRu: 'Воля',
    ruleRu: 'Сопротивление ядам и дебафам. Ночью режет потери голодной вылазки. Рейтинг → % (асимптота 70%).',
  },
  strike: {
    id: 'strike', nameRu: 'Удар',
    ruleRu: 'Плоский урон удара. База 10, +2,2 за очко Мощи, без потолка. На листе: диапазон ±15% от Удара, пока нет оружия.',
  },
  onslaught: {
    id: 'onslaught', nameRu: 'Натиск',
    ruleRu: 'Шанс задеть вторую цель в бою и взять лишнюю единицу ресурса за цикл добычи. Рейтинг → % (асимптота 60%).',
  },
  destruction: {
    id: 'destruction', nameRu: 'Пробой',
    ruleRu: 'Игнорирует часть защиты цели. Рейтинг → % (асимптота 70%). В добыче открывает материалы выше ярусом — через ветвь.',
  },
  tempo: {
    id: 'tempo', nameRu: 'Темп',
    ruleRu: 'Сокращает интервал боевого цикла и цикла добычи. Линейный %, кап 140%.',
  },
  evasion: {
    id: 'evasion', nameRu: 'Уворот',
    ruleRu: 'Шанс полностью избежать удара. Рейтинг → % (асимптота 50%). Только бой.',
  },
  reaction: {
    id: 'reaction', nameRu: 'Сноровка рук',
    ruleRu: 'Скорость ремесла и переработки. Линейный %, кап 140%. В бой не входит.',
  },
  luck: {
    id: 'luck', nameRu: 'Удача',
    ruleRu: 'Шанс критического удара в бою и шанс двойной добычи за цикл. Рейтинг → % (асимптота 65%).',
  },
  resourcefulness: {
    id: 'resourcefulness', nameRu: 'Находчивость',
    ruleRu: 'Шанс редкого дропа и возврат части сырья при крафте. Линейный %, кап 100%.',
  },
  intuition: {
    id: 'intuition', nameRu: 'Интуиция',
    ruleRu: 'Множитель опыта героя. Линейный %, кап 75%.',
  },
};

/** Подхарактеристики тела. Растут от очка столпа. Это не пассивки на доске. */
export type SubstatId = BranchId;
export const SUBSTAT_IDS = BRANCH_IDS;
export const SUBSTATS = BRANCHES;
export const SUBSTATS_BY_PILLAR = BRANCHES_BY_PILLAR;
export const PILLAR_OF_SUBSTAT = PILLAR_OF_BRANCH;

export const HERO_HELP = {
  body: 'Четыре столпа. +1 очко столпа за каждый уровень после 1-го. Очко кладётся в один столп и поднимает его три числа тела. От столпа три луча: ветвь → пассивка → пассивка. Узел: 3 ранга. Следующий на луче открыт, когда предыдущий на 3/3. +1 очко узлов каждые 5 уровней (5, 10, 15…). Ранг ветви = +8 очков столпа к своему числу. Второй эффект ветви и все глубинные пассивки в бой и idle ещё не входят. Доску можно двигать.',
  gear: 'Слева 14 слотов надетого (7 боевых + 7 украшений), центр — манекен, справа — мини-сумка на 14 ячеек. Снизу сумма бонусов надетого. Цифры 1–N сверху — наборы: сохранить текущее / надеть сохранённое. Тап по слоту или вещи открывает карточку. Двуручное занимает обе руки.',
  synergies: 'Нить — правило, не проценты к столпам. Пара столпов: ярус I 15/10, II 35/20, III 55/35. Три столпа сразу: 35/35/35. Счёт идёт по итоговым очкам столпа (раса + вложения). Эффект нити в бой и idle ещё не входит: карточка показывает правило и порог.',
  path: 'Сверху шесть дощечек: HP, диапазон удара (±15% от Удара), броня, уворот, крит, удача. Крит на дощечке — заглушка 5%, пока бой не читает Удачу. Ниже все 12 чисел тела пачками столпов, в шапке — ур. столпа. Ник, аватар, смена, удаление и сброс очков — в шестерёнке, не в общих настройках.',
} as const;

/**
 * УСТАРЕЛО: расовые проценты заменены стартовыми очками в balance/races.ts.
 * Схема +2/−1 в процентах уводила подхарактеристики в минус (у эльфа −90 HP).
 * Оставлено только для описаний в карточках рас; в расчёт не входит.
 */
export interface RacePillarMod {
  pillar: PillarId;
  /** Доля от базы тела, не очки игрока. +12 = +12%. */
  percent: number;
}

export interface RacePassive {
  id: string;
  nameRu: string;
  ruleRu: string;
  /** Когда срабатывает. Если бой/idle не читают — так и пишем. */
  whenRu: string;
}

export const RACE_PILLAR_MODS: Record<AttributeRaceId, readonly RacePillarMod[]> = {
  human: [
    { pillar: 'fortitude', percent: 12 },
    { pillar: 'finesse', percent: 10 },
    { pillar: 'might', percent: -10 },
  ],
  elf: [
    { pillar: 'finesse', percent: 15 },
    { pillar: 'instinct', percent: 12 },
    { pillar: 'fortitude', percent: -15 },
  ],
  dwarf: [
    { pillar: 'fortitude', percent: 15 },
    { pillar: 'might', percent: 10 },
    { pillar: 'instinct', percent: -10 },
  ],
  orc: [
    { pillar: 'might', percent: 15 },
    { pillar: 'finesse', percent: 10 },
    { pillar: 'instinct', percent: -15 },
  ],
  beastfolk: [
    { pillar: 'instinct', percent: 15 },
    { pillar: 'might', percent: 10 },
    { pillar: 'fortitude', percent: -12 },
  ],
};

export const RACE_PASSIVES: Record<AttributeRaceId, RacePassive> = {
  human: {
    id: 'adaptation',
    nameRu: 'Адаптация',
    ruleRu: 'После возрождения в городе временно поднимает самый слабый столп. Величина и длительность — при подключении боя.',
    whenRu: 'Не действует: бой не читает расовые пассивки.',
  },
  elf: {
    id: 'grace',
    nameRu: 'Грация',
    ruleRu: 'Успешный уворот возвращает энергию.',
    whenRu: 'Не действует: бой не читает расовые пассивки.',
  },
  dwarf: {
    id: 'tempering',
    nameRu: 'Закалка',
    ruleRu: 'Каждый полученный удар даёт заряд брони до потолка. Вне боя заряды сбрасываются.',
    whenRu: 'Не действует: бой не читает расовые пассивки.',
  },
  orc: {
    id: 'rage',
    nameRu: 'Ярость',
    ruleRu: 'Ниже порога HP увеличивает урон и снижает Волю.',
    whenRu: 'Не действует: бой не читает расовые пассивки.',
  },
  beastfolk: {
    id: 'predator_sense',
    nameRu: 'Чутьё хищника',
    ruleRu: 'Убийство элиты или босса временно поднимает Удачу.',
    whenRu: 'Не действует: бой не читает расовые пассивки.',
  },
};

/** Стартовый наклон 4/3/2/1. Сумма у всех рас 10. */
export const RACE_BODY_RULE_RU: Record<AttributeRaceId, string> = {
  human: 'Старт столпов 4/3/2/1: Стойкость 4, Сноровка 3, Мощь 2, Чутьё 1. Минусов нет.',
  elf: 'Старт столпов 4/3/2/1: Сноровка 4, Чутьё 3, Мощь 2, Стойкость 1. Минусов нет.',
  dwarf: 'Старт столпов 4/3/2/1: Стойкость 4, Мощь 3, Чутьё 2, Сноровка 1. Минусов нет.',
  orc: 'Старт столпов 4/3/2/1: Мощь 4, Стойкость 3, Сноровка 2, Чутьё 1. Минусов нет.',
  beastfolk: 'Старт столпов 4/3/2/1: Чутьё 4, Сноровка 3, Мощь 2, Стойкость 1. Минусов нет.',
};

/**
 * Глубинные пассивки — кольца 2 и 3 доски. По две на каждую ветвь:
 * луч «столп → ветвь → пассивка → пассивка» (решено владельцем 2026-09-02).
 * Эффекты в бой и idle не входят. Карточка показывает правило, статус — «не действует».
 */
export type PassiveId =
  | 'second_wind' | 'deep_sleep'
  | 'buckler' | 'bone_shell'
  | 'steady_spirit' | 'unbroken'
  | 'heavy_hand' | 'piercing'
  | 'sweeping' | 'stagger'
  | 'bone_breaker' | 'finisher'
  | 'light_step' | 'nimble'
  | 'shade' | 'slip_away'
  | 'flash' | 'anticipation'
  | 'lucky_break' | 'hoard_sense'
  | 'thrifty' | 'knows_value'
  | 'nose' | 'experience';

export interface DeepPassive extends NamedBlurb {
  pillar: PillarId;
  /** Ветвь-корень луча. */
  branch: BranchId;
  /** Кольцо на доске: 1 — второе, 2 — третье. */
  ring: 1 | 2;
}

export const DEEP_PASSIVES: Record<PassiveId, DeepPassive> = {
  second_wind: {
    id: 'second_wind', pillar: 'fortitude', branch: 'health', ring: 1,
    nameRu: 'Второе дыхание',
    ruleRu: 'Вне боя восстанавливает здоровье с фиксированной скоростью.',
  },
  deep_sleep: {
    id: 'deep_sleep', pillar: 'fortitude', branch: 'health', ring: 2,
    nameRu: 'Крепкий сон',
    ruleRu: 'Отдых в таверне ускоряет восстановление здоровья.',
  },
  buckler: {
    id: 'buckler', pillar: 'fortitude', branch: 'armor', ring: 1,
    nameRu: 'Щиток',
    ruleRu: 'Полностью блокирует удар ниже порога урона.',
  },
  bone_shell: {
    id: 'bone_shell', pillar: 'fortitude', branch: 'armor', ring: 2,
    nameRu: 'Костяной панцирь',
    ruleRu: 'Снижает урон самого сильного удара, полученного за бой.',
  },
  steady_spirit: {
    id: 'steady_spirit', pillar: 'fortitude', branch: 'will', ring: 1,
    nameRu: 'Стойкий дух',
    ruleRu: 'Снижает длительность и силу ядов и дебафов.',
  },
  unbroken: {
    id: 'unbroken', pillar: 'fortitude', branch: 'will', ring: 2,
    nameRu: 'Не сломаться',
    ruleRu: 'Ниже порога HP дополнительно снижает входящий урон.',
  },

  heavy_hand: {
    id: 'heavy_hand', pillar: 'might', branch: 'strike', ring: 1,
    nameRu: 'Тяжёлая рука',
    ruleRu: 'Увеличивает урон критического удара.',
  },
  piercing: {
    id: 'piercing', pillar: 'might', branch: 'strike', ring: 2,
    nameRu: 'Пробивание',
    ruleRu: 'Добавляет игнор защиты цели поверх Пробоя.',
  },
  sweeping: {
    id: 'sweeping', pillar: 'might', branch: 'onslaught', ring: 1,
    nameRu: 'Размашистый',
    ruleRu: 'Гарантирует вторую цель, если Натиск уже сработал.',
  },
  stagger: {
    id: 'stagger', pillar: 'might', branch: 'onslaught', ring: 2,
    nameRu: 'Сбивание',
    ruleRu: 'Шанс прервать действие цели ударом.',
  },
  bone_breaker: {
    id: 'bone_breaker', pillar: 'might', branch: 'destruction', ring: 1,
    nameRu: 'Костолом',
    ruleRu: 'Дополнительный урон по элите и боссам.',
  },
  finisher: {
    id: 'finisher', pillar: 'might', branch: 'destruction', ring: 2,
    nameRu: 'Добивание',
    ruleRu: 'Дополнительный урон по цели ниже порога HP.',
  },

  light_step: {
    id: 'light_step', pillar: 'finesse', branch: 'tempo', ring: 1,
    nameRu: 'Лёгкая поступь',
    ruleRu: 'Снижает расход энергии на цикл действия.',
  },
  nimble: {
    id: 'nimble', pillar: 'finesse', branch: 'tempo', ring: 2,
    nameRu: 'Проворство',
    ruleRu: 'Дополнительно сокращает интервал цикла добычи.',
  },
  shade: {
    id: 'shade', pillar: 'finesse', branch: 'evasion', ring: 1,
    nameRu: 'Тень',
    ruleRu: 'Повышает уворот в опасных зонах.',
  },
  slip_away: {
    id: 'slip_away', pillar: 'finesse', branch: 'evasion', ring: 2,
    nameRu: 'Ускользание',
    ruleRu: 'Успешный уворот даёт немедленный ответный удар.',
  },
  flash: {
    id: 'flash', pillar: 'finesse', branch: 'reaction', ring: 1,
    nameRu: 'Миг',
    ruleRu: 'Шанс выполнить лишний цикл ремесла без затрат времени.',
  },
  anticipation: {
    id: 'anticipation', pillar: 'finesse', branch: 'reaction', ring: 2,
    nameRu: 'Опережение',
    ruleRu: 'Первый удар боя ваш, если Темп не ниже цели.',
  },

  lucky_break: {
    id: 'lucky_break', pillar: 'instinct', branch: 'luck', ring: 1,
    nameRu: 'Счастливый случай',
    ruleRu: 'Повышает шанс редкого дропа.',
  },
  hoard_sense: {
    id: 'hoard_sense', pillar: 'instinct', branch: 'luck', ring: 2,
    nameRu: 'Чутьё на клад',
    ruleRu: 'Повышает шанс ценного предмета вместо обычного дропа.',
  },
  thrifty: {
    id: 'thrifty', pillar: 'instinct', branch: 'resourcefulness', ring: 1,
    nameRu: 'Бережливый',
    ruleRu: 'Снижает расход припасов на то же действие.',
  },
  knows_value: {
    id: 'knows_value', pillar: 'instinct', branch: 'resourcefulness', ring: 2,
    nameRu: 'Знающий толк',
    ruleRu: 'Повышает цену продажи предметов торговцу.',
  },
  nose: {
    id: 'nose', pillar: 'instinct', branch: 'intuition', ring: 1,
    nameRu: 'Нюх',
    ruleRu: 'Показывает ожидаемый дроп и опыт действия до старта.',
  },
  experience: {
    id: 'experience', pillar: 'instinct', branch: 'intuition', ring: 2,
    nameRu: 'Опыт',
    ruleRu: 'Дополнительный множитель опыта героя поверх Интуиции.',
  },
};

export const PASSIVE_IDS = Object.keys(DEEP_PASSIVES) as PassiveId[];

/** Две пассивки луча в порядке колец: [кольцо 2, кольцо 3]. */
export const PASSIVES_BY_BRANCH: Record<BranchId, readonly [PassiveId, PassiveId]> = {
  health: ['second_wind', 'deep_sleep'],
  armor: ['buckler', 'bone_shell'],
  will: ['steady_spirit', 'unbroken'],
  strike: ['heavy_hand', 'piercing'],
  onslaught: ['sweeping', 'stagger'],
  destruction: ['bone_breaker', 'finisher'],
  tempo: ['light_step', 'nimble'],
  evasion: ['shade', 'slip_away'],
  reaction: ['flash', 'anticipation'],
  luck: ['lucky_break', 'hoard_sense'],
  resourcefulness: ['thrifty', 'knows_value'],
  intuition: ['nose', 'experience'],
};

/** Узел доски: ветвь (кольцо 1) или глубинная пассивка (кольца 2–3). */
export type NodeRef =
  | { kind: 'branch'; id: BranchId }
  | { kind: 'passive'; id: PassiveId };

/** Луч от столпа: ветвь → пассивка кольца 2 → пассивка кольца 3. */
export function rayNodes(branch: BranchId): readonly NodeRef[] {
  const [first, second] = PASSIVES_BY_BRANCH[branch];
  return [
    { kind: 'branch', id: branch },
    { kind: 'passive', id: first },
    { kind: 'passive', id: second },
  ];
}

export type PillarRanks = Record<PillarId, number>;
export type BranchRanks = Record<BranchId, number>;
export type PassiveRanks = Record<PassiveId, number>;

/** Versioned-состояние в characters.save_data.attributes. Без specializationId. */
export interface CharacterAttributeState {
  version: typeof ATTRIBUTE_STATE_VERSION;
  pillarRanks: PillarRanks;
  branchRanks: BranchRanks;
  passiveRanks: PassiveRanks;
  unspentPillarPoints: number;
  unspentBranchPoints: number;
  heroLevel: number;
  heroXp: number;
  energy: { current: number; max: number };
  /** −100…+100, старт 0. Не rebirth. */
  reputation: number;
  /** Сколько бесплатных сбросов уже потрачено. Лимит — balance/heroLevel. */
  freeRespecsUsed: number;
}

export function emptyPillarRanks(): PillarRanks {
  return { fortitude: 0, might: 0, finesse: 0, instinct: 0 };
}

export function emptyBranchRanks(): BranchRanks {
  return {
    health: 0, armor: 0, will: 0,
    strike: 0, onslaught: 0, destruction: 0,
    tempo: 0, evasion: 0, reaction: 0,
    luck: 0, resourcefulness: 0, intuition: 0,
  };
}

export function emptyPassiveRanks(): PassiveRanks {
  const next = {} as PassiveRanks;
  for (const id of PASSIVE_IDS) next[id] = 0;
  return next;
}

export function racePercentFor(raceId: AttributeRaceId, pillar: PillarId): number {
  return RACE_PILLAR_MODS[raceId]?.find(mod => mod.pillar === pillar)?.percent ?? 0;
}
