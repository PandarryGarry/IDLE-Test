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
  sheet: 'Каждый уровень даёт 1 очко в один из четырёх столпов. Вместе со столпом растут три числа под ним. Раз в 5 уровней — очко на пассивку. Пассивки ещё не написаны.',
  pillar: 'Очко уровня кладёшь сюда. Три числа ниже растут вместе со столпом.',
  substat: 'Это число тела. Само очко не тратит — растёт, когда качаешь столп.',
  branch: 'Пассивка. Очко на 5, 10, 15 уровне. Эффект каждой ячейки напишем отдельно, сейчас его нет.',
  thread: 'Бонус, если два столпа достаточно большие. Сами столпы не увеличивает.',
  path: 'Уровень героя, сколько очков уже вложено, сколько бесплатных сбросов осталось.',
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

export type PillarRanks = Record<PillarId, number>;
export type BranchRanks = Record<BranchId, number>;

/** Versioned-состояние в characters.save_data.attributes. Без specializationId. */
export interface CharacterAttributeState {
  version: typeof ATTRIBUTE_STATE_VERSION;
  pillarRanks: PillarRanks;
  branchRanks: BranchRanks;
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

export function racePercentFor(raceId: AttributeRaceId, pillar: PillarId): number {
  return RACE_PILLAR_MODS[raceId]?.find(mod => mod.pillar === pillar)?.percent ?? 0;
}
