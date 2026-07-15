import { POWER_MAP, type PowerId } from "../data/map";

interface PowerChipProps {
  power: PowerId;
  count: number;
  active?: boolean;
}

export default function PowerChip({ power, count, active }: PowerChipProps) {
  const info = POWER_MAP[power];
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all ${
        active ? "border-amber-300 bg-white/10 ring-1 ring-amber-300/60" : "border-white/10 bg-white/5"
      }`}
      title={`${info.name} — ${count} supply centres`}
    >
      <span className="h-3 w-3 rounded-full border border-white/30" style={{ background: info.color }} />
      <span className="text-slate-200">{info.name}</span>
      <span className="tabular-nums text-amber-200">{count}</span>
    </div>
  );
}
