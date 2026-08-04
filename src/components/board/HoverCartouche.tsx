import { POWER_MAP, type PowerId, type Province } from "../../data/map";
import type { Unit } from "../../game/engine";
import { unitColor } from "./formatting";

interface HoverCartoucheProps { province: Province | null; unit: Unit | null; controller: PowerId | null; }

export default function HoverCartouche({ province, unit, controller }: HoverCartoucheProps) {
  return <div className="pointer-events-none absolute left-4 top-4 z-10 min-w-[200px] max-w-[240px] rounded-xl border border-[#a08c60]/50 bg-[#f8f1de]/90 px-4 py-3 shadow-2xl backdrop-blur-sm">
    {province ? <div><p className="font-display text-[13px] font-bold tracking-wide text-[#3a3428]">{province.name}</p><p className="mt-0.5 text-[11px] text-[#6b6350]">{province.kind === "sea" ? "Open water" : province.fleetAdj.length > 0 ? "Coastal province" : "Inland province"}{province.supply === "home" && ` · Home centre of ${POWER_MAP[province.owner!].name}`}{province.supply === "neutral" && " · Neutral supply centre"}</p>
      {province.supply && controller && <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#6b6350]"><span className="inline-block h-2.5 w-2.5 rounded-full border border-white" style={{ background: unitColor(controller) }} />Controlled by {POWER_MAP[controller].name}</p>}
      {unit && <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#6b6350]"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: unitColor(unit.power) }} />{unit.type === "A" ? "Army" : "Fleet"} of {POWER_MAP[unit.power].name}</p>}</div>
      : <div><p className="font-display text-[13px] font-bold tracking-wide text-[#3a3428]">The Great War Board</p><p className="mt-0.5 text-[11px] text-[#6b6350]">Hover any province to inspect</p></div>}
  </div>;
}
