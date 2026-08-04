import { provName, type GameState, type Unit } from "../../game/engine";

interface HintPillProps { phase: GameState["phase"]; selectedUnit: Unit | null; pendingMode: "move" | "support" | null; busy: boolean; }

export default function HintPill({ phase, selectedUnit, pendingMode, busy }: HintPillProps) {
  let text: string | null = null;
  if (busy) text = "Adjudicating orders…";
  else if (phase === "Order") {
    if (pendingMode === "support" && selectedUnit) text = `Choose a neighbouring unit or province for ${provName(selectedUnit.loc)} to support`;
    else if (selectedUnit) text = `Click a neighbouring province to move ${selectedUnit.type === "A" ? "Army" : "Fleet"} ${provName(selectedUnit.loc)}, or click itself to Hold`;
    else text = "Click one of your units on the map to issue orders";
  }
  if (!text) return null;
  return <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-amber-200/40 bg-[#2b2620]/90 px-5 py-2 text-[12px] font-semibold tracking-wide text-amber-100 shadow-xl backdrop-blur-sm">{text}</div>;
}
