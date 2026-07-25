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
      className="relative overflow-hidden rounded-xl border border-white/10 bg-[#1a1713]/70 backdrop-blur-md p-4 shadow-2xl"
    >
      {/* Decorative top gold line */}
      <div className="absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-[#a08c60]/50 to-transparent" />
      
      <h2 className="mb-3.5 flex items-center gap-2 font-display text-[10.5px] font-bold uppercase tracking-[0.22em] text-amber-200/95">
        <span className="text-amber-400/90">{icon}</span>
        {title}
      </h2>
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.section>
  );
}
