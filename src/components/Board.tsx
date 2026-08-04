import { useMemo, useState } from "react";
import { PROVINCE_MAP } from "../data/map";
import type { GameState, Order, Unit } from "../game/engine";
import { useBoardViewport } from "../hooks/useBoardViewport";
import MapPaths from "./MapPaths";
import { UnitNode } from "./MapNodes";
import AdjacencyConnections from "./board/AdjacencyConnections";
import { BoardBackground, BoardDecorations, BoardDefinitions } from "./board/BoardDecorations";
import HintPill from "./board/HintPill";
import HoverCartouche from "./board/HoverCartouche";
import OrderArrows from "./board/OrderArrows";
import ProvinceLayers from "./board/ProvinceLayers";

export { orderText, unitColor } from "./board/formatting";

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
  const { game, orders, selectedUnitId, pendingMode, highlightMove, highlightSupport, changed, busy } = props;
  const [hoverId, setHoverId] = useState<string | null>(null);
  const { containerRef, zoomScale, viewBox, isDragging, handlePointerDown, handleWheel, shouldSuppressClick } = useBoardViewport();

  const unitsByLocation = useMemo(() => new Map(game.units.map((unit) => [unit.loc, unit])), [game.units]);
  const occupiedLocations = useMemo(() => new Set(unitsByLocation.keys()), [unitsByLocation]);
  const selectedUnit = game.units.find((unit) => unit.id === selectedUnitId) ?? null;
  const hoverProvince = hoverId ? PROVINCE_MAP[hoverId] : null;
  const hoverUnit = hoverId ? unitsByLocation.get(hoverId) ?? null : null;

  const handleProvince = (id: string) => {
    if (!busy && !shouldSuppressClick()) props.onProvince(id);
  };
  const handleUnit = (unit: Unit) => {
    if (busy || shouldSuppressClick()) return;
    if (pendingMode) props.onProvince(unit.loc);
    else props.onUnit(unit);
  };

  return (
    <div ref={containerRef} className="absolute inset-0 bg-[#efe6cd] select-none overflow-hidden touch-none" onWheel={handleWheel} onPointerDown={handlePointerDown}>
      <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice" className={`block h-full w-full ${isDragging ? "cursor-grabbing" : "cursor-grab"}`} style={{ opacity: busy ? 0.55 : 1, transition: "opacity .3s" }} onMouseLeave={() => setHoverId(null)}>
        <BoardDefinitions />
        <BoardBackground />
        <MapPaths hoverId={hoverId} setHoverId={setHoverId} highlightMove={highlightMove} highlightSupport={highlightSupport} changed={changed} centers={game.centers} onProvinceClick={handleProvince} />
        <BoardDecorations />
        <AdjacencyConnections />
        <ProvinceLayers hoverId={hoverId} moveTargets={highlightMove} supportTargets={highlightSupport} changed={changed} occupiedLocations={occupiedLocations} centers={game.centers} zoomScale={zoomScale} onHover={setHoverId} onProvince={handleProvince} />
        <OrderArrows units={game.units} humanPower={game.human} orders={orders} selectedUnit={selectedUnit} pendingMode={pendingMode} moveTargets={highlightMove} zoomScale={zoomScale} />
        {game.units.map((unit) => <UnitNode key={unit.id} id={unit.id} type={unit.type} loc={unit.loc} power={unit.power} selected={unit.id === selectedUnitId} isHuman={unit.power === game.human} phase={game.phase} zoomScale={zoomScale} onEnter={() => setHoverId(unit.loc)} onClick={(event) => { event.stopPropagation(); handleUnit(unit); }} />)}
      </svg>
      <HoverCartouche province={hoverProvince} unit={hoverUnit} controller={hoverProvince?.supply ? game.centers[hoverProvince.id] ?? "NEU" : null} />
      <HintPill phase={game.phase} selectedUnit={selectedUnit} pendingMode={pendingMode} busy={busy} />
    </div>
  );
}
