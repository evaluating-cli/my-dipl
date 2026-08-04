import { PROVINCE_MAP, type PowerId } from "../../data/map";
import type { Order, Unit } from "../../game/engine";
import { curve } from "./geometry";

interface OrderArrowsProps {
  units: Unit[];
  humanPower: PowerId;
  orders: Record<string, Order>;
  selectedUnit: Unit | null;
  pendingMode: "move" | "support" | null;
  moveTargets: Set<string>;
  zoomScale: number;
}

export default function OrderArrows({ units, humanPower, orders, selectedUnit, pendingMode, moveTargets, zoomScale }: OrderArrowsProps) {
  const plannedOrders = units.filter((unit) => unit.power === humanPower && orders[unit.id]?.type !== "hold" && orders[unit.id]);
  const supportCount = (unit: Unit) => units.filter((candidate) => candidate.power === humanPower && orders[candidate.id]?.type === "support" && orders[candidate.id].supportFrom === unit.loc).length;

  return (
    <>
      <g style={{ pointerEvents: "none" }}>
        {plannedOrders.map((unit) => {
          const order = orders[unit.id];
          const from = PROVINCE_MAP[unit.loc];
          if (order.type === "move" && order.to) {
            const path = curve(from, PROVINCE_MAP[order.to]);
            const strength = 1 + supportCount(unit);
            return <g key={`o-${unit.id}`}><path d={path.d} fill="none" stroke="#d97706" strokeWidth={3.2} strokeDasharray="9 6" markerEnd="url(#arrMove)" className="rd-march" strokeLinecap="round" opacity={0.9} />{strength > 1 && <g transform={`translate(${path.badgeX}, ${path.badgeY}) scale(${1 / Math.pow(zoomScale, 0.75)})`}><circle r={8.5} fill="#b45309" stroke="#fff" strokeWidth={1.6} /><text y={3.2} textAnchor="middle" fill="#fff" style={{ fontSize: 10, fontWeight: 800 }}>{strength}</text></g>}</g>;
          }
          if (order.type === "support" && order.supportFrom) {
            const path = curve(from, PROVINCE_MAP[order.supportTo ?? order.supportFrom]);
            return <path key={`o-${unit.id}`} d={path.d} fill="none" stroke="#0891b2" strokeWidth={2.6} strokeDasharray="3 6" markerEnd="url(#arrSup)" strokeLinecap="round" opacity={0.8} />;
          }
          return null;
        })}
      </g>
      <g style={{ pointerEvents: "none" }}>
        {selectedUnit && pendingMode === "move" && Array.from(moveTargets).map((target) => {
          const from = PROVINCE_MAP[selectedUnit.loc];
          const to = PROVINCE_MAP[target];
          return <line key={`h-${target}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#d97706" strokeWidth={1.4} strokeDasharray="2 6" strokeOpacity={0.7} />;
        })}
      </g>
    </>
  );
}
