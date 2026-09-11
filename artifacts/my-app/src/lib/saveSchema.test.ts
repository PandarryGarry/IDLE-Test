/**
 * Контракт сейва — чистые тесты без стором и без node_modules-зависимостей.
 * Гоняются вместе с `pnpm test:pillars`: `node --experimental-strip-types --test`.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DEFAULT_GAME_MODE,
  decodeSaveInput,
  encodeSaveJson,
  isFullSaveShape,
  normalizeSaveData,
  parseSaveInput,
} from './saveSchema.ts';

/** Минимальный «полный» сейв. */
function fullSave(overrides: Record<string, unknown> = {}) {
  return {
    version: '1.0.0',
    savedAt: 1_700_000_000_000,
    totalPlayTime: 1234,
    gameMode: 'standard',
    player: {
      skills: { foraging: { level: 7, xp: 100, unlocked: true, mastery: { forest: 12 } } },
      equipment: { weapon: 'sword_steel', helm: null },
    },
    inventory: { items: [{ itemId: 'log_oak', quantity: 3, locked: false, tab: 0 }], gp: 500, maxSlots: 24 },
    game: { activeSkill: 'foraging', activeActionId: 'forest', activeAreaId: null, activeMonsterId: null },
    settings: {},
    ...overrides,
  };
}

test('целой считается пара «герой + сумка»; блок `bank` засчитывается', () => {
  assert.equal(isFullSaveShape(fullSave()), true);
  assert.equal(isFullSaveShape({ player: {} }), false);
  assert.equal(isFullSaveShape({ player: {}, attributes: {} }), false);
  const legacy = fullSave();
  delete (legacy as { inventory?: unknown }).inventory;
  (legacy as { bank?: unknown }).bank = { items: [], gp: 1, maxSlots: 24 };
  assert.equal(isFullSaveShape(legacy), true);
});

test('атрибуты без сумки — НЕ полный сейв, стирать им нечего', () => {
  assert.equal(isFullSaveShape({ attributes: { heroLevel: 10 } }), false);
});

test('gameMode: чужая строка превращается в стандарт, а не в мусор', () => {
  // Раньше фолбэк был `'normal'` — такого значения в типе GameMode нет,
  // и TS не ругался: ветка `??` для необязательного поля невидна для проверки.
  const junk = normalizeSaveData(fullSave({ gameMode: 'normal' }))!;
  assert.equal(junk.gameMode, DEFAULT_GAME_MODE);
  const hardcore = normalizeSaveData(fullSave({ gameMode: 'hardcore' }))!;
  assert.equal(hardcore.gameMode, 'hardcore');
  assert.equal(normalizeSaveData(fullSave({ gameMode: undefined }))!.gameMode, DEFAULT_GAME_MODE);
});

test('максимальная ёмкость сумки: фолбэк = база, а не 40', () => {
  // В старом коде фолбэк сейва был 40 при базовых 24 — герой «находил» 16 мест.
  const noSlots = normalizeSaveData(
    fullSave({ inventory: { items: [], gp: 0 } }),
  )!;
  assert.equal(noSlots.inventory.maxSlots, 24);
  const crazy = normalizeSaveData(
    fullSave({ inventory: { items: [], gp: 0, maxSlots: 10_000_000 } }),
  )!;
  assert.equal(crazy.inventory.maxSlots, 512);
  const tiny = normalizeSaveData(fullSave({ inventory: { items: [], gp: 0, maxSlots: 3 } }))!;
  assert.equal(tiny.inventory.maxSlots, 24);
});

test('NaN и строки в числах не долетают до сторов', () => {
  const out = normalizeSaveData(
    fullSave({
      totalPlayTime: NaN,
      savedAt: 'вчерашний день',
      inventory: { items: [], gp: Number.POSITIVE_INFINITY, maxSlots: 'x' },
    }),
  )!;
  assert.equal(out.totalPlayTime, 0);
  assert.equal(out.savedAt, 0);
  assert.equal(out.inventory.gp, 0);
  assert.equal(out.inventory.maxSlots, 24);
});

