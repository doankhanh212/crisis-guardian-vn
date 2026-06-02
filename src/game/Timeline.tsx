import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { TIMELINE_STAGES } from "@/game/data";

interface Props {
  currentStage: string;
  completedCount: number;
}

export function Timeline({ currentStage, completedCount }: Props) {
  return (
    <div className="glass rounded-2xl p-3 md:p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-neon-blue animate-pulse" />
        <h3 className="font-display uppercase text-xs tracking-widest text-muted-foreground">
          Dòng thời gian tấn công
        </h3>
      </div>
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
        {TIMELINE_STAGES.map((stage, i) => {
          const isCompleted = i < completedCount;
          const isCurrent = stage === currentStage;
          return (
            <div key={stage} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center gap-1 min-w-[60px] md:min-w-[80px]">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.15 : 1,
                  }}
                  className={`relative h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center text-xs font-display ${
                    isCurrent
                      ? "bg-neon-blue text-primary-foreground shadow-neon"
                      : isCompleted
                      ? "bg-[oklch(0.3_0.12_145/0.6)] text-neon-green ring-1 ring-[oklch(0.82_0.22_145/0.5)]"
                      : "bg-[oklch(0.2_0.03_260)] text-muted-foreground"
                  }`}
                >
                  {isCompleted && !isCurrent ? <Check size={16} /> : i + 1}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full ring-2 ring-neon-blue animate-ping opacity-60" />
                  )}
                </motion.div>
                <div
                  className={`text-[9px] md:text-[10px] uppercase tracking-wider text-center ${
                    isCurrent
                      ? "text-neon-blue font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {stage}
                </div>
              </div>
              {i < TIMELINE_STAGES.length - 1 && (
                <div
                  className={`h-px w-3 md:w-6 ${
                    isCompleted ? "bg-neon-green/50" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
