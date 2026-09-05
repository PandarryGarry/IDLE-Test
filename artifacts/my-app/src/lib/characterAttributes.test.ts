import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ATTRIBUTE_STATE_VERSION,
  PASSIVE_IDS,
  PASSIVES_BY_BRANCH,
  PILLAR_IDS,
  RACE_PILLAR_MODS,
  type AttributeRaceId,
} from '../data/attributes.ts';
import { SYNERGIES } from '../data/synergies.ts';
import {
  BODY_BASE_STUB,
  NODE_RANK_CAP,
  pillarContribution,
} from '../data/balance/pillars.ts';
import { SUBSTATS as SUBSTAT_DEFS } from '../data/balance/substats.ts';
import { earnedBranchPoints, earnedPillarPoints } from '../data/balance/heroLevel.ts';
import {
  attachAttributesToSave,
  computeAttributeSnapshot,
  createDefaultAttributes,
  migrateSaveAttributes,
  respecAttributes,
  spendBranchPoint,
  spendPillarPoint,
  respecBranchRanks,
  respecPillarRanks,
  isNodeUnlocked,
  nodeRank,
} from './characterAttributes.ts';

test('старт: 0 очков, уровень 1, без specializationId', () => {
  const state = createDefaultAttributes();
  assert.equal(state.version, ATTRIBUTE_STATE_VERSION);
  assert.equal(state.heroLevel, 1);
  assert.equal(state.unspentPillarPoints, 0);
  assert.equal(state.unspentBranchPoints, 0);
  assert.equal(state.reputation, 0);
  assert.equal(state.freeRespecsUsed, 0);
  for (const id of PILLAR_IDS) assert.equal(state.pillarRanks[id], 0);
  assert.equal('specializationId' in state, false);
});

test('мигратор: старый save без attributes не трогает инвентарь', () => {
  const oldSave = {
    version: '1.0.0',
    savedAt: 1,
    totalPlayTime: 999,
    player: { skills: { woodcutting: { level: 40 } }, equipment: { helm: 'bronze_helm' } },
    bank: { items: [{ itemId: 'oak_logs', quantity: 12 }], gp: 50, maxSlots: 30 },
  };
  const hydrated = attachAttributesToSave(oldSave);
  assert.equal(hydrated.totalPlayTime, 999);
  assert.equal(hydrated.bank.gp, 50);
  assert.equal(hydrated.player.equipment.helm, 'bronze_helm');
  assert.equal(hydrated.player.skills.woodcutting.level, 40);
  assert.equal(hydrated.attributes.unspentPillarPoints, 0);
  assert.equal(hydrated.attributes.heroLevel, 1);
});

test('мигратор: мусор и specializationId отбрасываются', () => {
  const migrated = migrateSaveAttributes({
    version: 0,
    specializationId: 'hunter',
    pillarRanks: { fortitude: -9, might: 3.7, unknown: 99 },
    unspentPillarPoints: -4,
    reputation: 500,
    energy: { current: 999, max: 10 },
  });
  assert.equal(migrated.pillarRanks.fortitude, 0);
  assert.equal(migrated.pillarRanks.might, 3);
  assert.equal(migrated.unspentPillarPoints, 0);
  assert.equal(migrated.reputation, 100);
  assert.equal(migrated.energy.current, 10);
  assert.equal('specializationId' in migrated, false);
});

test('кривая: 0 без расы = 1; 50 сильнее следующих 50', () => {
  assert.equal(pillarContribution(0), 1);
  const first50 = pillarContribution(50) - pillarContribution(0);
  const next50 = pillarContribution(100) - pillarContribution(50);
  assert.ok(first50 > next50);
  assert.ok(pillarContribution(150) > pillarContribution(100));
});

test('0 очков: расы различаются; % от базы тела', () => {
  const state = createDefaultAttributes();
  const human = computeAttributeSnapshot({ state, raceId: 'human' });
  const elf = computeAttributeSnapshot({ state, raceId: 'elf' });
  assert.equal(human.finalPillars.fortitude, BODY_BASE_STUB * 0.12);
  assert.equal(elf.finalPillars.finesse, BODY_BASE_STUB * 0.15);
  assert.equal(elf.finalPillars.fortitude, BODY_BASE_STUB * -0.15);
  assert.notEqual(human.finalPillars.fortitude, elf.finalPillars.fortitude);
  assert.ok(human.contributions.fortitude > 1);
  assert.ok(elf.contributions.fortitude < 1);
});

