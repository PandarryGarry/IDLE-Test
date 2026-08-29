/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║        onboardingStory — «дорога» героя как одна история    ║
 * ║                                                             ║
 * ║  Первый запуск: руна-карточка → ПРОЛОГ (континент →        ║
 * ║  город → двери) → заставка (вход в таверну) → auth.        ║
 * ║  Повторный вход с устройства: сразу заставка → auth.       ║
 * ║                                                             ║
 * ║  Тексты — рабочий черновик v3 (утверждённые владельцем     ║
 * ║  имена: город Вороний Брод, таверна «Топор и Перо»);       ║
 * ║  точечная правка возможна после живого просмотра.          ║
 * ║                                                             ║
 * ║  Канон мира: ЭТЕЛИЯ — КОНТИНЕНТ (не город). Путник          ║
 * ║  приходит с нуля; прошлое остаётся за кадром и не влияет   ║
 * ║  на игру. Последние монеты уходят на ужин и кров в          ║
 * ║  «Топоре и Пере» — отсюда честный нулевой старт кошелька.  ║
 * ║                                                             ║
 * ║  {name} в тексте — имя активного героя (подставляется       ║
 * ║  в момент показа сцены).                                    ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

export interface StoryBeat {
  id: string;
  /** Полный арт бита (object-fit: cover, поэтому один широкий кадр на все экраны). */
  image: string;
  /** Точка фокуса арта (object-position) — чтобы соседние биты на одном арте отличались. */
  imagePosition?: string;
  eyebrow: string;
  title: string;
  body: string;
  /** Подпись финальной кнопки бита; на промежуточных битах — «Далее». */
  action?: string;
}

/* ── ПОЛНЫЙ ПРОЛОГ — первому игроку на устройстве, ДО заставки ──── */

/**
 * Арты ①②③ (континент, тракт с путником, город) утверждены владельцем
 * 2026-08-29 (версия 2, живописная) и лежат в public/assets/art/.
 */
export const FULL_PROLOGUE_READY = true;

export const PROLOGUE_FULL: StoryBeat[] = [
  {
    id: 'prologue-continent',
    image: '/assets/art/prologue_continent_dawn.webp',
    eyebrow: 'ПРОЛОГ · КОНТИНЕНТ ЭТЕЛИЯ',
    title: 'Этелия не спрашивает о прошлом.',
    body: 'Континент, куда приходят начинать заново. Здесь ценят не родословную — здесь ценят руки, упорство и удачу.',
  },
  {
    id: 'prologue-rumors',
    image: '/assets/art/prologue_continent_dawn.webp',
    imagePosition: '38% 42%',
    eyebrow: 'ПРОЛОГ · МОЛВА',
    title: 'Говорят, здесь начинается новая жизнь.',
    body: 'В портах и на трактах шепчутся: за городскими стенами — леса, полные зверя, и руды, за которые платят золотом. Кому-то хватает смелости вернуться с добычей.',
  },
  {
    id: 'prologue-wanderer',
    image: '/assets/art/prologue_wanderer_road.webp',
    eyebrow: 'ПРОЛОГ · ПУТНИК',
    title: 'Ты оставил позади больше, чем вещи.',
    body: 'У каждого, кто идёт в Этелию, есть своя причина. Твоя осталась с тобой. Здесь это никого не удивляет — здесь все начинали с нуля.',
  },
  {
    id: 'prologue-city',
    image: '/assets/art/prologue_city_gates.webp',
    eyebrow: 'ПРОЛОГ · ВОРОНИЙ БРОД',
    title: 'Дорога приводит в Вороний Брод.',
    body: 'Дым над крышами, стук подков, голос последних торговцев. Городу всё равно, кто ты. Ему интересно, кем ты станешь.',
  },
  {
    id: 'prologue-tavern',
    image: '/assets/art/prologue_city_gates.webp',
    imagePosition: '68% 58%',
    eyebrow: 'ПРОЛОГ · «ТОПОР И ПЕРО»',
    title: 'Свет. Тепло. Скрип старой вывески.',
    body: 'Таверна «Топор и Перо» — первое место, где путнику не задают вопросов. Говорят, отсюда начинали все, кто стал в Этелии кем-то.',
  },
  {
    id: 'prologue-doors',
    image: '/assets/art/cutscene_tavern_entrance.webp',
    eyebrow: 'ПРОЛОГ · ПОРОГ',
    title: 'Толкни дверь.',
    body: 'Усталость и голод сильнее осторожности: за этой дверью — огонь очага, горячий ужин и кров. Монет осталось ровно столько, сколько нужно.',
    action: 'Войти в таверну',
  },
];