test('сумка: пустые и битые записи выпадают, дубли одного id живут', () => {
  const out = normalizeSaveData(
    fullSave({
      inventory: {
        items: [
          { itemId: 'log_oak', quantity: 0, locked: false, tab: 0 },
          { itemId: '', quantity: 5, locked: false, tab: 0 },
          { itemId: null, quantity: 5 },
          'мусор',
          { itemId: 'sword_steel', quantity: 1.9 },
          { itemId: 'sword_steel', quantity: 1 },
          { itemId: 'log_oak', quantity: Number.NaN },
          { itemId: 'log_oak', quantity: 2 ** 40 },
        ],
        gp: 10,
        maxSlots: 24,
      },
    }),
  )!;
  assert.deepEqual(
    out.inventory.items.map(i => [i.itemId, i.quantity]),
    [['sword_steel', 1], ['sword_steel', 1], ['log_oak', 2 ** 40]],
  );
  assert.equal(out.inventory.items[0].tab, 0);
  assert.equal(out.inventory.items[0].locked, false);
});

test('-pathological сумка упирается в жёсткий потолок', () => {
  const items = Array.from({ length: 5000 }, () => ({ itemId: 'log_oak', quantity: 1 }));
  const out = normalizeSaveData(fullSave({ inventory: { items, gp: 0, maxSlots: 512 } }))!;
  assert.equal(out.inventory.items.length, 512);
});

test('навыки: только известные id, уровень не ниже единицы', () => {
  const out = normalizeSaveData(
    fullSave({
      player: {
        skills: {
          foraging: { level: 0, xp: -50, unlocked: false, mastery: { forest: -1, wood: 5 } },
          woodcutting: { level: 99, xp: 99, unlocked: true, mastery: {} },
        },
        equipment: { weapon: 'sword_steel' },
      },
    }),
  )!;
  assert.deepEqual(Object.keys(out.player.skills), ['foraging']);
  assert.equal(out.player.skills.foraging.level, 1);
  assert.equal(out.player.skills.foraging.xp, 0);
  assert.equal(out.player.skills.foraging.unlocked, false);
  assert.deepEqual(out.player.skills.foraging.mastery, { wood: 5 });
});

test('экип: чужие слоты выпадают, значения — только id или null', () => {
  const out = normalizeSaveData(
    fullSave({
      player: {
        skills: {},
        equipment: { weapon: 42, helm: '  ', platebody: 'plate_rune', hackedSlot: 'x' },
      },
    }),
  )!;
  assert.equal(out.player.equipment.weapon, null);
  assert.equal(out.player.equipment.helm, null);
  assert.equal(out.player.equipment.platebody, 'plate_rune');
  assert.equal('hackedSlot' in out.player.equipment, false);
});

test('несколько зон будущего боя не ломают загрузку: неизвестный навык → null', () => {
  const out = normalizeSaveData(
    fullSave({ game: { activeSkill: 'smithing', activeActionId: 'forge' } }),
  )!;
  assert.equal(out.game.activeSkill, null);
  assert.equal(out.game.activeActionId, 'forge');
});

test('полный сейв проходит нормализацию без потерь (round-trip)', () => {
  const source = fullSave();
  const out = normalizeSaveData(source)!;
  assert.equal(out.player.skills.foraging.level, 7);
  assert.equal(out.player.skills.foraging.xp, 100);
  assert.equal(out.player.equipment.weapon, 'sword_steel');
  assert.equal(out.inventory.items[0].itemId, 'log_oak');
  assert.equal(out.inventory.items[0].quantity, 3);
  assert.equal(out.inventory.gp, 500);
  assert.equal(out.totalPlayTime, 1234);
  assert.equal(out.savedAt, 1_700_000_000_000);
});

test('юникод в сейве: base64 не падает, импорт понимает и base64, и голый JSON', () => {
  const json = JSON.stringify(
    fullSave({ gearSets: { version: 1, presets: [{ name: 'Набор 1 ⚔️', equipment: {} }, null, null] } }),
  );
  // Ровно этот кейс валил старый `exportSave()`: btoa() бросает на «Набор 1».
  const encoded = encodeSaveJson(json);
  assert.equal(decodeSaveInput(encoded), json);
  assert.equal(parseSaveInput(encoded)!.gearSets?.presets[0]?.name, 'Набор 1 ⚔️');
  assert.equal(parseSaveInput(json)!.gameMode, 'standard');
});

test('импорт отвергает мусор, а не чинит его молча', () => {
  assert.equal(parseSaveInput(''), null);
  assert.equal(parseSaveInput('не сейв вообще'), null);
  assert.equal(parseSaveInput('{"hello":"world"}'), null);
  assert.equal(parseSaveInput('{}'), null);
  assert.equal(parseSaveInput('[]'), null);
});