test('сноровка без расового штрафа у всех пяти рас', () => {
  for (const [raceId, mods] of Object.entries(RACE_PILLAR_MODS) as [AttributeRaceId, typeof RACE_PILLAR_MODS.human][]) {
    const finesse = mods.find(mod => mod.pillar === 'finesse');
    if (finesse) assert.ok(finesse.percent >= 0, raceId);
    const penalties = mods.filter(mod => mod.percent < 0);
    assert.equal(penalties.length, 1);
    assert.equal(mods.filter(mod => mod.percent > 0).length, 2);
    assert.notEqual(penalties[0]?.pillar, 'finesse');
  }
});

test('очки: +1 столп/уровень; ветвь на 5/10', () => {
  assert.equal(earnedPillarPoints(1), 0);
  assert.equal(earnedPillarPoints(2), 1);
  assert.equal(earnedPillarPoints(10), 9);
  assert.equal(earnedBranchPoints(4), 0);
  assert.equal(earnedBranchPoints(5), 1);
  assert.equal(earnedBranchPoints(10), 2);
});

test('синергии по итоговым столпам, без изменения числа столпа', () => {
  const state = createDefaultAttributes();
  state.pillarRanks.fortitude = 50;
  state.pillarRanks.might = 30;
  const snap = computeAttributeSnapshot({ state, raceId: 'dwarf' });
  assert.ok(snap.activeSynergies.includes('solid_strike'));
  const before = snap.finalPillars.fortitude;
  assert.equal(computeAttributeSnapshot({ state, raceId: 'dwarf' }).finalPillars.fortitude, before);
  const need = SYNERGIES.find(s => s.id === 'solid_strike');
  assert.ok(need);
  const low = createDefaultAttributes();
  const empty = computeAttributeSnapshot({ state: low, raceId: 'human' });
  assert.equal(empty.activeSynergies.length, 0);
  assert.ok(empty.nextSynergy);
});

test('профессии в 5A не добавляют выдуманный %', () => {
  const state = createDefaultAttributes();
  const snap = computeAttributeSnapshot({
    state,
    raceId: 'human',
    professionLevels: { woodcutting: 99, mining: 99, fishing: 99 },
  });
  assert.equal(snap.professionBonus.fortitude, 0);
  assert.equal(snap.professionBonus.might, 0);
});

test('трата очка и бесплатный respec', () => {
  let state = createDefaultAttributes();
  state = { ...state, unspentPillarPoints: 1, unspentBranchPoints: 1 };
  const afterPillar = spendPillarPoint(state, 'finesse');
  assert.ok(afterPillar);
  assert.equal(afterPillar.unspentPillarPoints, 0);
  assert.equal(afterPillar.pillarRanks.finesse, 1);
  const afterBranch = spendBranchPoint(afterPillar, { kind: 'branch', id: 'tempo' });
  assert.ok(afterBranch);
  const reset = respecAttributes(afterBranch);
  assert.ok(reset);
  assert.equal(reset.pillarRanks.finesse, 0);
  assert.equal(reset.branchRanks.tempo, 0);
  assert.equal(reset.unspentPillarPoints, 1);
  assert.equal(reset.unspentBranchPoints, 1);
  assert.equal(reset.freeRespecsUsed, 1);
  const again = spendPillarPoint(reset, 'might');
  assert.ok(again);
  const second = respecAttributes(again);
  assert.ok(second);
  assert.equal(second.freeRespecsUsed, 2);
  assert.equal(respecAttributes(second), null);
});

