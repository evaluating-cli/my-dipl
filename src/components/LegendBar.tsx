import UnitToken from "./UnitToken";

export default function LegendBar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-medium tracking-wide text-slate-500">
      <span className="flex cursor-default items-center gap-1.5 transition-colors hover:text-slate-300">
        <UnitToken type="A" power="GER" size={14} /> 
        <span>Army</span>
      </span>
      <span className="flex cursor-default items-center gap-1.5 transition-colors hover:text-slate-300">
        <UnitToken type="F" power="ENG" size={14} /> 
        <span>Fleet</span>
      </span>
      <span className="flex cursor-default items-center gap-1.5 transition-colors hover:text-slate-300">
        <span className="inline-block h-2.5 w-2.5 rounded-full border border-black/40 bg-amber-500 shadow-sm" /> 
        <span>Supply Center</span>
      </span>
      <span className="flex cursor-default items-center gap-1.5 transition-colors hover:text-slate-300">
        <span className="inline-block h-[2px] w-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600" /> 
        <span>March</span>
      </span>
      <span className="flex cursor-default items-center gap-1.5 transition-colors hover:text-slate-300">
        <span className="inline-block h-[2px] w-4 rounded-full bg-gradient-to-r from-cyan-600 to-cyan-500" /> 
        <span>Support</span>
      </span>
    </div>
  );
}

