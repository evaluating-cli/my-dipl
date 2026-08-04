import { CornerDownRight, Trash2 } from "lucide-react";
import { provName, type DislodgedUnit } from "../game/engine";
import Panel from "./Panel";

interface RetreatPanelProps {
  units: DislodgedUnit[];
  choices: Record<string, string | null>;
  destinations: Record<string, string[]>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDisband: (id: string) => void;
  onConfirm: () => void;
}

export default function RetreatPanel(props: RetreatPanelProps) {
  const { units, choices, destinations, selectedId, onSelect, onDisband, onConfirm } = props;
  return (
    <Panel title="Retreats" icon={<CornerDownRight size={15} />}>
      <p className="mb-3 text-xs leading-relaxed text-slate-400">
        Select each displaced unit, then choose a highlighted province on the map or disband it.
      </p>
      <div className="space-y-2">
        {units.map(({ unit }) => (
          <div key={unit.id} className={`rounded-lg border p-2 ${selectedId === unit.id ? "border-amber-400/60 bg-amber-400/10" : "border-white/10"}`}>
            <button className="w-full text-left text-xs font-semibold text-slate-200" onClick={() => onSelect(unit.id)}>
              {unit.type === "A" ? "Army" : "Fleet"} {provName(unit.loc)}
            </button>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>{choices[unit.id] ? `→ ${provName(choices[unit.id]!)}` : `${destinations[unit.id]?.length ?? 0} legal destination(s)`}</span>
              <button onClick={() => onDisband(unit.id)} className="flex items-center gap-1 text-rose-300 hover:text-rose-200">
                <Trash2 size={12} /> Disband
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onConfirm}
        disabled={units.some(({ unit }) => choices[unit.id] === undefined)}
        className="mt-4 w-full rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-[#241a05] disabled:opacity-40"
      >
        Resolve Retreats
      </button>
    </Panel>
  );
}
