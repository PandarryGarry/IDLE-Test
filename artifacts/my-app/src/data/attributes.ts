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
  /** Язык, понятный ребёнку. */
  childRu: string;
}

export const PILLARS: Record<PillarId, NamedBlurb & { icon: string }> = {
  fortitude: {
    id: 'fortitude',
    nameRu: 'Стойкость',
    icon: '🛡',
    childRu: 'Дольше держишься в бою.',
  },
  might: {
    id: 'might',
    nameRu: 'Мощь',
    icon: '⚔',
    childRu: 'Бьёшь сильнее.',
  },
  finesse: {
    id: 'finesse',
    nameRu: 'Сноровка',
    icon: '💨',
    childRu: 'Действуешь чаще и точнее.',
  },
  instinct: {
    id: 'instinct',
    nameRu: 'Чутьё',
    icon: '👁',
    childRu: 'Лучше добыча и удача.',
  },
};

export const BRANCHES: Record<BranchId, NamedBlurb> = {
  health: { id: 'health', nameRu: 'Здоровье', childRu: 'Больше сил держаться на ногах.' },
  armor: { id: 'armor', nameRu: 'Броня', childRu: 'Удары меньше проходят.' },
  will: { id: 'will', nameRu: 'Воля', childRu: 'Яды и страх слабее сбивают с пути.' },
  strike: { id: 'strike', nameRu: 'Удар', childRu: 'Один удар — больнее.' },
  onslaught: { id: 'onslaught', nameRu: 'Натиск', childRu: 'Бьёшь сразу нескольких.' },
  destruction: { id: 'destruction', nameRu: 'Разрушение', childRu: 'Крупным врагам тоже больно.' },
  tempo: { id: 'tempo', nameRu: 'Темп', childRu: 'Делаешь шаги чаще.' },
  evasion: { id: 'evasion', nameRu: 'Уворот', childRu: 'Чаще не попадаешь под удар.' },
  reaction: { id: 'reaction', nameRu: 'Реакция', childRu: 'Успеваешь ответить быстрее.' },
  luck: { id: 'luck', nameRu: 'Удача', childRu: 'Иногда выпадает редкий куш.' },
  resourcefulness: { id: 'resourcefulness', nameRu: 'Находчивость', childRu: 'В сумке чаще лежит что-то стоящее.' },
  intuition: { id: 'intuition', nameRu: 'Интуиция', childRu: 'Долгий путь учит сильнее.' },
};

/** Подхарактеристики тела. Растут от очка столпа. Это не пассивки на доске. */
export type SubstatId = BranchId;
export const SUBSTAT_IDS = BRANCH_IDS;
export const SUBSTATS = BRANCHES;
export const SUBSTATS_BY_PILLAR = BRANCHES_BY_PILLAR;
export const PILLAR_OF_SUBSTAT = PILLAR_OF_BRANCH;

export const HERO_HELP = {
  body: 'Четыре столпа по сторонам доски. Каждый уровень — одно очко в один столп. Вместе со столпом растут три числа тела, каждое своим шагом: одно очко уже меняет расклад. От столпа идут три луча: ветвь и две глубинные пассивки. Узел качается до трёх рангов; следующий на луче открывается, когда предыдущий выкачан до конца. Очко пассивки приходит на 5, 10, 15 уровне; эффекты ячеек пока не подключены. Потяни доску, чтобы видеть все стороны.',
  gear: 'Манекен героя с надетым снаряжением: броня слева, украшения и руки справа. Под манекеном — сумма характеристик от надетого и до трёх наборов: «Сохранить» запишет текущий экип в пресет, тап по пресету наденет его (лишнее уйдёт в сумку, чего в сумке нет — не трогаем). Снизу — сумка, только снаряжение: тап по предмету открывает карточку со сравнением с надетым — зелёное лучше, красное хуже. Двуручное занимает обе руки: слева та же вещь тусклая.',
  synergies: 'Нить зажигается, когда два столпа доросли до нужных чисел. Нить сами столпы не увеличивает — это отдельный бонус. Пока чисел мало, нить спит и пишет, чего не хватает.',
  path: 'Уровень, сколько очков уже вложено в столпы и пассивки, сколько бесплатных сбросов осталось (два за жизнь). Ниже — все числа тела: столп и три подхарактеристики.',
} as const;