/* ── СВЯЗКА В ЛОЖУ — после принятия правил ──────────────────────── */

export const LODGE_CONNECT: StoryBeat[] = [
  {
    id: 'lodge-intro',
    image: '/assets/art/character_creation_lodge.webp',
    eyebrow: 'ПОСЛЕ ПРАВИЛ · ДАЛЬНЯЯ ЛОЖА',
    title: 'Трактирщик приводит тебя в ложу.',
    body: '«Отдыхай, путник, — говорит он. — Утром Этелия спросит, кто ты. Успей ответить себе первым».',
    action: 'Осмотреться',
  },
];

/* ── ВЫХОД НОВОГО ГЕРОЯ — после создания персонажа ──────────────── */

export const DEPARTURE_NEW_HERO: StoryBeat[] = [
  {
    id: 'departure-threshold',
    image: '/assets/art/cutscene_character_departure.webp',
    eyebrow: 'ПЕРВЫЙ ШАГ · ПОРОГ',
    title: 'Утро. Двери «Топора и Пера» открыты в город.',
    body: 'Вчерашние монеты остались трактирщику — ужин и кров стоят недёшево. Зато путь назад стал путём вперёд: у тебя есть имя, лицо и дело.',
  },
  {
    id: 'departure-name',
    image: '/assets/art/cutscene_character_departure.webp',
    imagePosition: '42% 40%',
    eyebrow: 'ПЕРВЫЙ ШАГ · ИМЯ',
    title: 'Отныне тебя зовут {name}.',
    body: 'Вороний Брод запомнит это имя — если ты дашь ему причину.',
  },
  {
    id: 'departure-first-step',
    image: '/assets/art/prologue_city_gates.webp',
    eyebrow: 'ПЕРВЫЙ ШАГ · ЭТЕЛИЯ',
    title: 'Первый шаг — за порог.',
    body: 'Ремёсла, опасности и истории, которые станут твоими. Этелия ждёт.',
    action: 'Навстречу Этелии',
  },
];

/* ── ВЫХОД ВОЗВРАЩАЮЩЕГОСЯ ГЕРОЯ — после выбора персонажа ────────── */

export const DEPARTURE_RETURNING: StoryBeat[] = [
  {
    id: 'departure-returning',
    image: '/assets/art/cutscene_character_departure.webp',
    eyebrow: 'ВОЗВРАЩЕНИЕ',
    title: 'Снова в путь, {name}.',
    body: '«Топор и Перо» помнит тебя. Вороний Брод ждёт продолжения истории.',
    action: 'Вернуться в Этелию',
  },
];

/* ── Утилиты ────────────────────────────────────────────────────── */

/** Уникальные арты истории — для предзагрузки перед показом. */
export function collectBeatImages(beats: StoryBeat[]): string[] {
  return Array.from(new Set(beats.map((beat) => beat.image)));
}

/** Подставляет имя героя в тексты битов ({name}). */
export function interpolateBeats(beats: StoryBeat[], name: string): StoryBeat[] {
  const hero = name.trim() || 'Безымянный путник';
  return beats.map((beat) => ({
    ...beat,
    title: beat.title.replace('{name}', hero),
    body: beat.body.replace('{name}', hero),
    action: beat.action?.replace('{name}', hero),
  }));
}
