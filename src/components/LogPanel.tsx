import { ScrollText } from "lucide-react";
import Panel from "./Panel";

interface LogPanelProps {
  log: string[];
}

export default function LogPanel({ log }: LogPanelProps) {
  return (
    <Panel title="War Diary" icon={<ScrollText size={13} />}>
      <div className="max-h-72 space-y-1 overflow-y-auto pr-1 text-[12px] leading-relaxed [scrollbar-width:thin] text-slate-400">
        {log.slice(-60).map((line, i) => {
          if (line.startsWith("────")) {
            return (
              <p key={i} className="pt-3 pb-1 border-b border-[#a08c60]/20 font-display text-[11px] font-bold tracking-[0.16em] text-amber-300/80">
                {line.replace(/─/g, "—")}
              </p>
            );
          }
          
          let textClass = "text-slate-400/90";
          if (line.includes("fails to") || line.includes("bounces") || line.includes("disbanded") || line.includes("nowhere to retreat")) {
            textClass = "text-rose-400/80 italic";
          } else if (line.includes("advances to") || line.includes("storms") || line.includes("retreats to")) {
            textClass = "text-amber-100 font-medium";
          } else if (line.includes("belongs to")) {
            textClass = "text-emerald-400/85";
          } else if (line.includes("raises a new")) {
            textClass = "text-cyan-400/85";
          }
          
          return (
            <p key={i} className={`py-0.5 text-[11px] border-l-2 border-[#a08c60]/10 pl-2 hover:bg-white/[0.02] transition duration-150 ${textClass}`}>
              {line}
            </p>
          );
        })}
      </div>
    </Panel>
  );
}
