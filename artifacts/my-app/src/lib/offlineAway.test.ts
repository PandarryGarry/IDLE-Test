import assert from 'node:assert/strict';
import { test } from 'node:test';
import { awayDurationMs } from './offlineAway.ts';

test('оффлайн: нет штампов — 0', () => {
  assert.equal(awayDurationMs(1000, []), 0);
  assert.equal(awayDurationMs(1000, [0, NaN, -5]), 0);
});

test('оффлайн: берём самый свежий уход', () => {
  assert.equal(awayDurationMs(10_000, [1000, 4000, 2000]), 6000);
});

test('оффлайн: будущее не считается', () => {
  assert.equal(awayDurationMs(10_000, [20_000, 1000]), 9000);
});
