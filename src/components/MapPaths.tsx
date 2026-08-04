import { memo } from "react";
import { PROVINCES, POWER_MAP, type PowerId } from "../data/map";
import { PROVINCE_PATHS } from "../data/paths";

interface MapPathsProps {
  hoverId: string | null;
  setHoverId: React.Dispatch<React.SetStateAction<string | null>>;
  highlightMove: Set<string>;
  highlightSupport: Set<string>;
  changed: string[];
  centers: Record<string, PowerId>;
  onProvinceClick: (id: string) => void;
}

const MapPaths = memo(function MapPaths({
  hoverId,
  setHoverId,
  highlightMove,
  highlightSupport,
  changed,
  centers,
  onProvinceClick,
}: MapPathsProps) {
  return (
    <g className="map-paths">
      {PROVINCES.map((p) => {
        const pathData = PROVINCE_PATHS[p.id];
        if (!pathData) return null;

        const isLand = p.kind === "land";
        const ownerId = centers[p.id] ?? p.owner;

        let fill = "transparent";
        if (ownerId && POWER_MAP[ownerId as PowerId]) {
          fill = POWER_MAP[ownerId as PowerId].color;
        } else if (isLand) {
          fill = "#e0d8c3";
        } else {
          fill = "#a5c3d4"; // sea color
        }

        const isHovered = hoverId === p.id;
        const isMoveTarget = highlightMove.has(p.id);
        const isSupportTarget = highlightSupport.has(p.id);
        const isChanged = changed.includes(p.id);

        let stroke = isLand ? "#6b5d42" : "#7b9cb0";
        let strokeWidth = 1;
        let opacity = 0.7;

        if (isHovered) {
          opacity = 0.95;
          strokeWidth = 2;
          stroke = "#3f3624";
        } else if (isMoveTarget) {
          opacity = 0.85;
          strokeWidth = 2;
          stroke = "#d97706";
        } else if (isSupportTarget) {
          opacity = 0.85;
          strokeWidth = 2;
          stroke = "#0891b2";
        } else if (isChanged) {
          opacity = 0.9;
          strokeWidth = 1.8;
          stroke = "#fbbf24";
        }

        return (
          <path
            key={p.id}
            d={pathData}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            opacity={opacity}
            style={{ cursor: "pointer", transition: "stroke 0.15s, stroke-width 0.15s, opacity 0.15s" }}
            onClick={() => onProvinceClick(p.id)}
            onMouseEnter={() => setHoverId(p.id)}
            onMouseLeave={() => setHoverId((h) => (h === p.id ? null : h))}
          />
        );
      })}
    </g>
  );
});

export default MapPaths;
