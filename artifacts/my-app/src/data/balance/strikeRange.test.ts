import assert from 'node:assert/strict';
import { test } from 'node:test';
import { STRIKE_RANGE_FRACTION, formatStrikeRange, strikeRange } from './strikeRange.ts';

test('диапазон всегда min < max и не уже 1', () => {
  for (const strike of [0, 1, 10, 14.4, 50, 164]) {
    const { min, max } = strikeRange(strike);
    assert.ok(min >= 1, String(strike));
    assert.ok(max > min, `${strike}: ${min}–${max}`);
  }
});

test('разброс растёт с Ударом, не ±2', () => {
  const low = strikeRange(14.4);
  const high = strikeRange(164);
  assert.ok(high.max - high.min > low.max - low.min);
  assert.ok(high.max - high.min > 4, 'на сильном ударе шире четырёх');
  assert.equal(STRIKE_RANGE_FRACTION, 0.15);
});

test('человек 1 ур. (~14.4) даёт читаемый диапазон', () => {
  assert.equal(formatStrikeRange(14.4), '12–17');
});
