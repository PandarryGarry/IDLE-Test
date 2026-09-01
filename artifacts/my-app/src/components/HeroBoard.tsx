import { useEffect, useRef, type PointerEvent } from 'react';
import {
  BRANCHES,
  BRANCHES_BY_PILLAR,
  PILLARS,
  type BranchId,
  type PillarId,
} from '@/data/attributes';
import { BRANCH_ICON, PILLAR_ICON } from '@/data/attributeIcons';
import type { computeAttributeSnapshot } from '@/lib/characterAttributes';

type Arm = 'north' | 'south' | 'west' | 'east';
type Snapshot = ReturnType<typeof computeAttributeSnapshot>;

const WORLD = 720;
const CX = 360;
const CY = 360;
const PILLAR_D = 70;
const RING_GAP = [84, 82, 82] as const;
const SPREAD = [80, 98, 114] as const;
const MIN_SCALE = 0.52;
const MAX_SCALE = 1.65;
const CLICK_PX = 8;

const ARMS: { arm: Arm; pillar: PillarId; dir: [number, number]; perp: [number, number] }[] = [
  { arm: 'north', pillar: 'fortitude', dir: [0, -1], perp: [1, 0] },
  { arm: 'west', pillar: 'might', dir: [-1, 0], perp: [0, 1] },
  { arm: 'east', pillar: 'finesse', dir: [1, 0], perp: [0, 1] },
  { arm: 'south', pillar: 'instinct', dir: [0, 1], perp: [1, 0] },
];

function pillarPos(arm: (typeof ARMS)[number]): [number, number] {
  return [CX + arm.dir[0] * PILLAR_D, CY + arm.dir[1] * PILLAR_D];
}

function ringPos(arm: (typeof ARMS)[number], ring: number, slot: number): [number, number] {
  let along = PILLAR_D;
  for (let i = 0; i <= ring; i += 1) along += RING_GAP[i];
  const across = (slot - 1) * SPREAD[ring];
  return [
    CX + arm.dir[0] * along + arm.perp[0] * across,
    CY + arm.dir[1] * along + arm.perp[1] * across,
  ];
}

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

