import { motion } from "framer-motion";
import { Plus, X, Minus, ArrowRight, Landmark } from "lucide-react";
import UnitToken from "./UnitToken";
import Panel from "./Panel";
import { PROVINCE_MAP, type UnitType } from "../data/map";
import { provName, type Unit, type ValidationError } from "../game/engine";

interface AdjustPanelProps {
  canBuild: number;
  mustDisband: number;
  centers: string[];
  units: Unit[];
  builds: { type: UnitType; loc: string }[];
  disbands: string[];
  valid: boolean;
  errors: ValidationError[];
  buildTypesByCenter: Record<string, UnitType[]>;
  disbandableIds: Set<string>;
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
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/[0.04] p-3 text-center text-xs font-bold text-amber-200 shadow-md">
          <span className="font-display uppercase tracking-wider text-amber-300">Winter Muster</span>
          {canBuild > 0 && ` — Raise ${canBuild} new unit${canBuild > 1 ? "s" : ""}`}
          {canBuild > 0 && mustDisband > 0 && " and"}
          {mustDisband > 0 && ` Disband ${mustDisband}`}
        </div>
      )}

      {nothingNeeded && (
        <Panel title="Winter Muster" icon={<Landmark size={13} />}>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Your forces match your supply centres. No adjustments are needed this winter.
          </p>
        </Panel>
      )}

      {canBuild > 0 && (
        <Panel title={`Raise Units · ${builds.length}/${canBuild}`} icon={<Landmark size={13} />}>
          {centers.length === 0 ? (
            <p className="text-[11px] text-slate-500">No empty home centres are available for building.</p>
          ) : (
            <ul className="space-y-1.5">
              {centers.map((c) => {
                const built = builds.find((b) => b.loc === c);
                const coastal = PROVINCE_MAP[c].coast;
                return (
                  <li
                    key={c}
                    className="flex items-center justify-between gap-2 rounded-lg border border-[#443c30]/50 bg-[#14120f]/40 px-3 py-2"
                  >
                    <span className="text-[12.5px] font-semibold text-slate-200">{provName(c)}</span>
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
                        {props.buildTypesByCenter[c]?.includes("A") && <button
                          onClick={() => props.onBuild({ type: "A", loc: c })}
                          disabled={builds.length >= canBuild}
                          className="flex items-center gap-1 rounded-md bg-slate-800 border border-slate-700/50 px-2 py-1.5 text-[10.5px] font-bold text-slate-100 transition hover:bg-slate-700 disabled:opacity-30"
                        >
                          <Plus size={11} />
                          Army
                        </button>}
                        {coastal && props.buildTypesByCenter[c]?.includes("F") && (
                          <button
                            onClick={() => props.onBuild({ type: "F", loc: c })}
                            disabled={builds.length >= canBuild}
                            className="flex items-center gap-1 rounded-md bg-cyan-900 border border-cyan-800/40 px-2 py-1.5 text-[10.5px] font-bold text-cyan-100 transition hover:bg-cyan-800 disabled:opacity-30"
                          >
                            <Plus size={11} />
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
                    disabled={!props.disbandableIds.has(u.id)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-all duration-200 ${
                      sel ? "border-rose-400/50 bg-rose-950/20 shadow-inner" : "border-[#443c30]/50 bg-[#14120f]/40 hover:border-[#a08c60]/35 hover:bg-[#14120f]/70"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-medium text-slate-200">
                      <UnitToken type={u.type} power={u.power} />
                      <span className="text-[12.5px] font-semibold">{provName(u.loc)}</span>
                    </span>
                    <span className={`text-[10px] font-bold tracking-wider ${sel ? "text-rose-400" : "text-slate-500"}`}>
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
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-emerald-600 to-emerald-800 border border-emerald-500/35 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-950/40 transition hover:from-emerald-500 hover:to-emerald-700 disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-900 disabled:border-slate-800 disabled:opacity-40"
      >
        <span>Advance to Spring {props.year + 1}</span>
        <ArrowRight size={15} />
      </motion.button>
      {!valid && props.errors.length > 0 && (
        <ul className="space-y-1 text-[11px] text-rose-300" role="alert">
          {props.errors.map((error, index) => <li key={`${error.code}-${index}`}>{error.message}</li>)}
        </ul>
      )}
    </>
  );
}
