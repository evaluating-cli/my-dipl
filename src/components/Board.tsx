import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import {
  POWER_MAP,
  PROVINCE_MAP,
  PROVINCES,
  type PowerId,
  type Province,
} from "../data/map";
import {
  provName,
  type GameState,
  type Order,
  type Unit,
} from "../game/engine";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
export function unitColor(power: PowerId): string {
  return POWER_MAP[power]?.color ?? "#64748b";
}

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export function orderText(o?: Order): string {
  if (!o || o.type === "hold") return "Hold";
  if (o.type === "move") return `Move to ${provName(o.to!)}`;
  return `Support ${provName(o.supLoc!)}`;
}

const MAP_W = 1320;
const MAP_H = 860;
const MIN_W = 560;

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ---------------------------------------------------------------------------
// Board
// ---------------------------------------------------------------------------
export interface BoardProps {
  game: GameState;
  orders: Record<string, Order>;
  selectedUnitId: string | null;
  pendingMode: "move" | "support" | null;
  highlightMove: Set<string>;
  highlightSupport: Set<string>;
  changed: string[];
  busy: boolean;
  onProvince: (id: string) => void;
  onUnit: (unit: Unit) => void;
}

export default function Board(props: BoardProps) {
  const {
    game,
    orders,
    selectedUnitId,
    pendingMode,
    highlightMove,
    highlightSupport,
    changed,
    busy,
  } = props;

  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [vb, setVb] = useState<ViewBox>({ x: 0, y: 0, w: MAP_W, h: MAP_H });
  const [hoverId, setHoverId] = useState<string | null>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const movedRef = useRef(false);

  const unitsByLoc = useMemo(() => {
    const m: Record<string, Unit> = {};
    for (const u of game.units) m[u.loc] = u;
    return m;
  }, [game.units]);

  const selectedUnit = game.units.find((u) => u.id === selectedUnitId) ?? null;

  // ---- zoom ----------------------------------------------------------------
  const zoomAbout = (fx: number, fy: number, factor: number) => {
    setVb((prev) => {
      const w = Math.min(MAP_W, Math.max(MIN_W, prev.w * factor));
      const scale = w / prev.w;
      const h = prev.h * scale;
      const anchorX = prev.x + fx * prev.w;
      const anchorY = prev.y + fy * prev.h;
      let x = anchorX - fx * w;
      let y = anchorY - fy * h;
      x = Math.min(MAP_W - 120, Math.max(-180, x));
      y = Math.min(MAP_H - 100, Math.max(-140, y));
      return { x, y, w, h };
    });
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const fx = (e.clientX - r.left) / r.width;
      const fy = (e.clientY - r.top) / r.height;
      zoomAbout(fx, fy, e.deltaY < 0 ? 0.86 : 1.16);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ---- pan ------------------------------------------------------------------
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
    movedRef.current = false;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = wrapRef.current;
    if (!d || !el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    if (d.moved) {
      movedRef.current = true;
      setVb((prev) => ({
        ...prev,
        x: Math.min(MAP_W - 120, Math.max(-180, prev.x - (dx * prev.w) / r.width)),
        y: Math.min(MAP_H - 100, Math.max(-140, prev.y - (dy * prev.h) / r.height)),
      }));
      d.x = e.clientX;
      d.y = e.clientY;
    }
  };
  const onPointerUp = () => {
    drag.current = null;
    // allow the click event to read movedRef first
    setTimeout(() => {
      movedRef.current = false;
    }, 0);
  };

  const handleProvince = (id: string) => {
    if (movedRef.current || busy) return;
    props.onProvince(id);
  };
  const handleUnit = (u: Unit) => {
    if (movedRef.current || busy) return;
    props.onUnit(u);
  };

  // ---- planned human orders (arrows) -----------------------------------------
  const ordersArr = game.units
    .filter((u) => u.power === game.human && orders[u.id] && orders[u.id].type !== "hold")
    .map((u) => ({ u, o: orders[u.id] }));

  const supportCountFor = (unit: Unit): number =>
    game.units.filter(
      (x) => x.power === game.human && orders[x.id]?.type === "support" && orders[x.id].supLoc === unit.loc,
    ).length;

  const curve = (a: Province, b: Province) => {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const ox = (-dy / len) * len * 0.16;
    const oy = (dx / len) * len * 0.16;
    const cx = mx + ox;
    const cy = my + oy;
    return {
      d: `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`,
      // point at t=0.5 on the quadratic bezier
      bx: 0.25 * a.x + 0.5 * cx + 0.25 * b.x,
      by: 0.25 * a.y + 0.5 * cy + 0.25 * b.y,
    };
  };

  const hover = hoverId ? PROVINCE_MAP[hoverId] : null;
  const hoverUnit = hoverId ? unitsByLoc[hoverId] : null;

  // ---------------------------------------------------------------------------
  return (
    <div
      ref={wrapRef}
      className="relative cursor-grab overflow-hidden rounded-xl bg-[#efe6cd] shadow-inner select-none active:cursor-grabbing"
      style={{ touchAction: "none" }}
    >
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        className="block h-auto w-full"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onMouseLeave={() => setHoverId(null)}
        style={{ opacity: busy ? 0.55 : 1, transition: "opacity .3s" }}
      >
        <defs>
          <radialGradient id="paper" cx="50%" cy="40%" r="75%">
            <stop offset="0%" stopColor="#f6efdc" />
            <stop offset="70%" stopColor="#efe6cd" />
            <stop offset="100%" stopColor="#e5d8b8" />
          </radialGradient>
          <marker id="arrMove" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#d97706" />
          </marker>
          <marker id="arrSup" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#0891b2" />
          </marker>
        </defs>

        <rect x={-200} y={-160} width={MAP_W + 400} height={MAP_H + 320} fill="url(#paper)" />

        {/* decorative ruled border */}
        <rect x={8} y={8} width={MAP_W - 16} height={MAP_H - 16} fill="none" stroke="#a08c60" strokeWidth={2} />
        <rect x={18} y={18} width={MAP_W - 36} height={MAP_H - 36} fill="none" stroke="#a08c60" strokeWidth={0.75} />

        {/* ---- seas ---- */}
        {PROVINCES.filter((p) => p.kind === "sea").map((p) => {
          const occupied = unitsByLoc[p.id];
          const rx = p.rx ?? 46;
          const ry = p.ry ?? 22;
          const labelY = occupied ? p.y - ry - 4 : p.y + 4;
          return (
            <g
              key={p.id}
              onClick={() => handleProvince(p.id)}
              onMouseEnter={() => setHoverId(p.id)}
              onMouseLeave={() => setHoverId((h) => (h === p.id ? null : h))}
              className="cursor-pointer"
            >
              <ellipse
                cx={p.x}
                cy={p.y}
                rx={rx}
                ry={ry}
                fill="#cfe2ec"
                stroke={hoverId === p.id ? "#5b8ba6" : "#9fbecd"}
                strokeWidth={hoverId === p.id ? 2.2 : 1.1}
              />
              <ellipse cx={p.x} cy={p.y} rx={rx - 6} ry={ry - 5} fill="none" stroke="#ffffff" strokeWidth={0.8} strokeOpacity={0.5} />
              <text
                x={p.x}
                y={labelY}
                textAnchor="middle"
                fill="#47708a"
                style={{ fontSize: 9.5, fontStyle: "italic", letterSpacing: 0.4 }}
              >
                {p.name}
              </text>
            </g>
          );
        })}

        {/* ---- land provinces ---- */}
        {PROVINCES.filter((p) => p.kind === "land").map((p) => {
          const color = unitColor(p.owner ?? "NEU");
          const u = unitsByLoc[p.id];
          const isMoveT = highlightMove.has(p.id);
          const isSupT = highlightSupport.has(p.id);
          const isChanged = changed.includes(p.id);
          const isHover = hoverId === p.id;
          return (
            <g
              key={p.id}
              onClick={() => handleProvince(p.id)}
              onMouseEnter={() => setHoverId(p.id)}
              onMouseLeave={() => setHoverId((h) => (h === p.id ? null : h))}
              className="cursor-pointer"
            >
              <rect
                x={p.x - 39}
                y={p.y - 23}
                width={78}
                height={46}
                rx={8}
                fill={hexA(color === "#9b9178" ? "#8d8268" : color, 0.14)}
                stroke={isHover || isChanged ? "#1e293b" : color}
                strokeWidth={isChanged ? 2.6 : isHover ? 2.2 : 1.3}
                className={isChanged ? "rd-changed" : undefined}
              />
              {/* territory colour strip */}
              <rect x={p.x - 37} y={p.y - 21} width={74} height={5.5} rx={2.5} fill={color} opacity={0.9} />
              {/* order-target highlight */}
              {(isMoveT || isSupT) && (
                <rect
                  x={p.x - 42}
                  y={p.y - 26}
                  width={84}
                  height={52}
                  rx={10}
                  fill={isMoveT ? "#d9770622" : "#0891b222"}
                  stroke={isMoveT ? "#d97706" : "#0891b2"}
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                  className="rd-march"
                />
              )}
              <text
                x={p.x}
                y={u ? p.y - 3 : p.y + 5}
                textAnchor="middle"
                fill="#33302a"
                style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 0.8 }}
              >
                {p.id}
              </text>
              {p.supply && (
                <g>
                  <circle
                    cx={p.x - 28}
                    cy={p.y - 8}
                    r={5.6}
                    fill={unitColor(game.centers[p.id] ?? "NEU")}
                    stroke="#fff"
                    strokeWidth={1.3}
                  />
                  {p.supply === "home" && (
                    <circle cx={p.x - 28} cy={p.y - 8} r={8.6} fill="none" stroke={color} strokeWidth={1} strokeOpacity={0.6} />
                  )}
                </g>
              )}
            </g>
          );
        })}

        {/* ---- order arrows ---- */}
        {ordersArr.map(({ u, o }) => {
          const from = PROVINCE_MAP[u.loc];
          if (o.type === "move" && o.to) {
            const to = PROVINCE_MAP[o.to];
            const c = curve(from, to);
            const n = 1 + supportCountFor(u);
            return (
              <g key={`o-${u.id}`}>
                <path d={c.d} fill="none" stroke="#d97706" strokeWidth={3.2} strokeDasharray="9 6" markerEnd="url(#arrMove)" className="rd-march" strokeLinecap="round" opacity={0.9} />
                {n > 1 && (
                  <g>
                    <circle cx={c.bx} cy={c.by} r={8.5} fill="#b45309" stroke="#fff" strokeWidth={1.6} />
                    <text x={c.bx} y={c.by + 3.2} textAnchor="middle" fill="#fff" style={{ fontSize: 10, fontWeight: 800 }}>
                      {n}
                    </text>
                  </g>
                )}
              </g>
            );
          }
          if (o.type === "support" && o.supLoc) {
            const to = PROVINCE_MAP[o.supLoc];
            const c = curve(from, to);
            return (
              <path key={`o-${u.id}`} d={c.d} fill="none" stroke="#0891b2" strokeWidth={2.6} strokeDasharray="3 6" markerEnd="url(#arrSup)" strokeLinecap="round" opacity={0.8} />
            );
          }
          return null;
        })}

        {/* ---- subtle hint links from the selected unit ---- */}
        {selectedUnit && pendingMode === "move" &&
          Array.from(highlightMove).map((t) => {
            const a = PROVINCE_MAP[selectedUnit.loc];
            const b = PROVINCE_MAP[t];
            return (
              <line key={`h-${t}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#d97706" strokeWidth={1.4} strokeDasharray="2 6" strokeOpacity={0.7} />
            );
          })}

        {/* ---- units ---- */}
        {game.units.map((u) => {
          const p = PROVINCE_MAP[u.loc];
          const selected = u.id === selectedUnitId;
          const cy = p.kind === "sea" ? p.y + 1 : p.y + 11.5;
          const isHuman = u.power === game.human;
          return (
            <g
              key={u.id}
              onClick={(e) => {
                e.stopPropagation();
                handleUnit(u);
              }}
              onMouseEnter={() => setHoverId(u.loc)}
              className={isHuman && game.phase === "Order" ? "cursor-pointer" : undefined}
            >
              {selected && (
                <circle cx={p.x} cy={cy} r={16.5} fill="none" stroke="#f59e0b" strokeWidth={2.6} strokeDasharray="5 4" className="rd-spin" />
              )}
              <circle
                cx={p.x}
                cy={cy}
                r={11.5}
                fill={unitColor(u.power)}
                stroke={selected ? "#fbbf24" : "#fffdf6"}
                strokeWidth={selected ? 3 : 2.2}
                style={{ filter: "drop-shadow(0 1.5px 1.5px rgba(0,0,0,.35))" }}
              />
              <text x={p.x} y={cy + 4} textAnchor="middle" fill="#fffdf6" style={{ fontSize: 11, fontWeight: 900, pointerEvents: "none" }}>
                {u.type}
              </text>
            </g>
          );
        })}
      </svg>

      {/* ---- cartouche (hover info) ---- */}
      <div className="pointer-events-none absolute left-3 top-3 min-w-[200px] max-w-[240px] rounded-lg border-2 border-[#a08c60] bg-[#f8f1de]/95 px-3 py-2 shadow-md">
        {hover ? (
          <div>
            <p className="font-display text-[13px] font-bold tracking-wide text-[#3a3428]">{hover.name}</p>
            <p className="mt-0.5 text-[11px] text-[#6b6350]">
              {hover.kind === "sea" ? "Open water" : hover.coast ? "Coastal province" : "Inland province"}
              {hover.supply === "home" && ` · Home centre of ${POWER_MAP[hover.owner!].name}`}
              {hover.supply === "neutral" && " · Neutral supply centre"}
            </p>
            {hover.supply && (
              <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#6b6350]">
                <span className="inline-block h-2.5 w-2.5 rounded-full border border-white" style={{ background: unitColor(game.centers[hover.id] ?? "NEU") }} />
                Controlled by {POWER_MAP[game.centers[hover.id] ?? "NEU"].name}
              </p>
            )}
            {hoverUnit && (
              <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#6b6350]">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: unitColor(hoverUnit.power) }} />
                {hoverUnit.type === "A" ? "Army" : "Fleet"} of {POWER_MAP[hoverUnit.power].name}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="font-display text-[13px] font-bold tracking-wide text-[#3a3428]">The Great War Board</p>
            <p className="mt-0.5 text-[11px] text-[#6b6350]">Scroll to zoom · drag to pan · hover any province</p>
          </div>
        )}
      </div>

      {/* ---- zoom controls ---- */}
      <div className="absolute right-3 top-3 flex flex-col gap-1.5">
        <button onClick={() => zoomAbout(0.5, 0.5, 0.78)} className="rd-mapbtn" aria-label="Zoom in">
          <ZoomIn size={15} />
        </button>
        <button onClick={() => zoomAbout(0.5, 0.5, 1.28)} className="rd-mapbtn" aria-label="Zoom out">
          <ZoomOut size={15} />
        </button>
        <button onClick={() => setVb({ x: 0, y: 0, w: MAP_W, h: MAP_H })} className="rd-mapbtn" aria-label="Reset view">
          <Maximize2 size={15} />
        </button>
      </div>

      {/* ---- contextual hint pill ---- */}
      <HintPill
        phase={game.phase}
        selectedUnit={selectedUnit}
        pendingMode={pendingMode}
        busy={busy}
      />

      {/* ---- compass rose ---- */}
      <div className="pointer-events-none absolute bottom-3 right-4 flex items-center gap-2 text-[#8a7a56]">
        <svg width="34" height="34" viewBox="0 0 34 34">
          <circle cx="17" cy="17" r="14.5" fill="none" stroke="#8a7a56" strokeWidth="1" />
          <path d="M17 4 L19.5 17 L17 30 L14.5 17 Z" fill="#8a7a56" opacity="0.75" />
          <path d="M4 17 L17 14.5 L30 17 L17 19.5 Z" fill="#8a7a56" opacity="0.45" />
          <text x="17" y="9.5" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#6d5f43">N</text>
        </svg>
        <span className="font-display text-[11px] tracking-[0.25em]">EUROPE · MCMI</span>
      </div>
    </div>
  );
}

function HintPill({
  phase,
  selectedUnit,
  pendingMode,
  busy,
}: {
  phase: GameState["phase"];
  selectedUnit: Unit | null;
  pendingMode: "move" | "support" | null;
  busy: boolean;
}) {
  let text: string | null = null;
  if (busy) text = "Adjudicating orders…";
  else if (phase === "Order") {
    if (pendingMode === "move" && selectedUnit)
      text = `Choose a destination for ${selectedUnit.type === "A" ? "the army" : "the fleet"} in ${provName(selectedUnit.loc)}`;
    else if (pendingMode === "support" && selectedUnit)
      text = `Choose a neighbouring unit for ${provName(selectedUnit.loc)} to support`;
    else if (selectedUnit)
      text = `${selectedUnit.type === "A" ? "Army" : "Fleet"} ${provName(selectedUnit.loc)} — issue an order`;
    else text = "Select one of your units to issue orders";
  }
  if (!text) return null;
  return (
    <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-amber-200/40 bg-[#2b2620]/90 px-4 py-1.5 text-[12px] font-semibold text-amber-100 shadow-lg">
      {text}
    </div>
  );
}
