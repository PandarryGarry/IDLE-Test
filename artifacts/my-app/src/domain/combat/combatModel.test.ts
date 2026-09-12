import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { emptyBranchRanks, type BranchRanks } from '../attributes/attributes.ts';
import { getItem } from '../items/index.ts';
import { COMBAT_INTENTS } from '../../data/balance/combat.ts';
import { COMBAT_AREAS, MONSTERS, MONSTERS_MAP } from './monsters.ts';
import {
  bossPhaseAttackModifiers,
  bossPhaseForHp,
  chooseTarget,
  deriveEnemyCombatStats,
  deriveHeroCombatStats,
  estimateRisk,
  inferMonsterTraits,
  makeIntent,
  nextIntentForMonster,
  prdEffectiveChance,
  resolveAttack,
  type FighterCombatStats,
  type TargetSnapshot,
} from './combatModel.ts';

function branch(overrides: Partial<BranchRanks> = {}): BranchRanks {
  return { ...emptyBranchRanks(), health: 160, strike: 28, armor: 45, will: 20, tempo: 12, evasion: 18, luck: 14, ...overrides };
}

function fixedStats(overrides: Partial<FighterCombatStats> = {}): FighterCombatStats {
  return {
    maxHp: 100,
    damageMin: 10,
    damageMax: 10,
    attackIntervalMs: 2000,
    accuracyPct: 96,
    armorPct: 0,
    willPct: 0,
    armorPenPct: 0,
    evasionPct: 0,
    critChancePct: 0,
    critDamageMultiplier: 1.5,
    onslaughtPct: 0,
    threatScore: 5,
    ...overrides,
  };
}

test('monster ecosystem is explicit: stats, art, abilities, area links and drops are valid', () => {
  const ids = new Set<string>();
  for (const monster of MONSTERS) {
    assert.ok(!ids.has(monster.id), `duplicate monster id: ${monster.id}`);
    ids.add(monster.id);
    assert.ok(monster.description && monster.description.length >= 24, `${monster.id}: missing description`);
    assert.ok(monster.iconPath, `${monster.id}: missing iconPath`);
    assert.ok(monster.role, `${monster.id}: missing role`);
    assert.ok(Array.isArray(monster.traits), `${monster.id}: traits must be explicit array`);
    assert.ok(monster.intentCycle && monster.intentCycle.length > 0, `${monster.id}: missing intent cycle`);
    assert.ok(monster.abilities && monster.abilities.length > 0, `${monster.id}: missing abilities`);
    assert.ok(monster.maxHp > 0 && monster.maxHit > 0 && monster.attackInterval > 0, `${monster.id}: invalid combat stats`);

    const iconFile = fileURLToPath(new URL(`../../../public/assets/icons/${monster.iconPath}.webp`, import.meta.url));
    assert.ok(existsSync(iconFile), `${monster.id}: missing webp icon ${monster.iconPath}`);

    for (const intent of monster.intentCycle) {
      assert.ok(intent in COMBAT_INTENTS, `${monster.id}: bad intent ${intent}`);
    }
    for (const ability of monster.abilities) {
      assert.ok(ability.id && ability.name && ability.description && ability.counterplay, `${monster.id}: incomplete ability ${ability.id}`);
      assert.ok(ability.intent in COMBAT_INTENTS, `${monster.id}: bad ability intent ${ability.intent}`);
    }
    for (const drop of monster.drops) {
      assert.ok(getItem(drop.itemId), `${monster.id}: unknown drop ${drop.itemId}`);
      assert.ok(drop.chance >= 0 && drop.chance <= 1, `${monster.id}: drop chance out of range`);
      assert.ok(drop.quantity[0] > 0 && drop.quantity[1] >= drop.quantity[0], `${monster.id}: invalid drop quantity`);
    }
  }

  for (const area of COMBAT_AREAS) {
    assert.ok(area.monsterIds.length > 0, `${area.id}: empty roster`);
    for (const monsterId of area.monsterIds) {
      const monster = MONSTERS_MAP[monsterId];
      assert.ok(monster, `${area.id}: missing monster ${monsterId}`);
      assert.equal(monster.areaId, area.id, `${monsterId}: area mismatch`);
    }
  }
});

test('monster behavior comes from explicit catalog fields, not id-name heuristics', () => {
  const spider = MONSTERS_MAP.spider!;
  assert.deepEqual(inferMonsterTraits({ ...spider, id: 'renamed_creature' }), spider.traits);
  assert.equal(nextIntentForMonster({ ...spider, id: 'renamed_creature' }, 0).kind, spider.intentCycle?.[0]);
});

