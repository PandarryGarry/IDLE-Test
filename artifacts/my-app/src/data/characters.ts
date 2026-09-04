/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          AETHELIA RPG — ПЕРСОНАЖИ, РАСЫ, АВАТАРЫ            ║
 * ║                                                              ║
 * ║  Расы (5), матрица столпов 2+/1−, аватары (30 = 5×6).        ║
 * ║  Старый StatKey (Сила/Магия/…) не действует и не суммируется.║
 * ╚══════════════════════════════════════════════════════════════╝
 */
import { iconUrl, prefetchImage } from '@/lib/assetUrl';
import { RACE_PILLAR_MODS, type RacePillarMod } from './attributes';

export type RaceId = 'human' | 'elf' | 'dwarf' | 'orc' | 'beastfolk';

export interface Race {
  id: RaceId;
  nameRu: string;
  nameEn: string;
  /** Краткое описание для карточки расы. */
  blurbRu: string;
  blurbEn: string;
  /** Канон Этапа 5: два плюса и один минус к столпам. */
  pillarMods: readonly RacePillarMod[];
}

export const RACES: Race[] = [
  {
    id: 'human',
    nameRu: 'Человек',
    nameEn: 'Human',
    blurbRu: 'Прирождённые искатели приключений — выносливы и быстры.',
    blurbEn: 'Born adventurers — hardy and quick.',
    pillarMods: RACE_PILLAR_MODS.human,
  },
  {
    id: 'elf',
    nameRu: 'Эльф',
    nameEn: 'Elf',
    blurbRu: 'Точные и чуткие жители древних лесов — тело хрупкое.',
    blurbEn: 'Precise, keen dwellers of the ancient forests — fragile of body.',
    pillarMods: RACE_PILLAR_MODS.elf,
  },
  {
    id: 'dwarf',
    nameRu: 'Дварф',
    nameEn: 'Dwarf',
    blurbRu: 'Крепкие горняки и кузнецы, ценящие камень и металл.',
    blurbEn: 'Sturdy miners and smiths who value stone and metal.',
    pillarMods: RACE_PILLAR_MODS.dwarf,
  },
  {
    id: 'orc',
    nameRu: 'Орк',
    nameEn: 'Orc',
    blurbRu: 'Могучие воины с натиском, к тонкостям удачи глуховаты.',
    blurbEn: 'Mighty warriors of onslaught, deaf to fine luck.',
    pillarMods: RACE_PILLAR_MODS.orc,
  },
  {
    id: 'beastfolk',
    nameRu: 'Зверолюд',
    nameEn: 'Beastfolk',
    blurbRu: 'Дикие охотники: чутьё и сила, тело держит удар хуже.',
    blurbEn: 'Wild hunters: instinct and might, a body that holds less.',
    pillarMods: RACE_PILLAR_MODS.beastfolk,
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

/**
 * Версия деривативов манекенов: ?v=… принудительно обновляет файлы
 * в кэше браузеров (превью/телефоны видят новые картинки без очистки).
 */
const DOLL_ASSET_VERSION = 2;

/**
 * Манекен тела по avatarId — одна-в-одну:
 * 'human_male_01' → paper_dolls/bodies/human_male_01 (WebP 384×384).
 */
export function getDollPath(avatarId: string): string {
  return `${iconUrl(`characters/paper_dolls/bodies/${avatarId}`)}?v=${DOLL_ASSET_VERSION}`;
}

/**
 * 2x-версия манекена (768×768, WebP) — для Retina: браузер уменьшает
 * её до нужного размера вместо растяжения 384px (шум у края не
 * увеличивается, контур остаётся чистым).
 */
export function getDollPath2x(avatarId: string): string {
  return `${iconUrl(`characters/paper_dolls/bodies/${avatarId}@2x`)}?v=${DOLL_ASSET_VERSION}`;
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
