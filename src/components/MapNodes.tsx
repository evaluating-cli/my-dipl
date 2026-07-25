import React, { memo } from "react";
import { unitColor } from "./Board";

import { PROVINCE_MAP,  type Province, type UnitType } from "../data/map";

interface SeaNodeProps {
  p: Province;
  isHover: boolean;
  isMoveT: boolean;
  isSupT: boolean;
  hasUnit: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}

export const SeaNode = memo(function SeaNode({ p, isHover, isMoveT, isSupT, hasUnit, onEnter, onLeave, onClick }: SeaNodeProps) {
  const labelY = hasUnit ? p.y - 12 : p.y + 4;
  return (
    <g
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="cursor-pointer"
    >
      {(isHover || isMoveT || isSupT) && (
        <circle
          cx={p.x}
          cy={p.y}
          r={22}
          fill={isHover ? "rgba(255,255,255,0.2)" : isMoveT ? "#d9770633" : "#0891b233"}
          stroke={isMoveT ? "#d97706" : isSupT ? "#0891b2" : "none"}
          strokeWidth={2}
          strokeDasharray={isHover ? undefined : "3 3"}
          className={isMoveT ? "rd-march" : undefined}
        />
      )}
      <text
        x={p.x}
        y={labelY}
        textAnchor="middle"
        fill={isHover ? "#fff" : "#31556e"}
        style={{ fontSize: 10, fontStyle: "italic", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}
        className="select-none drop-shadow-sm"
      >
        {p.id}
      </text>
    </g>
  );
});

interface LandNodeProps {
  p: Province;
  isHover: boolean;
  isMoveT: boolean;
  isSupT: boolean;
  isChanged: boolean;
  hasUnit: boolean;
  supplyOwner: import("../data/map").PowerId | null;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}

export const LandNode = memo(function LandNode({
  p, isHover, isMoveT, isSupT, isChanged, hasUnit, supplyOwner, onEnter, onLeave, onClick
}: LandNodeProps) {
  return (
    <g
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="cursor-pointer"
    >
      {(isHover || isMoveT || isSupT || isChanged) && (
        <circle
          cx={p.x}
          cy={p.y}
          r={22}
          fill={isHover ? "rgba(255,255,255,0.3)" : isMoveT ? "#d9770633" : isChanged ? "rgba(255,255,255,0.1)" : "#0891b233"}
          stroke={isMoveT ? "#d97706" : isSupT ? "#0891b2" : isChanged ? "#fff" : "none"}
          strokeWidth={2}
          strokeDasharray={isHover ? undefined : "3 3"}
          className={isMoveT ? "rd-march" : isChanged ? "rd-changed" : undefined}
        />
      )}
      
      <text
        x={p.x}
        y={hasUnit ? p.y - 4 : p.y + 4}
        textAnchor="middle"
        fill={isHover ? "#000" : "#2c271e"}
        style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}
        className="select-none drop-shadow-sm"
      >
        {p.id}
      </text>
      
      {p.supply && (
        <g transform={`translate(${p.x - 18}, ${p.y - 8})`}>
          {p.supply === "home" && (
            <circle cx={0} cy={0} r={6.5} fill="none" stroke="#d97706" strokeWidth={1} strokeDasharray="2 2" className="rd-spin" />
          )}
          <circle
            cx={0}
            cy={0}
            r={4.5}
            fill={unitColor(supplyOwner ?? "NEU")}
            stroke="#383020"
            strokeWidth={1}
            style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}
          />
        </g>
      )}
    </g>
  );
});

interface UnitNodeProps {
  id: string;
  type: UnitType;
  loc: string;
  power: import("../data/map").PowerId;
  selected: boolean;
  isHuman: boolean;
  phase: string;
  onEnter: () => void;
  onClick: (e: React.MouseEvent) => void;
}

export const UnitNode = memo(function UnitNode({
  id, type, loc, power, selected, isHuman, phase, onEnter, onClick
}: UnitNodeProps) {
  const p = PROVINCE_MAP[loc];
  const cy = p.kind === "sea" ? p.y + 2 : p.y + 10;
  
  return (
    <g
      onClick={onClick}
      onMouseEnter={onEnter}
      className={isHuman && phase === "Order" ? "cursor-pointer" : undefined}
    >
      {selected && (
        <circle cx={p.x} cy={cy} r={14} fill="none" stroke="#fbbf24" strokeWidth={2.5} strokeDasharray="5 3" className="rd-spin" />
      )}
      <circle
        cx={p.x}
        cy={cy}
        r={10}
        fill={unitColor(power)}
        stroke={selected ? "#fbbf24" : "#fffdf6"}
        strokeWidth={selected ? 2.5 : 1.8}
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,.3))" }}
      />
      <g transform={`translate(${p.x}, ${cy}) scale(0.9)`} style={{ pointerEvents: "none" }}>
        {type === "A" ? (
          <g>
            <path d="M -4,-5 L 4,-5 C 4,-5 4,1 2.5,3.5 C 1,5 0,6 0,6 C 0,6 -1,5 -2.5,3.5 C -4,1 -4,-5 -4,-5 Z" fill="#fffdf6" />
            <path d="M -4,-5 L 4,-5 C 4,-5 4,1 2.5,3.5 C 1,5 0,6 0,6 C 0,6 -1,5 -2.5,3.5 C -4,1 -4,-5 -4,-5 Z" fill="none" stroke={unitColor(power)} strokeWidth={0.8} />
          </g>
        ) : (
          <g>
            <path d="M 0,-5 L 0,6 M -3,-2 L 3,-2 M -4,3 C -4,6 4,6 4,3" fill="none" stroke="#fffdf6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={0} cy={-5} r={1.5} fill="#fffdf6" />
          </g>
        )}
      </g>
    </g>
  );
});
