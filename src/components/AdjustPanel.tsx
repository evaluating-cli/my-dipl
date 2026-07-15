import { motion } from "framer-motion";
import { Plus, X, Minus, ArrowRight, Landmark } from "lucide-react";
import UnitToken from "./UnitToken";
import Panel from "./Panel";
import { PROVINCE_MAP } from "../data/map";
import { provName, type Unit, type UnitType } from "../game/engine";

interface AdjustPanelProps {
  canBuild: number;
  mustDisband: number;
  centers: string[];
  units: Unit[];
  builds: { type: UnitType; loc: string }[];
  disbands: string[];
  valid: boolean;
  onBuild: (b: { type: UnitType; loc: string }) => void;
  onRemoveBuild: (loc: string) => void;
  onToggleDisband: (id: string) => void;
  onConfirm: () => void;
  year: number;
}

export default function AdjustPanel(props: AdjustPanelProps) {
  const { canBuild, mustDisband, centers, units, builds, disbands, valid } = props;
  const nothingNeeded = canBuild === 0 && mustDisband === 0;

  return (
    <>
      {(canBuild > 0 || mustDisband > 0) && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-400/15 p-3 text-center text-xs font-bold text-amber-200">
          Winter muster
          {canBuild > 0 && ` — raise ${canBuild} new unit${canBuild > 1 ? "s" : ""}`}
          {canBuild > 0 && mustDisband > 0 && " and"}
          {mustDisband > 0 && ` disband ${mustDisband}`}
        </div>
      )}

      {nothingNeeded && (
        <Panel title="Winter Muster" icon={<Landmark size={13} />}>
          <p className="text-xs leading-relaxed text-slate-400">
            Your forces match your supply centres. No adjustments are needed this winter.
          </p>
        </Panel>
      )}

      {canBuild > 0 && (
        <Panel title={`Raise Units · ${builds.length}/${canBuild}`} icon={<Landmark size={13} />}>
          {centers.length === 0 ? (
            <p className="text-xs text-slate-500">No empty home centres are available for building.</p>
          ) : (
            <ul className="space-y-1.5">
              {centers.map((c) => {
                const built = builds.find((b) => b.loc === c);
                const coastal = PROVINCE_MAP[c].coast;
                return (
                  <li
                    key={c}
                    className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2"
                  >
                    <span className="text-sm font-medium text-slate-200">{provName(c)}</span>
                    {built ? (
                      <button
                        onClick={() => props.onRemoveBuild(c)}
                        className="flex items-center gap-1.5 text-xs font-bold text-rose-300 transition hover:text-rose-200"
                      >
                        <UnitToken type={built.type} power={units[0]?.power ?? "NEU"} size={16} />
                        {built.type === "A" ? "Army" : "Fleet"}
                        <X size={13} />
                      </button>
                    ) : (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => props.onBuild({ type: "A", loc: c })}
                          disabled={builds.length >= canBuild}
                          className="flex items-center gap-1 rounded-md bg-slate-600/80 px-2 py-1.5 text-[11px] font-bold text-white transition hover:bg-slate-500/80 disabled:opacity-30"
                        >
                          <Plus size={12} />
                          Army
                        </button>
                        {coastal && (
                          <button
                            onClick={() => props.onBuild({ type: "F", loc: c })}
                            disabled={builds.length >= canBuild}
                            className="flex items-center gap-1 rounded-md bg-cyan-700/80 px-2 py-1.5 text-[11px] font-bold text-white transition hover:bg-cyan-600/80 disabled:opacity-30"
                          >
                            <Plus size={12} />
                            Fleet
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      )}

      {mustDisband > 0 && (
        <Panel title={`Disband Units · ${disbands.length}/${mustDisband}`} icon={<Minus size={13} />}>
          <ul className="space-y-1.5">
            {units.map((u) => {
              const sel = disbands.includes(u.id);
              return (
                <li key={u.id}>
                  <button
                    onClick={() => props.onToggleDisband(u.id)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                      sel ? "border-rose-400/50 bg-rose-400/10" : "border-white/10 bg-black/20 hover:border-white/25"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-medium text-slate-200">
                      <UnitToken type={u.type} power={u.power} />
                      {provName(u.loc)}
                    </span>
                    <span className={`text-[11px] font-bold ${sel ? "text-rose-300" : "text-slate-500"}`}>
                      {sel ? "DISBAND" : "KEEP"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={props.onConfirm}
        disabled={!valid}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-700 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/50 transition disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-700 disabled:opacity-50"
      >
        Advance to Spring {props.year + 1}
        <ArrowRight size={15} />
      </motion.button>
    </>
  );
}
