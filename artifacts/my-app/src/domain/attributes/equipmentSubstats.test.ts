import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BRANCH_IDS, type BranchRanks } from './attributes.ts';
import {
  EQUIP_AFFECTED_SUBSTATS,
  EQUIP_SLOT_SUBSTAT_AXES,
  EQUIP_SUBSTAT_SLOTS,
} from '../../data/balance/equipmentSubstats.ts';
import {
  foldBonusesIntoRaw,
  readSlotBonuses,
  sumEquipmentBonuses,
} from './equipmentSubstats.ts';
import type { EquipSlot, Item } from '../../data/types.ts';

function gear(
  id: string,
  slot: EquipSlot,
  substatBonuses?: Item['substatBonuses'],
): Item {
  return {
    id,
    name: id,
    category: slot,
    sellValue: 1,
    canSell: true,
    stackable: false,
    equipSlot: slot,
    substatBonuses,
  };
}

const EMPTY_EQUIP: Partial<Record<EquipSlot, string | null>> = {
  helm: null, platebody: null, platelegs: null, boots: null, gloves: null,
  amulet: null, ring: null, ring2: null, bracelet: null, bracelet2: null, belt: null,
  weapon: null, shield: null, cape: null, quiver: null, passive: null,
};

function lookup(table: Record<string, Item | undefined>) {
  return (itemId: string): Item | undefined => table[itemId];
}

test('профили: у каждого слота есть канон, оси не содержат чужих, скрытые слоты честно пусты', () => {
  const slots = Object.keys(EQUIP_SLOT_SUBSTAT_AXES) as EquipSlot[];
  assert.equal(slots.length, 16, 'все слоты экипа покрыты профилем');
  assert.ok(EQUIP_SUBSTAT_SLOTS.includes('helm'));
  assert.deepEqual(EQUIP_SLOT_SUBSTAT_AXES.weapon, [], 'оружие пока не даёт подхарактеристик');
  assert.deepEqual(EQUIP_SLOT_SUBSTAT_AXES.passive, []);
  // armour-слоты не могут врать про урон/интуицию.
  for (const slot of ['helm', 'platebody', 'boots'] as EquipSlot[]) {
    for (const id of EQUIP_SLOT_SUBSTAT_AXES[slot]) {
      assert.ok(BRANCH_IDS.includes(id), `${slot} ось вне 12`);
    }
  }
  assert.ok(EQUIP_AFFECTED_SUBSTATS.length > 0);
});

test('без экипа итог — нули и пусто', () => {
  const sum = sumEquipmentBonuses(EMPTY_EQUIP, lookup({}));
  for (const id of BRANCH_IDS) assert.equal(sum.totals[id], 0, id);
  assert.equal(Object.keys(sum.bySlot).length, 0);
  assert.equal(sum.dropped.length, 0);
});

test('предмет без бонусов и отсутствующий в lookup — честный ноль', () => {
  const eq: Partial<Record<EquipSlot, string | null>> = {
    ...EMPTY_EQUIP,
    helm: 'plain_helm', // в таблице нет
    platebody: 'no_bonus', // есть, но без substatBonuses
  };
  const sum = sumEquipmentBonuses(eq, lookup({
    no_bonus: gear('no_bonus', 'platebody'),
  }));
  for (const id of BRANCH_IDS) assert.equal(sum.totals[id], 0, id);
  assert.equal(sum.dropped.length, 0);
});

test('шлем складывает бонусы только по своей оси, чужое отбрасывает', () => {
  const item = gear('steel_helm', 'helm', {
    armor: 20, health: 30, will: 5,
    intuition: 999, // не ось шлема
  });
  const { bonuses, dropped } = readSlotBonuses(item, 'helm');
  assert.equal(bonuses.armor, 20);
  assert.equal(bonuses.health, 30);
  assert.equal(bonuses.will, 5);
  assert.equal(bonuses.intuition, undefined);
  assert.equal(dropped.length, 1);
  assert.equal(dropped[0].substat, 'intuition');
  assert.equal(dropped[0].reason, 'не ось слота');
});

test('не-число и бесконечность — dropped, не ломают сумму', () => {
  const item = gear('bad_helm', 'helm', {
    armor: 10,
    health: NaN,
    will: Infinity,
  } as Item['substatBonuses']);
  const { bonuses, dropped } = readSlotBonuses(item, 'helm');
  assert.equal(bonuses.armor, 10);
  assert.ok(dropped.length >= 2);
});

test('суммирование по нескольким слотам (броня по телу)', () => {
  const eq = {
    ...EMPTY_EQUIP,
    helm: 'helm_a', platebody: 'body_b', shield: 'shield_c', ring: 'ring_d',
  };
  const sum = sumEquipmentBonuses(eq, lookup({
    helm_a: gear('helm_a', 'helm', { armor: 20, health: 30 }),
    body_b: gear('body_b', 'platebody', { armor: 40, health: 60 }),
    shield_c: gear('shield_c', 'shield', { armor: 15, will: 10 }),
    ring_d: gear('ring_d', 'ring', { luck: 8, evasion: 5, tempo: 4 }),
  }));
  assert.equal(sum.totals.armor, 75); // 20 + 40 + 15
  assert.equal(sum.totals.health, 90); // 30 + 60
  assert.equal(sum.totals.will, 10);
  assert.equal(sum.totals.luck, 8);
  assert.equal(sum.totals.evasion, 5);
  assert.equal(sum.totals.tempo, 4);
  assert.equal(sum.totals.strike, 0);
  assert.equal(sum.dropped.length, 0);
  assert.deepEqual(sum.bySlot.helm, { armor: 20, health: 30 });
});

test('бонус оружия (пустая ось) всегда отбрасывается — не «врём» про статы тела', () => {
  const eq = { ...EMPTY_EQUIP, weapon: 'sword', helm: 'helm_a' };
  const sum = sumEquipmentBonuses(eq, lookup({
    sword: gear('sword', 'weapon', { strike: 999, tempo: 99 }),
    helm_a: gear('helm_a', 'helm', { armor: 10 }),
  }));
  assert.equal(sum.totals.strike, 0, 'оружие не ложится в Удар сейчас');
  assert.equal(sum.totals.tempo, 0);
  assert.equal(sum.totals.armor, 10);
  assert.equal(sum.dropped.length, 2, 'обе оси оружия помечены как неразрешённые');
});

test('foldBonusesIntoRaw прибавляет добавку к сырому значению (перед показом)', () => {
  const raw = Object.fromEntries(BRANCH_IDS.map((id) => [id, 0])) as BranchRanks;
  raw.armor = 100;
  raw.health = 120;
  const bonuses = Object.fromEntries(BRANCH_IDS.map((id) => [id, 0])) as BranchRanks;
  bonuses.armor = 20;
  bonuses.health = 30;
  const folded = foldBonusesIntoRaw(raw, bonuses);
  assert.equal(folded.armor, 120);
  assert.equal(folded.health, 150);
  assert.equal(folded.luck, 0);
});
