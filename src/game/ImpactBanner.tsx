import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props {
  message: string;
  isGood: boolean;
}

export function ImpactBanner({ message, isGood }: Props) {
  const Icon = isGood ? CheckCircle2 : AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 210, damping: 20 }}
      className={`relative overflow-hidden rounded-3xl border p-5 md:p-6 ${
        isGood
          ? "border-neon-green/65 bg-[oklch(0.22_0.12_145/0.55)] shadow-safe"
          : "border-neon-red/65 bg-[oklch(0.22_0.15_25/0.58)] shadow-danger"
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-1.5 ${isGood ? "gradient-safe" : "gradient-danger"}`} />
      <motion.div
        aria-hidden
        className="absolute inset-y-0 w-24 bg-white/10 blur-2xl"
        initial={{ left: "-30%" }}
        animate={{ left: "120%" }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <div className="relative flex items-start gap-4">
        <div
          className={`grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl border ${
            isGood
              ? "border-neon-green/60 bg-[oklch(0.25_0.13_145/0.6)] text-neon-green"
              : "border-neon-red/60 bg-[oklch(0.26_0.15_25/0.62)] text-neon-red animate-pulse"
          }`}
        >
          <Icon size={28} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Tác động tức thì
          </div>
          <div className="font-display text-xl md:text-3xl leading-tight text-foreground">
            {message}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
