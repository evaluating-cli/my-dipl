import { ScrollText } from "lucide-react";
import Panel from "./Panel";

interface LogPanelProps {
  log: string[];
}

export default function LogPanel({ log }: LogPanelProps) {
  return (
    <Panel title="War Diary" icon={<ScrollText size={13} />}>
      <div className="max-h-72 space-y-1 overflow-y-auto pr-1 text-[12px] leading-relaxed text-slate-400 [scrollbar-width:thin]">
        {log.slice(-60).map((line, i) =>
          line.startsWith("────") ? (
            <p key={i} className="pt-2 font-display text-[11px] font-bold tracking-[0.18em] text-amber-200/70">
              {line.replace(/─/g, "—")}
            </p>
          ) : (
            <p key={i}>{line}</p>
          ),
        )}
      </div>
    </Panel>
  );
}
