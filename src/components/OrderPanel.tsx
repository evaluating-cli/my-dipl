import { Hand, ArrowRight, LifeBuoy, Swords, X } from "lucide-react";
import UnitToken from "./UnitToken";
import Panel from "./Panel";
import { provName, type Unit, type Order } from "../game/engine";
import { orderText } from "./Board";

interface OrderPanelProps {
  units: Unit[];
  orders: Record<string, Order>;
  selectedUnit: Unit | null;
  pendingMode: "move" | "support" | null;
  onSelect: (id: string | null) => void;
  onHold: () => void;
  onMove: () => void;
  onSupport: () => void;
  onClearAll: () => void;
}

export default function OrderPanel(props: OrderPanelProps) {
  const { units, orders, selectedUnit, pendingMode } = props;
  const ordered = units.filter((u) => orders[u.id]).length;

  return (
    <Panel title={`Your Orders · ${ordered}/${units.length}`} icon={<Swords size={13} />}>
      {selectedUnit ? (
        <div className="mb-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-amber-100">
              <UnitToken type={selectedUnit.type} power={selectedUnit.power} />
              {provName(selectedUnit.loc)}
            </span>
            <button
              onClick={() => props.onSelect(null)}
              className="rounded p-1 text-slate-500 transition hover:bg-white/10 hover:text-slate-300"
              aria-label="Deselect"
            >
              <X size={14} />
            </button>
          </div>
          {pendingMode ? (
            <p className="text-xs font-medium leading-relaxed text-cyan-200">
              {pendingMode === "move"
                ? "Click a highlighted province on the map to march there."
                : "Click a highlighted neighbouring unit to lend it support."}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              <OrderButton onClick={props.onHold} icon={<Hand size={14} />} label="Hold" tone="slate" />
              <OrderButton onClick={props.onMove} icon={<ArrowRight size={14} />} label="Move" tone="amber" />
              <OrderButton onClick={props.onSupport} icon={<LifeBuoy size={14} />} label="Support" tone="cyan" />
            </div>
          )}
        </div>
      ) : (
        <p className="mb-3 rounded-lg bg-black/20 p-3 text-xs leading-relaxed text-slate-400">
          Select a unit below or on the map. Unordered units hold their ground.{" "}
          <span className="font-semibold text-amber-200/90">Support</span> reinforces a neighbouring
          unit — offensively if it attacks, defensively if it is attacked.
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
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                  sel
                    ? "border-amber-400/60 bg-amber-400/10"
                    : "border-white/10 bg-black/20 hover:border-white/25"
                }`}
              >
                <span className="flex items-center gap-2 font-medium text-slate-200">
                  <UnitToken type={u.type} power={u.power} />
                  {provName(u.loc)}
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
}

function OrderButton({ onClick, icon, label, tone }: OrderButtonProps) {
  const tones = {
    slate: "bg-slate-600/80 hover:bg-slate-500/80",
    amber: "bg-amber-600/90 hover:bg-amber-500/90 text-[#241a05]",
    cyan: "bg-cyan-700/80 hover:bg-cyan-600/80",
  };
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-bold text-white transition ${tones[tone]}`}
    >
      {icon}
      {label}
    </button>
  );
}

function OrderBadge({ order }: { order?: Order }) {
  const type = order?.type ?? "hold";
  const styles: Record<string, string> = {
    hold: "bg-slate-600/60 text-slate-200",
    move: "bg-amber-500/90 text-[#241a05]",
    support: "bg-cyan-600/80 text-white",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${styles[type]}`}>
      {orderText(order)}
    </span>
  );
}
