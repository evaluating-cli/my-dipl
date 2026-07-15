import UnitToken from "./UnitToken";

export default function LegendBar() {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 px-2 pb-1 text-[11px] text-slate-500">
      <span className="flex items-center gap-1.5">
        <UnitToken type="A" power="GER" size={14} /> Army
      </span>
      <span className="flex items-center gap-1.5">
        <UnitToken type="F" power="ENG" size={14} /> Fleet
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full border border-white/60 bg-amber-500" /> Supply centre (coloured by holder)
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-1.5 w-6 rounded-full bg-amber-500" /> Planned move
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-1.5 w-6 rounded-full bg-cyan-600" /> Planned support
      </span>
    </div>
  );
}
