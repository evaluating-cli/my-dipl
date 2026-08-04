import { Hand, ArrowRight, LifeBuoy, Swords, X } from "lucide-react";
import UnitToken from "./UnitToken";
import Panel from "./Panel";
import { provName, type Unit, type Order } from "../game/engine";
import { orderText } from "./board/formatting";

interface OrderPanelProps {
  units: Unit[];
  orders: Record<string, Order>;
  selectedUnit: Unit | null;
  pendingMode: "move" | "support" | null;
  onSelect: (id: string | null) => void;
  onHold: () => void;
  onMove: () => void;
  onSupport: () => void;
  canMove: boolean;
  canSupport: boolean;
  onClearAll: () => void;
}

export default function OrderPanel(props: OrderPanelProps) {
  const { units, orders, selectedUnit, pendingMode } = props;
  const ordered = units.filter((u) => orders[u.id]).length;

  return (
    <Panel title={`Your Orders · ${ordered}/${units.length}`} icon={<Swords size={13} />}>
      {selectedUnit ? (
        <div className="mb-3.5 rounded-lg border border-amber-400/30 bg-amber-400/5 p-3.5 shadow-lg shadow-amber-950/20">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-amber-100">
              <UnitToken type={selectedUnit.type} power={selectedUnit.power} />
              <span className="font-display tracking-wide">{provName(selectedUnit.loc)}</span>
            </span>
            <button
              onClick={() => props.onSelect(null)}
              className="rounded-full p-1 text-slate-500 transition hover:bg-white/10 hover:text-slate-300"
              aria-label="Deselect"
            >
              <X size={14} />
            </button>
          </div>
          <p className="mb-2 text-[11px] font-medium leading-relaxed text-amber-200/90">
            {pendingMode === "support"
              ? "Click a highlighted unit. Its move destination (or hold) will be recorded in the support order."
              : "Click any highlighted neighbouring province on the map to move directly:"}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <OrderButton onClick={props.onHold} icon={<Hand size={14} />} label="Hold" tone="slate" />
            <OrderButton onClick={props.onMove} disabled={!props.canMove} icon={<ArrowRight size={14} />} label="Move" tone="amber" />
            <OrderButton onClick={props.onSupport} disabled={!props.canSupport} icon={<LifeBuoy size={14} />} label="Support" tone="cyan" />
          </div>
        </div>
      ) : (
        <p className="mb-3.5 rounded-lg bg-black/30 border border-white/[0.03] p-3 text-[11px] leading-relaxed text-slate-400">
          Select a unit below or on the map. Unordered units hold their ground.{" "}
          <span className="font-semibold text-amber-200/90">Support</span> reinforces a neighbouring
          unit — its current move is supported offensively, otherwise it is supported to hold.
        </p>
      )}

      <ul className="space-y-1.5">
        {units.map((u) => {
          const sel = selectedUnit?.id === u.id;
          const o = orders[u.id];
          return (
            <li key={u.id}>
              <button
                onClick={() => props.onSelect(sel ? null : u.id)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-all duration-200 ${
                  sel
                    ? "border-amber-400/50 bg-amber-400/10 shadow-md shadow-amber-950/20"
                    : "border-[#443c30]/50 bg-[#14120f]/40 hover:border-[#a08c60]/35 hover:bg-[#14120f]/70"
                }`}
              >
                <span className="flex items-center gap-2 font-medium text-slate-200">
                  <UnitToken type={u.type} power={u.power} />
                  <span className="text-[12.5px] font-semibold">{provName(u.loc)}</span>
                </span>
                <OrderBadge order={o} />
              </button>
            </li>
          );
        })}
      </ul>

      {ordered > 0 && (
        <button
          onClick={props.onClearAll}
          className="mt-3 w-full text-center text-[11px] font-semibold uppercase tracking-widest text-slate-500 transition hover:text-slate-300"
        >
          Clear all orders
        </button>
      )}
    </Panel>
  );
}

interface OrderButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tone: "slate" | "amber" | "cyan";
  disabled?: boolean;
}

function OrderButton({ onClick, icon, label, tone, disabled }: OrderButtonProps) {
  const tones = {
    slate: "bg-slate-800/80 hover:bg-slate-700/95 text-slate-100 border border-slate-700/50",
    amber: "bg-amber-600/90 hover:bg-amber-500 text-amber-950 font-extrabold border border-amber-500/40",
    cyan: "bg-cyan-800/80 hover:bg-cyan-700 text-cyan-100 border border-cyan-700/50",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg px-2.5 py-2.5 text-[10.5px] font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-sm disabled:cursor-not-allowed disabled:opacity-30 ${tones[tone]}`}
    >
      <span className="opacity-90">{icon}</span>
      {label}
    </button>
  );
}

function OrderBadge({ order }: { order?: Order }) {
  const type = order?.type ?? "hold";
  const styles: Record<string, string> = {
    hold: "bg-slate-800/80 text-slate-300 border border-slate-700/40",
    move: "bg-amber-600/90 text-[#1c1404] font-extrabold border border-amber-500/35",
    support: "bg-cyan-900/85 text-cyan-200 border border-cyan-700/40",
  };
  return (
    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[type]}`}>
      {orderText(order)}
    </span>
  );
}
