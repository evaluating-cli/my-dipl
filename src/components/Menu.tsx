import { motion } from "framer-motion";
import { ScrollText, Shield, Swords } from "lucide-react";
import {
  GREAT_POWERS,
  HOME_SUPPLY,
  POWER_MAP,
  STARTING_UNITS,
  WIN_CENTERS,
  type PowerId,
} from "../data/map";

interface MenuProps {
  pick: PowerId;
  setPick: (p: PowerId) => void;
  onStart: (p: PowerId) => void;
}

export default function Menu({ pick, setPick, onStart }: MenuProps) {
  const info = POWER_MAP[pick];
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#191713] px-4 py-10 text-slate-200">
      {/* ambience */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(1000px 500px at 70% -10%, rgba(217,164,65,.14), transparent 60%), radial-gradient(800px 500px at 10% 110%, rgba(59,86,120,.18), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300/30 bg-gradient-to-br from-[#2b2620] to-[#191713] shadow-2xl">
            <Swords size={30} className="text-amber-300" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.5em] text-amber-200/70">The game of international intrigue</p>
          <h1 className="font-display mt-1 text-5xl font-black tracking-[0.12em] text-amber-100 md:text-6xl">
            DIPLOMACY
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
            Europe, 1901. Seven great powers, one continent, no dice — only strategy.
            Choose your nation and outmanoeuvre six rival powers fought automatically by the machine.
          </p>
        </motion.div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {GREAT_POWERS.map((p, i) => {
            const pi = POWER_MAP[p];
            const uCount = STARTING_UNITS.filter((s) => s.power === p).length;
            const scCount = HOME_SUPPLY[p as Exclude<PowerId, "NEU">].length;
            const sel = pick === p;
            return (
              <motion.button
                key={p}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                onClick={() => setPick(p)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  sel ? "scale-[1.025] shadow-2xl" : "hover:border-white/25"
                }`}
                style={{
                  borderColor: sel ? pi.color : "rgba(255,255,255,0.08)",
                  background: sel ? `${pi.color}26` : "rgba(255,255,255,0.04)",
                }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-display text-[15px] font-bold tracking-wide" style={{ color: sel ? pi.color : "#e2e8f0" }}>
                    {pi.name}
                  </span>
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-md text-[13px] font-black text-white shadow"
                    style={{ background: pi.color }}
                  >
                    {pi.monogram}
                  </span>
                </div>
                <p className="mb-3 min-h-10 text-[11px] leading-snug text-slate-400">{pi.blurb}</p>
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <Shield size={11} /> {uCount} units · {scCount} home centres
                </p>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mx-auto mb-8 max-w-3xl rounded-xl border border-white/10 bg-white/[0.04] p-5 text-[13px] leading-relaxed text-slate-400"
        >
          <h2 className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-200/80">
            <ScrollText size={13} /> How it plays
          </h2>
          Each year brings a <b className="text-slate-200">Spring</b> and a <b className="text-slate-200">Fall</b> turn. Issue{" "}
          <b className="text-amber-300">Move</b>, <b className="text-cyan-300">Support</b> and{" "}
          <b className="text-slate-200">Hold</b> orders, then watch every power resolve at once — a province falls when
          attacking strength (<b className="text-slate-200">1 + supports</b>) beats defending strength. Dislodged units retreat
          or disband. After each Fall, occupied supply centres change hands; over the winter you raise or
          disband units to match your holdings. First to <b className="text-amber-300">{WIN_CENTERS} supply centres</b> wins.
        </motion.div>

        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onStart(pick)}
            className="rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 px-9 py-3.5 text-base font-black tracking-wide text-[#241a05] shadow-2xl shadow-amber-950/50"
          >
            Lead {info.name} into War
          </motion.button>
        </div>
      </div>
    </div>
  );
}
