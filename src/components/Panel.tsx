import { motion } from "framer-motion";

interface PanelProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export default function Panel({ title, icon, children }: PanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-[#2c2822] p-4 shadow-xl"
    >
      <h2 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200/80">
        {icon}
        {title}
      </h2>
      {children}
    </motion.section>
  );
}
