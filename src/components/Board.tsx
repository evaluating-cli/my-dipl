import { SeaNode, LandNode, UnitNode } from "./MapNodes";
import { useMemo, useState } from "react";
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
import MapPaths from "./MapPaths";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
export function unitColor(power: PowerId): string {
  return POWER_MAP[power]?.color ?? "#64748b";
}

export function orderText(o?: Order): string {
  if (!o || o.type === "hold") return "Hold";
  if (o.type === "move") return `Move to ${provName(o.to!)}`;
  return `Support ${provName(o.supLoc!)}`;
}

const MAP_W = 1000;
const MAP_H = 800;

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

  const [hoverId, setHoverId] = useState<string | null>(null);

  const unitsByLoc = useMemo(() => {
    const m: Record<string, Unit> = {};
    for (const u of game.units) m[u.loc] = u;
    return m;
  }, [game.units]);

  const connections = useMemo(() => {
    const seen = new Set<string>();
    const list: { from: Province; to: Province; kind: "land" | "sea" | "coastal"; key: string }[] = [];
    for (const p of PROVINCES) {
      for (const adjId of p.adj) {
        const target = PROVINCE_MAP[adjId];
        if (target) {
          const pair = [p.id, target.id].sort();
          const key = pair.join("-");
          if (!seen.has(key)) {
            seen.add(key);
            let kind: "land" | "sea" | "coastal" = "land";
            if (p.kind === "sea" && target.kind === "sea") kind = "sea";
            else if (p.kind === "sea" || target.kind === "sea") kind = "coastal";
            list.push({ from: p, to: target, kind, key });
          }
        }
      }
    }
    return list;
  }, []);

  const selectedUnit = game.units.find((u) => u.id === selectedUnitId) ?? null;

  const handleProvince = (id: string) => {
    if (busy) return;
    props.onProvince(id);
  };
  const handleUnit = (u: Unit) => {
    if (busy) return;
    if (pendingMode) {
      props.onProvince(u.loc);
    } else {
      props.onUnit(u);
    }
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
    <div className="absolute inset-0 bg-[#efe6cd] select-none overflow-hidden">
      <svg
        viewBox="-10 -10 920 820"
        preserveAspectRatio="xMidYMid slice"
        className="block h-full w-full"
        style={{ opacity: busy ? 0.55 : 1, transition: "opacity .3s" }}
        onMouseLeave={() => setHoverId(null)}
      >
        <defs>
          <radialGradient id="paper" cx="50%" cy="40%" r="75%">
                <stop offset="0%" stopColor="#f7f1dd" />
                <stop offset="70%" stopColor="#efe6cd" />
                <stop offset="100%" stopColor="#e2d4b2" />
              </radialGradient>
              <radialGradient id="seaGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#dbeffb" />
                <stop offset="75%" stopColor="#cfe2ec" />
                <stop offset="100%" stopColor="#bdd4e2" />
              </radialGradient>
              <linearGradient id="landGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fbf9f4" />
                <stop offset="100%" stopColor="#eae1cb" />
              </linearGradient>
              <marker id="arrMove" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#d97706" />
              </marker>
              <marker id="arrSup" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#0891b2" />
              </marker>
            </defs>

            <rect x={-200} y={-200} width={MAP_W + 400} height={MAP_H + 400} fill="url(#paper)" />

            <MapPaths
              hoverId={hoverId}
              setHoverId={setHoverId}
              highlightMove={highlightMove}
              highlightSupport={highlightSupport}
              changed={changed}
              centers={game.centers}
              onProvinceClick={handleProvince}
            />

            {/* Subtle latitude/longitude coordinates grid */}
            <g stroke="#a59169" strokeWidth={0.5} strokeDasharray="1 11" opacity={0.35}>
              {/* Horizontal lines */}
              <line x1={-200} y1={200} x2={MAP_W + 200} y2={200} />
              <line x1={-200} y1={400} x2={MAP_W + 200} y2={400} />
              <line x1={-200} y1={600} x2={MAP_W + 200} y2={600} />
              {/* Vertical lines */}
              <line x1={300} y1={-200} x2={300} y2={MAP_H + 200} />
              <line x1={600} y1={-200} x2={600} y2={MAP_H + 200} />
              <line x1={900} y1={-200} x2={900} y2={MAP_H + 200} />
            </g>

            {/* Grand Vintage Compass Rose (Placed in open bottom-left Atlantic) */}
            <g transform="translate(110, 750)" stroke="#a08c60" fill="none" opacity={0.65}>
          <circle cx={0} cy={0} r={34} strokeWidth={0.8} />
          <circle cx={0} cy={0} r={37} strokeWidth={0.4} strokeDasharray="2 3" />
          <circle cx={0} cy={0} r={30} strokeWidth={0.4} />
          {/* Compass points */}
          <path d="M 0,0 L 4.5,-10 L 0,-33 L -4.5,-10 Z" fill="#8a7a56" strokeWidth={0.4} />
          <path d="M 0,0 L -4.5,10 L 0,33 L 4.5,10 Z" fill="#8a7a56" strokeWidth={0.4} opacity={0.7} />
          <path d="M 0,0 L 10,4.5 L 33,0 L 10,-4.5 Z" fill="#8a7a56" strokeWidth={0.4} opacity={0.8} />
          <path d="M 0,0 L -10,-4.5 L -33,0 L -10,4.5 Z" fill="#8a7a56" strokeWidth={0.4} opacity={0.6} />
          <path d="M 0,0 L 3.5,-7 L 18,-18 L 7,-3.5 Z" fill="#a08c60" strokeWidth={0.4} opacity={0.5} />
          <path d="M 0,0 L -3.5,7 L -18,18 L -7,3.5 Z" fill="#a08c60" strokeWidth={0.4} opacity={0.5} />
          <path d="M 0,0 L -7,-3.5 L -18,-18 L -3.5,-7 Z" fill="#a08c60" strokeWidth={0.4} opacity={0.5} />
          <path d="M 0,0 L 7,3.5 L 18,18 L 3.5,7 Z" fill="#a08c60" strokeWidth={0.4} opacity={0.5} />
          
          <text x={0} y={-38} textAnchor="middle" style={{ fontSize: 9, fontFamily: "Cinzel", fontWeight: "bold", fill: "#5c5140" }}>N</text>
          <text x={38} y={3} textAnchor="middle" style={{ fontSize: 7.5, fontFamily: "Cinzel", fontWeight: "bold", fill: "#5c5140" }}>E</text>
          <text x={0} y={43} textAnchor="middle" style={{ fontSize: 7.5, fontFamily: "Cinzel", fontWeight: "bold", fill: "#5c5140" }}>S</text>
          <text x={-40} y={3} textAnchor="middle" style={{ fontSize: 7.5, fontFamily: "Cinzel", fontWeight: "bold", fill: "#5c5140" }}>W</text>
        </g>

        {/* ---- Undirected Adjacency Connections Map Layer ---- */}
        {connections.map((conn) => {
          let stroke = "#a59169";
          let dash = "4 4";
          let op = 0.28;
          let sw = 1.1;
          
          if (conn.kind === "sea") {
            stroke = "#47708a";
            dash = "3 5";
            op = 0.26;
            sw = 1.2;
          } else if (conn.kind === "coastal") {
            stroke = "#8e7b57";
            dash = "1 4";
            op = 0.18;
            sw = 1;
          }
          
          return (
            <line
              key={`conn-${conn.key}`}
              x1={conn.from.x}
              y1={conn.from.y}
              x2={conn.to.x}
              y2={conn.to.y}
              stroke={stroke}
              strokeWidth={sw}
              strokeDasharray={dash}
              strokeOpacity={op}
              fill="none"
            />
          );
        })}

        {/* ---- seas ---- */}
        <g style={{ pointerEvents: "none" }}>
          {PROVINCES.filter((p) => p.kind === "sea").map((p) => (
            <SeaNode
              key={p.id}
              p={p}
              isHover={hoverId === p.id}
              isMoveT={highlightMove.has(p.id)}
              isSupT={highlightSupport.has(p.id)}
              hasUnit={!!unitsByLoc[p.id]}
              onEnter={() => setHoverId(p.id)}
              onLeave={() => setHoverId((h) => (h === p.id ? null : h))}
              onClick={() => handleProvince(p.id)}
            />
          ))}
        </g>

        {/* ---- land provinces ---- */}
        <g style={{ pointerEvents: "none" }}>
          {PROVINCES.filter((p) => p.kind === "land").map((p) => (
            <LandNode
              key={p.id}
              p={p}
              isHover={hoverId === p.id}
              isMoveT={highlightMove.has(p.id)}
              isSupT={highlightSupport.has(p.id)}
              isChanged={changed.includes(p.id)}
              hasUnit={!!unitsByLoc[p.id]}
              supplyOwner={game.centers[p.id] ?? null}
              onEnter={() => setHoverId(p.id)}
              onLeave={() => setHoverId((h) => (h === p.id ? null : h))}
              onClick={() => handleProvince(p.id)}
            />
          ))}
        </g>

        {/* ---- order arrows ---- */}
        <g style={{ pointerEvents: "none" }}>
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
        </g>

        {/* ---- subtle hint links from the selected unit ---- */}
        <g style={{ pointerEvents: "none" }}>
          {selectedUnit && pendingMode === "move" &&
            Array.from(highlightMove).map((t) => {
              const a = PROVINCE_MAP[selectedUnit.loc];
              const b = PROVINCE_MAP[t];
              return (
                <line key={`h-${t}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#d97706" strokeWidth={1.4} strokeDasharray="2 6" strokeOpacity={0.7} />
              );
            })}
        </g>

        {/* ---- units ---- */}
        {game.units.map((u) => (
          <UnitNode
            key={u.id}
            id={u.id}
            type={u.type}
            loc={u.loc}
            power={u.power}
            selected={u.id === selectedUnitId}
            isHuman={u.power === game.human}
            phase={game.phase}
            onEnter={() => setHoverId(u.loc)}
            onClick={(e) => {
              e.stopPropagation();
              handleUnit(u);
            }}
          />
        ))}
      </svg>

      {/* ---- cartouche (hover info) ---- */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 min-w-[200px] max-w-[240px] rounded-xl border border-[#a08c60]/50 bg-[#f8f1de]/90 px-4 py-3 shadow-2xl backdrop-blur-sm">
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
            <p className="mt-0.5 text-[11px] text-[#6b6350]">Hover any province to inspect</p>
          </div>
        )}
      </div>

      {/* ---- contextual hint pill ---- */}
      <HintPill
        phase={game.phase}
        selectedUnit={selectedUnit}
        pendingMode={pendingMode}
        busy={busy}
      />

      {/* ---- compass rose ---- */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex items-center gap-2 text-[#8a7a56]">
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
    if (pendingMode === "support" && selectedUnit)
      text = `Choose a neighbouring unit or province for ${provName(selectedUnit.loc)} to support`;
    else if (selectedUnit)
      text = `Click a neighbouring province to move ${selectedUnit.type === "A" ? "Army" : "Fleet"} ${provName(selectedUnit.loc)}, or click itself to Hold`;
    else text = "Click one of your units on the map to issue orders";
  }
  if (!text) return null;
  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-amber-200/40 bg-[#2b2620]/90 px-5 py-2 text-[12px] font-semibold tracking-wide text-amber-100 shadow-xl backdrop-blur-sm">
      {text}
    </div>
  );
}
