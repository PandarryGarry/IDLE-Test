/**
 * Порты домена — единственная легальная точка, через которую чистая логика
 * (`domain/`) узнаёт что-то из стор zustand.
 *
 * Зачем: `domain/` по закону проекта — чистая логика без React и без сторов,
 * её тестирует `node --test` без установки зависимостей. Раньше
 * `characterAttributes.ts`, `items/index.ts` и `professions/foraging.ts`
 * импортировали `store/*` напрямую — из-за этого `pnpm test:pillars` в голом
 * клоне падал на `Cannot find package 'zustand'`, а «чистота» домена была
 * обещанием, а не фактом.
 *
 * Как работает: стор-адаптеры (`store/adminConfigStore.ts`,
 * `store/professionStatsStore.ts`) вызывают `registerXxx()` в момент импорта.
 * Если их никто не импортировал (юнит-тест столпов, валидатор каталога) —
 * порт остаётся дефолтным: «никаких админ-правок», то есть ровно то
 * поведение, которое и должно быть без админки.
 *
 * Правило расширения: новому коду `domain/` нужен ещё один внешний факт →
 * добавь порт сюда + `registerXxx` в адаптере, а НЕ импорт из `store/`.
 */
import type { Item } from '../data/types.ts';
import type { ProfessionFeed } from '../data/balance/professions.ts';

/** Срез админ-конфига, нужный предметному слою (без множителей ради UI). */
export interface AdminItemSnapshot {
  itemOverrides: Record<string, Partial<Item>>;
  sellPriceMultiplier: number;
}

export interface DomainPorts {
  /** Админ-оверрайды «чем кормит профессия» (столп/проценты). */
  professionFeedOverrides: () => Record<string, Partial<ProfessionFeed>>;
  /** Админ-конфиг предметов: оверрайды + множитель цены продажи. */
  adminItemSnapshot: () => AdminItemSnapshot;
  /** Эффективное значение профессионной статы (кривая + оверрайды). */
  professionStatValue: (skillId: string, statId: string, level?: number) => number;
}

const NO_OVERRIDES: Record<string, never> = {};
const EMPTY_ADMIN_ITEMS: AdminItemSnapshot = {
  itemOverrides: NO_OVERRIDES,
  sellPriceMultiplier: 1,
};

const DEFAULT_PORTS: DomainPorts = {
  professionFeedOverrides: () => NO_OVERRIDES,
  adminItemSnapshot: () => EMPTY_ADMIN_ITEMS,
  professionStatValue: () => 0,
};

let ports: DomainPorts = { ...DEFAULT_PORTS };

export function registerProfessionFeedOverrides(
  fn: DomainPorts['professionFeedOverrides'],
): void {
  ports = { ...ports, professionFeedOverrides: fn };
}

export function registerAdminItemSnapshot(fn: DomainPorts['adminItemSnapshot']): void {
  ports = { ...ports, adminItemSnapshot: fn };
}

export function registerProfessionStatValue(
  fn: DomainPorts['professionStatValue'],
): void {
  ports = { ...ports, professionStatValue: fn };
}

/** Только для тестов: вернуть «пустой» мир без стор-адаптеров. */
export function resetDomainPorts(): void {
  ports = { ...DEFAULT_PORTS };
}

export function getProfessionFeedOverrides(): Record<string, Partial<ProfessionFeed>> {
  return ports.professionFeedOverrides() ?? NO_OVERRIDES;
}

export function getAdminItemSnapshot(): AdminItemSnapshot {
  return ports.adminItemSnapshot() ?? EMPTY_ADMIN_ITEMS;
}

export function getProfessionStatValue(
  skillId: string,
  statId: string,
  level?: number,
): number {
  const value = ports.professionStatValue(skillId, statId, level);
  // Порт обязан вернуть число: NaN из кривой умножился бы на весь снапшот.
  return Number.isFinite(value) ? value : 0;
}
