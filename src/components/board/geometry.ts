import { PROVINCE_MAP, PROVINCES, type Province } from "../../data/map";

export type ConnectionKind = "land" | "sea" | "coastal";

export interface ProvinceConnection {
  from: Province;
  to: Province;
  kind: ConnectionKind;
  key: string;
}

export interface CurvedPath {
  d: string;
  badgeX: number;
  badgeY: number;
}

export function curve(from: Province, to: Province): CurvedPath {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const controlX = midX + (-dy / length) * length * 0.16;
  const controlY = midY + (dx / length) * length * 0.16;

  return {
    d: `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`,
    badgeX: 0.25 * from.x + 0.5 * controlX + 0.25 * to.x,
    badgeY: 0.25 * from.y + 0.5 * controlY + 0.25 * to.y,
  };
}

export function buildConnections(): ProvinceConnection[] {
  const seen = new Set<string>();
  const connections: ProvinceConnection[] = [];

  for (const province of PROVINCES) {
    for (const adjacentId of [...province.armyAdj, ...province.fleetAdj]) {
      const target = PROVINCE_MAP[adjacentId];
      if (!target) continue;

      const key = [province.id, target.id].sort().join("-");
      if (seen.has(key)) continue;
      seen.add(key);

      let kind: ConnectionKind = "land";
      if (province.kind === "sea" && target.kind === "sea") kind = "sea";
      else if (province.kind === "sea" || target.kind === "sea") kind = "coastal";
      connections.push({ from: province, to: target, kind, key });
    }
  }

  return connections;
}

export const PROVINCE_CONNECTIONS = buildConnections();
