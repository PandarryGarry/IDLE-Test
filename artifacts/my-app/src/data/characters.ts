/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          AETHELIA RPG — ПЕРСОНАЖИ, РАСЫ, АВАТАРЫ            ║
 * ║                                                              ║
 * ║  Здесь описаны: расы (5), их бонусы (структура «2+ / 1−»),   ║
 * ║  привязка аватаров (30 = 5 рас × 6) и утилиты путей.         ║
 * ║  Конкретные числа статов настраиваются ПОЗЖЕ, когда появится ║
 * ║  система характеристик. Сейчас бонусы — только структура.    ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
import { iconUrl, prefetchImage } from '@/lib/assetUrl';

export type RaceId = 'human' | 'elf' | 'dwarf' | 'orc' | 'beastfolk';

/** Имена потенциальных характеристик/бонусов (структура, не формулы). */
export type StatKey =
  | 'hitpoints'   // Здоровье
  | 'strength'    // Сила
  | 'defence'     // Защита
  | 'agility'     // Уворот / ловкость
  | 'luck'        // Удача
  | 'magic'       // Магия
  | 'intellect';  // Интеллект / крафт

export interface RaceBonus {
  stat: StatKey;
  /** Положительный («+») или отрицательный («−») бонус. */
  positive: boolean;
  /** Черновое числовое значение (настраивается позже). */
  value: number;
}

export const STAT_LABELS_RU: Record<StatKey, string> = {
  hitpoints: 'Здоровье',
  strength: 'Сила',
  defence: 'Защита',
  agility: 'Уворот',
  luck: 'Удача',
  magic: 'Магия',
  intellect: 'Интеллект',
};

export const STAT_LABELS_EN: Record<StatKey, string> = {
  hitpoints: 'Health',
  strength: 'Strength',
  defence: 'Defence',
  agility: 'Evasion',
  luck: 'Luck',
  magic: 'Magic',
  intellect: 'Intellect',
};

export interface Race {
  id: RaceId;
  nameRu: string;
  nameEn: string;
  /** Краткое описание для карточки расы. */
  blurbRu: string;
  blurbEn: string;
  bonuses: RaceBonus[]; // 2 positive + 1 negative
}

export const RACES: Race[] = [
  {
    id: 'human',
    nameRu: 'Человек',
    nameEn: 'Human',
    blurbRu: 'Прирождённые искатели приключений — универсальны и удачливы.',
    blurbEn: 'Born adventurers — versatile and lucky.',
    bonuses: [
      { stat: 'luck', positive: true, value: 5 },
      { stat: 'intellect', positive: true, value: 3 },
      { stat: 'magic', positive: false, value: 3 },
    ],
  },
  {
    id: 'elf',
    nameRu: 'Эльф',
    nameEn: 'Elf',
    blurbRu: 'Изящные и магически одарённые жители древних лесов.',
    blurbEn: 'Graceful, magically gifted dwellers of the ancient forests.',
    bonuses: [
      { stat: 'magic', positive: true, value: 6 },
      { stat: 'agility', positive: true, value: 4 },
      { stat: 'strength', positive: false, value: 3 },
    ],
  },
  {
    id: 'dwarf',
    nameRu: 'Дварф',
    nameEn: 'Dwarf',
    blurbRu: 'Крепкие горняки и кузнецы, ценящие камень и металл.',
    blurbEn: 'Sturdy miners and smiths who value stone and metal.',
    bonuses: [
      { stat: 'defence', positive: true, value: 6 },
      { stat: 'strength', positive: true, value: 3 },
      { stat: 'agility', positive: false, value: 3 },
    ],
  },
  {
    id: 'orc',
    nameRu: 'Орк',
    nameEn: 'Orc',
    blurbRu: 'Могучие воины с огромной живучестью, но вспыльчивым нравом.',
    blurbEn: 'Mighty warriors with great vitality, but a hot temper.',
    bonuses: [
      { stat: 'strength', positive: true, value: 7 },
      { stat: 'hitpoints', positive: true, value: 6 },
      { stat: 'magic', positive: false, value: 5 },
    ],
  },
  {
    id: 'beastfolk',
    nameRu: 'Зверолюд',
    nameEn: 'Beastfolk',
    blurbRu: 'Быстрые и хитрые оборотни из диких земель.',
    blurbEn: 'Swift, cunning shapeshifters from the wilds.',
    bonuses: [
      { stat: 'agility', positive: true, value: 6 },
      { stat: 'luck', positive: true, value: 3 },
      { stat: 'intellect', positive: false, value: 4 },
    ],
  },
];

export const RACE_MAP: Record<RaceId, Race> = Object.fromEntries(
  RACES.map(r => [r.id, r]),
) as Record<RaceId, Race>;

// ── Аватары ──────────────────────────────────────────────────────
export const AVATAR_GENDERS = ['male', 'female'] as const;
export type AvatarGender = (typeof AVATAR_GENDERS)[number];

export const AVATAR_PER_RACE = 6; // 2 пола × 3

/**
 * Собирает список avatarId для расы в порядке показов:
 * male_01..03, female_01..03.
 */
export function getAvatarsForRace(raceId: RaceId): string[] {
  const ids: string[] = [];
  for (const g of AVATAR_GENDERS) {
    for (let i = 1; i <= 3; i++) {
      ids.push(`${raceId}_${g}_${String(i).padStart(2, '0')}`);
    }
  }
  return ids;
}

/** Папка в avatars/* по raceId. */
export const RACE_FOLDER: Record<RaceId, string> = {
  human: 'humans',
  elf: 'elves',
  dwarf: 'dwarves',
  orc: 'orcs',
  beastfolk: 'beastfolk',
};

/** Путь к файлу аватара из avatarId ('human_male_01'). */
export function getAvatarPath(avatarId: string): string {
  const raceId = raceIdFromAvatar(avatarId);
  const folder = RACE_FOLDER[raceId] ?? raceId;
  return iconUrl(`characters/avatars/${folder}/${avatarId}`);
}

/** Прогрев в кэш браузера — выбор облика не ждёт сети. */
export function prefetchAvatar(avatarId: string): void {
  prefetchImage(getAvatarPath(avatarId));
}

/** Префикс файла аватара → raceId ('beastfolk_male_01' → 'beastfolk'). */
const AVATAR_PREFIX_TO_RACE: Record<string, RaceId> = {
  human: 'human',
  elf: 'elf',
  dwarf: 'dwarf',
  orc: 'orc',
  beastfolk: 'beastfolk',
  // Старые сейвы/данные могли использовать короткий префикс файлов 'beast_*'.
  beast: 'beastfolk',
};

/** Раса по avatarId (первая часть до '_', с учётом префикса файла). */
export function raceIdFromAvatar(avatarId: string): RaceId {
  const prefix = avatarId.split('_')[0];
  return AVATAR_PREFIX_TO_RACE[prefix] ?? 'human';
}

export function getRaceLabel(raceId: RaceId, lang: 'ru' | 'en'): string {
  const race = RACE_MAP[raceId];
  if (!race) return raceId;
  return lang === 'ru' ? race.nameRu : race.nameEn;
}

export function getRaceBlurb(raceId: RaceId, lang: 'ru' | 'en'): string {
  const race = RACE_MAP[raceId];
  if (!race) return '';
  return lang === 'ru' ? race.blurbRu : race.blurbEn;
}
