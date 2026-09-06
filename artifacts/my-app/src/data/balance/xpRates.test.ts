import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HERO_LEVEL_CAP } from './substats.ts';
import { HERO_START_LEVEL } from './heroLevel.ts';
import {
  EFFECTIVE_HOURS_TO_CAP,
  HERO_XP_TO_NEXT,
  TOTAL_HERO_XP_TO_CAP,
  XP_PER_EFFECTIVE_HOUR,
  XP_RATES,
  bracketRate,
  heroXpFromAction,
  heroXpMultiplier,
  intuitionXpFactor,
  totalXpToReachLevel,
  xpToNextLevel,
} from './xpRates.ts';

test('таблица: 99 ступеней, сумма 300 000, монотонна', () => {
  assert.equal(HERO_XP_TO_NEXT.length, HERO_LEVEL_CAP - HERO_START_LEVEL);
  assert.equal(HERO_XP_TO_NEXT.reduce((sum, n) => sum + n, 0), TOTAL_HERO_XP_TO_CAP);
  assert.equal(totalXpToReachLevel(HERO_LEVEL_CAP), TOTAL_HERO_XP_TO_CAP);
  assert.equal(totalXpToReachLevel(1), 0);
  assert.equal(xpToNextLevel(HERO_LEVEL_CAP), 0);
  assert.equal(xpToNextLevel(0), 0);
  for (let i = 1; i < HERO_XP_TO_NEXT.length; i += 1) {
    assert.ok(HERO_XP_TO_NEXT[i] >= HERO_XP_TO_NEXT[i - 1], `${i + 1} дешевле предыдущего`);
  }
});

test('бюджет: 300 эфф.ч = 30 дней дедикейтеда @10 эфф.ч', () => {
  assert.equal(EFFECTIVE_HOURS_TO_CAP, 30 * 10);
  assert.equal(TOTAL_HERO_XP_TO_CAP, EFFECTIVE_HOURS_TO_CAP * XP_PER_EFFECTIVE_HOUR);
});

test('нити: ориентиры дней дедикейтеда', () => {
  const daysAt = (level: number) => totalXpToReachLevel(level) / XP_PER_EFFECTIVE_HOUR / 10;
  assert.ok(daysAt(23) >= 2.8 && daysAt(23) <= 3.2, `нить I: ${daysAt(23)}`);
  assert.ok(daysAt(53) >= 9 && daysAt(53) <= 10, `нить II: ${daysAt(53)}`);
  assert.ok(daysAt(88) >= 19 && daysAt(88) <= 20, `нить III: ${daysAt(88)}`);
  assert.ok(daysAt(100) >= 29.9 && daysAt(100) <= 30.1);
  const wallDays = (totalXpToReachLevel(100) - totalXpToReachLevel(97)) / XP_PER_EFFECTIVE_HOUR / 10;
  assert.ok(wallDays >= 4.9 && wallDays <= 5.2, `стена 97–100: ${wallDays}`);
});

test('рейты: профессия 0.35, оффлайн 0.5, ступени 1', () => {
  assert.equal(XP_RATES.global, 1);
  assert.equal(XP_RATES.source.profession, 0.35);
  assert.equal(XP_RATES.offline, 0.5);
  assert.equal(bracketRate(1), 1);
  assert.equal(bracketRate(99), 1);
  assert.equal(heroXpMultiplier({ source: 'combat' }), 1);
  assert.equal(heroXpMultiplier({ source: 'profession' }), 0.35);
  assert.equal(heroXpMultiplier({ source: 'profession', offline: true }), 0.35 * 0.5);
  assert.equal(intuitionXpFactor(0), 1);
  assert.equal(intuitionXpFactor(20), 1.2);
});

test('час боя на рейте 1 даёт XP_PER_EFFECTIVE_HOUR', () => {
  const gained = heroXpFromAction({ durationMs: 3_600_000, source: 'combat' });
  assert.ok(Math.abs(gained - XP_PER_EFFECTIVE_HOUR) < 1e-9);
  const jobHour = heroXpFromAction({ durationMs: 3_600_000, source: 'profession' });
  assert.ok(Math.abs(jobHour - XP_PER_EFFECTIVE_HOUR * 0.35) < 1e-9);
});