test('ветка не качает столп; подхарактеристики растут от очка столпа', () => {
  let state = createDefaultAttributes();
  state = { ...state, unspentPillarPoints: 1, unspentBranchPoints: 1 };
  const start = computeAttributeSnapshot({ state, raceId: 'human' });
  const afterBranch = spendBranchPoint(state, { kind: 'branch', id: 'health' });
  assert.ok(afterBranch);
  const branched = computeAttributeSnapshot({ state: afterBranch, raceId: 'human' });
  assert.equal(branched.finalPillars.fortitude, start.finalPillars.fortitude);
  const afterPillar = spendPillarPoint(state, 'fortitude');
  assert.ok(afterPillar);
  const grown = computeAttributeSnapshot({ state: afterPillar, raceId: 'human' });
  assert.equal(grown.finalPillars.fortitude, start.finalPillars.fortitude + 1);
  assert.equal(grown.substats.health - start.substats.health, SUBSTAT_DEFS.health.perPillar);
  assert.ok(Math.abs(grown.substats.armor - start.substats.armor - SUBSTAT_DEFS.armor.perPillar) < 1e-9);
  assert.notEqual(grown.substats.health, grown.finalPillars.fortitude);
  assert.notEqual(grown.substats.health, grown.substats.armor);
});

test('сброс столпов и ветвей раздельно, каждый тратит один бесплатный', () => {
  let state = createDefaultAttributes();
  state = {
    ...state,
    unspentPillarPoints: 1,
    unspentBranchPoints: 1,
  };
  const afterPillar = spendPillarPoint(state, 'might');
  assert.ok(afterPillar);
  const afterBranch = spendBranchPoint(afterPillar, { kind: 'branch', id: 'tempo' });
  assert.ok(afterBranch);
  const resetPillars = respecPillarRanks(afterBranch);
  assert.ok(resetPillars);
  assert.equal(resetPillars.pillarRanks.might, 0);
  assert.equal(resetPillars.branchRanks.tempo, 1);
  assert.equal(resetPillars.unspentPillarPoints, 1);
  assert.equal(resetPillars.freeRespecsUsed, 1);
  const resetBranches = respecBranchRanks(resetPillars);
  assert.ok(resetBranches);
  assert.equal(resetBranches.branchRanks.tempo, 0);
  assert.equal(resetBranches.unspentBranchPoints, 1);
  assert.equal(resetBranches.freeRespecsUsed, 2);
  assert.equal(respecPillarRanks(resetBranches), null);
});

test('пассивки: старт в нуле, сброс чистит и их', () => {
  const state = createDefaultAttributes();
  for (const id of PASSIVE_IDS) assert.equal(state.passiveRanks[id], 0);
});

test('луч: пассивка открывается только после полной ветви', () => {
  let state = createDefaultAttributes();
  state = { ...state, unspentBranchPoints: 9 };
  const [ring1, ring2] = PASSIVES_BY_BRANCH.health;
  const deep1 = { kind: 'passive', id: ring1 } as const;
  const deep2 = { kind: 'passive', id: ring2 } as const;
  const root = { kind: 'branch', id: 'health' } as const;

  assert.equal(isNodeUnlocked(state, root), true);
  assert.equal(isNodeUnlocked(state, deep1), false);
  assert.equal(spendBranchPoint(state, deep1), null);

  for (let i = 0; i < NODE_RANK_CAP; i += 1) {
    const next = spendBranchPoint(state, root);
    assert.ok(next);
    state = next;
  }
  assert.equal(nodeRank(state, root), NODE_RANK_CAP);
  assert.equal(isNodeUnlocked(state, deep1), true);
  assert.equal(isNodeUnlocked(state, deep2), false);
  assert.equal(spendBranchPoint(state, deep2), null);

  const onDeep = spendBranchPoint(state, deep1);
  assert.ok(onDeep);
  state = onDeep;
  assert.equal(nodeRank(state, deep1), 1);
  assert.equal(state.unspentBranchPoints, 5);

  const capped = spendBranchPoint({ ...state, unspentBranchPoints: 9 }, root);
  assert.equal(capped, null, 'потолок ранга узла');
});

test('мигратор: сейв без passiveRanks не ломается', () => {
  const migrated = migrateSaveAttributes({
    branchRanks: { health: 2 },
    passiveRanks: { [PASSIVES_BY_BRANCH.health[0]]: 5 },
  });
  assert.equal(migrated.branchRanks.health, 2);
  assert.equal(migrated.passiveRanks[PASSIVES_BY_BRANCH.health[0]], NODE_RANK_CAP);
  assert.equal(migrated.passiveRanks[PASSIVES_BY_BRANCH.tempo[1]], 0);
});
