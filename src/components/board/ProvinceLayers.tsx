import { COAST_LOCATIONS, PROVINCE_MAP, PROVINCES, type PowerId } from "../../data/map";
import { LandNode, SeaNode } from "../MapNodes";

interface ProvinceLayersProps {
  hoverId: string | null;
  moveTargets: Set<string>;
  supportTargets: Set<string>;
  changed: string[];
  occupiedLocations: Set<string>;
  centers: Record<string, PowerId>;
  zoomScale: number;
  onHover: (id: string | null) => void;
  onProvince: (id: string) => void;
}

export default function ProvinceLayers({ hoverId, moveTargets, supportTargets, changed, occupiedLocations, centers, zoomScale, onHover, onProvince }: ProvinceLayersProps) {
  const common = (id: string) => ({
    isHover: hoverId === id,
    isMoveT: moveTargets.has(id),
    isSupT: supportTargets.has(id),
    hasUnit: occupiedLocations.has(id),
    zoomScale,
    onEnter: () => onHover(id),
    onLeave: () => onHover(hoverId === id ? null : hoverId),
    onClick: () => onProvince(id),
  });

  return (
    <>
      <g style={{ pointerEvents: "none" }}>
        {PROVINCES.filter((province) => province.kind === "sea").map((province) => <SeaNode key={province.id} p={province} {...common(province.id)} />)}
      </g>
      <g style={{ pointerEvents: "none" }}>
        {PROVINCES.filter((province) => province.kind === "land").map((province) => (
          <LandNode key={province.id} p={province} isChanged={changed.includes(province.id)} supplyOwner={centers[province.id] ?? null} {...common(province.id)} />
        ))}
      </g>
      <g>
        {COAST_LOCATIONS.map((coast) => <SeaNode key={coast.id} p={PROVINCE_MAP[coast.id]} {...common(coast.id)} />)}
      </g>
    </>
  );
}