export function HeroBoard({
  snapshot, canSpendBranch, onOpenPillar, onOpenBranch,
}: {
  snapshot: Snapshot;
  canSpendBranch: boolean;
  onOpenPillar: (id: PillarId) => void;
  onOpenBranch: (id: BranchId) => void;
}) {
  const viewRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const tx = useRef(0);
  const ty = useRef(0);
  const scale = useRef(1);
  const drag = useRef<{ id: number; x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);
  const pinch = useRef<{ d: number; scale: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const panned = useRef(false);

  const apply = () => {
    const el = worldRef.current;
    if (!el) return;
    el.style.transform = `translate(${tx.current}px, ${ty.current}px) scale(${scale.current})`;
  };

  const centerView = (nextScale = 1) => {
    const view = viewRef.current;
    if (!view) return;
    scale.current = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    tx.current = view.clientWidth / 2 - CX * scale.current;
    ty.current = view.clientHeight / 2 - CY * scale.current;
    apply();
  };

  useEffect(() => {
    centerView(1);
    const view = viewRef.current;
    if (!view) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = view.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      const before = scale.current;
      const after = clamp(before * (event.deltaY < 0 ? 1.08 : 0.92), MIN_SCALE, MAX_SCALE);
      const wx = (px - tx.current) / before;
      const wy = (py - ty.current) / before;
      scale.current = after;
      tx.current = px - wx * after;
      ty.current = py - wy * after;
      apply();
    };
    view.addEventListener('wheel', onWheel, { passive: false });
    return () => view.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
    if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      pinch.current = {
        d: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        scale: scale.current,
      };
      drag.current = null;
      return;
    }
    panned.current = false;
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      tx: tx.current,
      ty: ty.current,
      moved: false,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (pointers.current.has(event.pointerId)) {
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
    if (pointers.current.size === 2 && pinch.current) {
      const pts = [...pointers.current.values()];
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (pinch.current.d > 0) {
        scale.current = clamp(pinch.current.scale * (d / pinch.current.d), MIN_SCALE, MAX_SCALE);
        apply();
        panned.current = true;
      }
      return;
    }
    const dnd = drag.current;
    if (!dnd || dnd.id !== event.pointerId) return;
    const dx = event.clientX - dnd.x;
    const dy = event.clientY - dnd.y;
    if (!dnd.moved && Math.hypot(dx, dy) <= CLICK_PX) return;
    dnd.moved = true;
    panned.current = true;
    tx.current = dnd.tx + dx;
    ty.current = dnd.ty + dy;
    apply();
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (drag.current?.id === event.pointerId) drag.current = null;
  };

  const openPillar = (id: PillarId) => {
    if (panned.current) return;
    onOpenPillar(id);
  };
  const openBranch = (id: BranchId) => {
    if (panned.current) return;
    onOpenBranch(id);
  };

  return (
    <div className="hero-sheet">
      <div
        ref={viewRef}
        className="hero-board"
        aria-label="Доска столпов и ветвей"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div ref={worldRef} className="hero-board__world">
          <span className="hero-board__knot" style={{ left: CX, top: CY }} aria-hidden />
          {ARMS.map(arm => {
            const from: [number, number] = [CX, CY];
            const pillar = pillarPos(arm);
            const shown = Math.round(snapshot.finalPillars[arm.pillar]);
            const live = BRANCHES_BY_PILLAR[arm.pillar];
            return (
              <span key={arm.arm}>
                <Road from={from} to={pillar} lit={shown !== 0} />
                {live.map((id, slot) => (
                  <Road
                    key={id}
                    from={pillar}
                    to={ringPos(arm, 0, slot)}
                    lit={(snapshot.state.branchRanks[id] || 0) > 0}
                  />
                ))}
                <BoardNode
                  kind="pillar"
                  x={pillar[0]}
                  y={pillar[1]}
                  src={PILLAR_ICON[arm.pillar]}
                  shown={shown}
                  mark
                  title={PILLARS[arm.pillar].nameRu}
                  lit={shown !== 0}
                  dimmed={false}
                  onOpen={() => openPillar(arm.pillar)}
                />
                {[0, 1, 2].flatMap(ring => [0, 1, 2].map(slot => {
                  const [x, y] = ringPos(arm, ring, slot);
                  if (ring === 0) {
                    const id = live[slot];
                    if (!id) return null;
                    const rank = snapshot.state.branchRanks[id] || 0;
                    const open = rank > 0;
                    return (
                      <BoardNode
                        key={id}
                        kind="branch"
                        x={x}
                        y={y}
                        src={BRANCH_ICON[id]}
                        shown={rank}
                        mark={open}
                        title={BRANCHES[id].nameRu}
                        lit={open}
                        dimmed={!open && !canSpendBranch}
                        onOpen={() => openBranch(id)}
                      />
                    );
                  }
                  return (
                    <span
                      key={`${arm.arm}-void-${ring}-${slot}`}
                      className="hero-node is-void hero-board__node"
                      style={{ left: x, top: y }}
                      aria-hidden
                    />
                  );
                }))}
              </span>
            );
          })}
        </div>
        <button
          type="button"
          className="hero-board__home"
          title="К центру"
          aria-label="К центру доски"
          onPointerDown={event => event.stopPropagation()}
          onClick={() => centerView(1)}
        >
          ⌖
        </button>
      </div>
    </div>
  );
}

function Road({
  from, to, lit,
}: {
  from: [number, number];
  to: [number, number];
  lit: boolean;
}) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  const ang = Math.atan2(dy, dx) * (180 / Math.PI);
  return (
    <span
      className="hero-board__road"
      data-on={lit ? 'true' : 'false'}
      style={{
        left: from[0],
        top: from[1],
        width: len,
        transform: `rotate(${ang}deg)`,
      }}
      aria-hidden
    />
  );
}

function BoardNode({
  kind, x, y, src, shown, mark, title, lit, dimmed, onOpen,
}: {
  kind: 'pillar' | 'branch';
  x: number;
  y: number;
  src: string;
  shown: number;
  mark: boolean;
  title: string;
  lit: boolean;
  dimmed: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className={kind === 'pillar' ? 'hero-node hero-node--pillar hero-board__node' : 'hero-node hero-board__node'}
      data-on={lit ? 'true' : 'false'}
      data-dim={dimmed ? 'true' : 'false'}
      title={`${title} ${shown}`}
      aria-label={`${title} ${shown}`}
      style={{ left: x, top: y }}
      onClick={onOpen}
    >
      <img src={src} alt="" decoding="async" />
      {mark && <b>{shown}</b>}
    </button>
  );
}