test('hero combat stats use the 12-substat model and strategy modifiers', () => {
  const balanced = deriveHeroCombatStats({ substats: branch(), finalPillars: { finesse: 10 }, strategy: 'balanced' });
  const greedy = deriveHeroCombatStats({ substats: branch(), finalPillars: { finesse: 10 }, strategy: 'greedy' });

  assert.equal(balanced.maxHp, 160);
  assert.ok(balanced.damageMin >= 1);
  assert.ok(balanced.damageMax > balanced.damageMin);
  assert.ok(balanced.attackIntervalMs < 2400);
  assert.ok(greedy.damageMax > balanced.damageMax);
});

test('enemy stats preserve catalog identity but add readable traits-derived pressure', () => {
  const spider = MONSTERS_MAP.spider;
  const dragon = MONSTERS_MAP.green_dragon;
  assert.ok(spider && dragon);

  const spiderStats = deriveEnemyCombatStats(spider);
  const dragonStats = deriveEnemyCombatStats(dragon);

  assert.ok(spiderStats.evasionPct > 0);
  assert.ok(dragonStats.maxHp > spiderStats.maxHp);
  assert.ok(dragonStats.armorPenPct > spiderStats.armorPenPct);
});

test('resolveAttack applies armor mitigation and pierce can reduce it', () => {
  let calls = 0;
  const rng = () => (calls++ === 0 ? 0 : 0);
  const attacker = fixedStats();
  const defender = fixedStats({ armorPct: 50, maxHp: 100 });

  const armored = resolveAttack({ attacker, defender, prd: { hitFailures: 0, critFailures: 0, onslaughtFailures: 0 }, rng });
  const pierced = resolveAttack({
    attacker,
    defender,
    prd: { hitFailures: 0, critFailures: 0, onslaughtFailures: 0 },
    rng: () => 0,
    modifiers: { armorPenBonusPct: 50 },
  });

  assert.equal(armored.outcome, 'hit');
  assert.equal(armored.damage, 5);
  assert.ok(pierced.damage > armored.damage);
});

test('pseudo-random chance grows after misses but remains capped', () => {
  const first = prdEffectiveChance(20, 0);
  const later = prdEffectiveChance(20, 3);
  const capped = prdEffectiveChance(90, 8);

  assert.equal(first, 20);
  assert.ok(later > first);
  assert.ok(capped <= 98);
});

test('target priority chooses a sensible enemy for pack combat', () => {
  const intent = makeIntent('strike');
  const targets: TargetSnapshot[] = [
    { instanceId: 'a', hp: 90, maxHp: 100, stats: fixedStats({ armorPct: 5, threatScore: 3 }), attackTimer: 2000, traits: [], intent, alive: true, spawnOrder: 0 },
    { instanceId: 'b', hp: 12, maxHp: 100, stats: fixedStats({ armorPct: 20, threatScore: 2 }), attackTimer: 2000, traits: [], intent, alive: true, spawnOrder: 1 },
    { instanceId: 'c', hp: 80, maxHp: 100, stats: fixedStats({ armorPct: 10, threatScore: 9 }), attackTimer: 200, traits: [], intent, alive: true, spawnOrder: 2 },
  ];

  assert.equal(chooseTarget(targets, 'weakest')?.instanceId, 'b');
  assert.equal(chooseTarget(targets, 'dangerous')?.instanceId, 'c');
  assert.equal(chooseTarget(targets, 'nearest')?.instanceId, 'a');
});

test('risk forecast explains why boss sorties are less idle-safe', () => {
  const hero = deriveHeroCombatStats({ substats: branch(), finalPillars: { finesse: 10 }, strategy: 'balanced' });
  const farm = estimateRisk({ hero, enemies: [MONSTERS_MAP.chicken!], areaId: 'farmlands', heroLevel: 20, strategy: 'balanced', foodStacks: 1 });
  const boss = estimateRisk({ hero, enemies: [MONSTERS_MAP.green_dragon!], areaId: 'dragons_lair', heroLevel: 20, requiredLevel: 100, strategy: 'balanced', foodStacks: 0 });

  assert.ok(boss.score > farm.score);
  assert.equal(boss.label, 'danger');
  assert.ok(boss.reasons.some(reason => reason.includes('Босс')));
});

test('boss phases change below HP thresholds and add attack pressure', () => {
  assert.equal(bossPhaseForHp(500, 500), 1);
  assert.equal(bossPhaseForHp(250, 500), 2);
  assert.equal(bossPhaseForHp(100, 500), 3);
  assert.ok((bossPhaseAttackModifiers(3).damageMultiplier ?? 1) > (bossPhaseAttackModifiers(2).damageMultiplier ?? 1));
});