/** Процент к столпу. Сноровка намеренно без расового штрафа. */
export interface RacePillarMod {
  pillar: PillarId;
  /** Доля от базы тела, не очки игрока. +12 = +12%. */
  percent: number;
}

export interface RacePassive {
  id: string;
  nameRu: string;
  childRu: string;
  /** В 5A не симулируется. Честно пишем, когда живёт. */
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
    childRu: 'Очнулся в городе — самый слабый столп чуть подтягивается ненадолго.',
    whenRu: 'После «очнулся в городе», не в спокойном крафте.',
  },
  elf: {
    id: 'grace',
    nameRu: 'Грация',
    childRu: 'Увернулся — чуть возвращается энергия.',
    whenRu: 'В бою. Offline пока не обещаем.',
  },
  dwarf: {
    id: 'tempering',
    nameRu: 'Закалка',
    childRu: 'Каждый полученный удар чуть крепит броню, до потолка, вне боя сбрасывается.',
    whenRu: 'В бою. Offline пока не обещаем.',
  },
  orc: {
    id: 'rage',
    nameRu: 'Ярость',
    childRu: 'Когда сил мало — бьёшь сильнее, но воля падает.',
    whenRu: 'В бою при малом здоровье. Offline пока не обещаем.',
  },
  beastfolk: {
    id: 'predator_sense',
    nameRu: 'Чутьё хищника',
    childRu: 'Свалил сильного зверя — удача вспыхивает ненадолго.',
    whenRu: 'После элиты/босса, короткий срок. Offline пока не обещаем.',
  },
};

export const RACE_BODY_CHILD_RU: Record<AttributeRaceId, string> = {
  human: 'Тело выносливое и быстрое, без врождённой грубой силы. Это не подарок очков — так устроен человек.',
  elf: 'Тело точное и чуткое, но хрупкое. Очков ещё нет — эльф уже такой.',
  dwarf: 'Тело крепкое и сильное, к тонкостям грубовато. Очков ещё нет — гном/дварф уже такой.',
  orc: 'Тело бьёт и спешит, к удаче глуховато. Очков ещё нет — орк уже такой.',
  beastfolk: 'Тело чует добычу и бьёт сильно, но держит удар хуже. Очков ещё нет — зверолюд уже такой.',
};

