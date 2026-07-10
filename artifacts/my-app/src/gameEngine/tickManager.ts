// Tick manager — drives the game loop using requestAnimationFrame
// All timing uses performance.now() (monotonic) throughout — never Date.now()

import { useGameStore } from '../store/gameStore';
import { useCombatStore } from '../store/combatStore';

const COMBAT_TICK_INTERVAL = 100; // ms — process combat every 100ms
/** Maximum combat ticks simulated per frame to prevent frame-freeze after tab suspension */
const MAX_COMBAT_TICKS_PER_FRAME = 10;

class TickManager {
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private combatAccumulator = 0;
  private running = false;

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTimestamp = performance.now();
    this.scheduleFrame();
  }

  stop() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private scheduleFrame() {
    this.rafId = requestAnimationFrame(this.frame.bind(this));
  }

  private frame(now: number) {
    if (!this.running) return;

    const delta = now - this.lastTimestamp;
    this.lastTimestamp = now;

    // Cap delta to prevent runaway catch-up after tab suspension / sleep.
    // We still update the tick clock with `now`, but limit how many combat
    // iterations we execute to MAX_COMBAT_TICKS_PER_FRAME.
    const clampedDelta = Math.min(delta, COMBAT_TICK_INTERVAL * MAX_COMBAT_TICKS_PER_FRAME);

    // Skill tick — pass performance.now() so gameStore can compare with the
    // same monotonic clock used in startSkillAction.
    useGameStore.getState().tick(now);

    // Combat tick — fixed-rate accumulator, bounded iterations per frame.
    if (useCombatStore.getState().inCombat) {
      this.combatAccumulator += clampedDelta;
      let ticks = 0;
      while (this.combatAccumulator >= COMBAT_TICK_INTERVAL && ticks < MAX_COMBAT_TICKS_PER_FRAME) {
        useCombatStore.getState().tickCombat(COMBAT_TICK_INTERVAL);
        this.combatAccumulator -= COMBAT_TICK_INTERVAL;
        ticks++;
      }
      // Drain any excess so we don't carry a huge accumulator forward.
      if (this.combatAccumulator > COMBAT_TICK_INTERVAL * MAX_COMBAT_TICKS_PER_FRAME) {
        this.combatAccumulator = 0;
      }
    } else {
      this.combatAccumulator = 0;
    }

    this.scheduleFrame();
  }
}

export const tickManager = new TickManager();
