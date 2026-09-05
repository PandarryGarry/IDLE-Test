import { useEffect, useRef, type PointerEvent } from 'react';
import {
  BRANCHES,
  BRANCHES_BY_PILLAR,
  DEEP_PASSIVES,
  PILLARS,
  rayNodes,
  type BranchId,
  type NodeRef,
  type PillarId,
} from '@/domain/attributes/attributes';
import { BOARD_EMBLEM, BRANCH_ICON, PASSIVE_ICON, PILLAR_ICON } from '@/domain/attributes/attributeIcons';
import {
  isNodeUnlocked,
  nodeRank,
  type computeAttributeSnapshot,
} from '@/domain/attributes/characterAttributes';

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
/** Запас по краям, чтобы крайние узлы не прилипали к рамке. */
const FIT_PAD = 32;
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
  snapshot, canSpendBranch, onOpenPillar, onOpenNode,
}: {
  snapshot: Snapshot;
  canSpendBranch: boolean;
  onOpenPillar: (id: PillarId) => void;
  onOpenNode: (ref: NodeRef) => void;
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

  /** Масштаб, при котором весь мир целиком влезает в кадр доски. */
  const fitScale = () => {
    const view = viewRef.current;
    if (!view) return 1;
    const side = Math.min(view.clientWidth, view.clientHeight);
    return side / (WORLD + FIT_PAD);
  };

  /** Телефон уже поля: даём дожать до полного кадра, но не больше нужного. */
  const minScale = () => Math.min(MIN_SCALE, fitScale());

  const centerView = (nextScale = fitScale()) => {
    const view = viewRef.current;
    if (!view) return;
    scale.current = clamp(nextScale, minScale(), MAX_SCALE);
    tx.current = view.clientWidth / 2 - CX * scale.current;
    ty.current = view.clientHeight / 2 - CY * scale.current;
    apply();
  };

  useEffect(() => {
    // Старт — весь мир в кадре: видно все 36 узлов, дальше игрок приближает сам.
    centerView();
    const view = viewRef.current;
    if (!view) return;
    const onResize = () => centerView(scale.current);
    window.addEventListener('resize', onResize);
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = view.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      const before = scale.current;
      const after = clamp(before * (event.deltaY < 0 ? 1.08 : 0.92), minScale(), MAX_SCALE);
      const wx = (px - tx.current) / before;
      const wy = (py - ty.current) / before;
      scale.current = after;
      tx.current = px - wx * after;
      ty.current = py - wy * after;
      apply();
    };
    view.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      view.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
    };
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
        scale.current = clamp(pinch.current.scale * (d / pinch.current.d), minScale(), MAX_SCALE);
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
  const openNode = (ref: NodeRef) => {
    if (panned.current) return;
    onOpenNode(ref);
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
          <span className="hero-board__knot" style={{ left: CX, top: CY }} aria-hidden>
            <img src={BOARD_EMBLEM} alt="" decoding="async" />
          </span>
          {ARMS.map(arm => {
            const pillar = pillarPos(arm);
            const shown = Math.round(snapshot.finalPillars[arm.pillar]);
            const rays = BRANCHES_BY_PILLAR[arm.pillar];
            return (
              <span key={arm.arm}>
                {rays.map((branch, slot) => {
                  const nodes = rayNodes(branch);
                  const stops = [
                    pillar,
                    ringPos(arm, 0, slot),
                    ringPos(arm, 1, slot),
                    ringPos(arm, 2, slot),
                  ];
                  return (
                    <span key={branch}>
                      {nodes.map((ref, step) => (
                        <Road
                          key={`${branch}-road-${step}`}
                          from={stops[step]}
                          to={stops[step + 1]}
                          lit={nodeRank(snapshot.state, ref) > 0}
                        />
                      ))}
                      {nodes.map((ref, step) => {
                        const rank = nodeRank(snapshot.state, ref);
                        const locked = !isNodeUnlocked(snapshot.state, ref);
                        const [x, y] = stops[step + 1];
                        const name = ref.kind === 'branch'
                          ? BRANCHES[ref.id].nameRu
                          : DEEP_PASSIVES[ref.id].nameRu;
                        const icon = ref.kind === 'branch'
                          ? BRANCH_ICON[ref.id]
                          : PASSIVE_ICON[ref.id];
                        return (
                          <BoardNode
                            key={ref.id}
                            kind="branch"
                            x={x}
                            y={y}
                            src={icon}
                            shown={rank}
                            mark={rank > 0}
                            title={name}
                            lit={rank > 0}
                            locked={locked}
                            dimmed={rank === 0 && (locked || !canSpendBranch)}
                            onOpen={() => openNode(ref)}
                          />
                        );
                      })}
                    </span>
                  );
                })}
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
          onClick={() => centerView()}
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
  kind, x, y, src, shown, mark, title, lit, dimmed, locked = false, onOpen,
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
  /** Узел заперт: предыдущий на луче не выкачан до конца. */
  locked?: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className={kind === 'pillar' ? 'hero-node hero-node--pillar hero-board__node' : 'hero-node hero-board__node'}
      data-on={lit ? 'true' : 'false'}
      data-dim={dimmed ? 'true' : 'false'}
      data-locked={locked ? 'true' : 'false'}
      title={locked ? `${title} — закрыто` : `${title} ${shown}`}
      aria-label={locked ? `${title} — закрыто` : `${title} ${shown}`}
      style={{ left: x, top: y }}
      onClick={onOpen}
    >
      <span className="hero-node__art">
        <img src={src} alt="" decoding="async" />
      </span>
      {mark && <b>{shown}</b>}
    </button>
  );
}