/**
 * Глубинные пассивки — кольца 2 и 3 доски. По две на каждую ветвь:
 * луч «столп → ветвь → пассивка → пассивка» (решено владельцем 2026-09-02).
 * Эффекты НЕ подключены: в UI честно пишем, что ячейка пока ничего не делает.
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
    nameRu: 'Второе дыхание', childRu: 'Вне боя силы возвращаются сами, хоть и медленно.',
  },
  deep_sleep: {
    id: 'deep_sleep', pillar: 'fortitude', branch: 'health', ring: 2,
    nameRu: 'Крепкий сон', childRu: 'Отдых в таверне поднимает тебя быстрее.',
  },
  buckler: {
    id: 'buckler', pillar: 'fortitude', branch: 'armor', ring: 1,
    nameRu: 'Щиток', childRu: 'Иногда слабый удар отскакивает совсем.',
  },
  bone_shell: {
    id: 'bone_shell', pillar: 'fortitude', branch: 'armor', ring: 2,
    nameRu: 'Костяной панцирь', childRu: 'Самый тяжёлый удар по тебе чуть мягче.',
  },
  steady_spirit: {
    id: 'steady_spirit', pillar: 'fortitude', branch: 'will', ring: 1,
    nameRu: 'Стойкий дух', childRu: 'Страх и яд сбивают тебя слабее.',
  },
  unbroken: {
    id: 'unbroken', pillar: 'fortitude', branch: 'will', ring: 2,
    nameRu: 'Не сломаться', childRu: 'Когда сил осталось мало, держишься крепче.',
  },

  heavy_hand: {
    id: 'heavy_hand', pillar: 'might', branch: 'strike', ring: 1,
    nameRu: 'Тяжёлая рука', childRu: 'Твой сильный удар бьёт ещё больнее.',
  },
  piercing: {
    id: 'piercing', pillar: 'might', branch: 'strike', ring: 2,
    nameRu: 'Пробивание', childRu: 'Часть брони врага ты просто не замечаешь.',
  },
  sweeping: {
    id: 'sweeping', pillar: 'might', branch: 'onslaught', ring: 1,
    nameRu: 'Размашистый', childRu: 'Одним замахом задеваешь и второго.',
  },
  stagger: {
    id: 'stagger', pillar: 'might', branch: 'onslaught', ring: 2,
    nameRu: 'Сбивание', childRu: 'Иногда удар сбивает врага с ног.',
  },
  bone_breaker: {
    id: 'bone_breaker', pillar: 'might', branch: 'destruction', ring: 1,
    nameRu: 'Костолом', childRu: 'Крупным врагам от тебя больнее.',
  },
  finisher: {
    id: 'finisher', pillar: 'might', branch: 'destruction', ring: 2,
    nameRu: 'Добивание', childRu: 'Раненому врагу достаётся сильнее.',
  },

  light_step: {
    id: 'light_step', pillar: 'finesse', branch: 'tempo', ring: 1,
    nameRu: 'Лёгкая поступь', childRu: 'В долгом деле устаёшь реже.',
  },
  nimble: {
    id: 'nimble', pillar: 'finesse', branch: 'tempo', ring: 2,
    nameRu: 'Проворство', childRu: 'Добыча идёт чуть быстрее.',
  },
  shade: {
    id: 'shade', pillar: 'finesse', branch: 'evasion', ring: 1,
    nameRu: 'Тень', childRu: 'В опасном месте чаще остаёшься цел.',
  },
  slip_away: {
    id: 'slip_away', pillar: 'finesse', branch: 'evasion', ring: 2,
    nameRu: 'Ускользание', childRu: 'Увернулся — иногда отвечаешь сразу.',
  },
  flash: {
    id: 'flash', pillar: 'finesse', branch: 'reaction', ring: 1,
    nameRu: 'Миг', childRu: 'Иногда успеваешь сделать лишний шаг.',
  },
  anticipation: {
    id: 'anticipation', pillar: 'finesse', branch: 'reaction', ring: 2,
    nameRu: 'Опережение', childRu: 'Первый удар в бою чаще твой.',
  },

  lucky_break: {
    id: 'lucky_break', pillar: 'instinct', branch: 'luck', ring: 1,
    nameRu: 'Счастливый случай', childRu: 'Редкая добыча выпадает чаще.',
  },
  hoard_sense: {
    id: 'hoard_sense', pillar: 'instinct', branch: 'luck', ring: 2,
    nameRu: 'Чутьё на клад', childRu: 'Стоящая находка попадается чаще.',
  },
  thrifty: {
    id: 'thrifty', pillar: 'instinct', branch: 'resourcefulness', ring: 1,
    nameRu: 'Бережливый', childRu: 'Тратишь меньше припасов на то же дело.',
  },
  knows_value: {
    id: 'knows_value', pillar: 'instinct', branch: 'resourcefulness', ring: 2,
    nameRu: 'Знающий толк', childRu: 'Торговец даёт за вещи чуть больше.',
  },
  nose: {
    id: 'nose', pillar: 'instinct', branch: 'intuition', ring: 1,
    nameRu: 'Нюх', childRu: 'Чуешь заранее, что даст дело.',
  },
  experience: {
    id: 'experience', pillar: 'instinct', branch: 'intuition', ring: 2,
    nameRu: 'Опыт', childRu: 'За каждое дело приходит больше опыта.',
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
