import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, ArrowRight, Lightbulb } from "lucide-react";
import type { MetricChange, Round } from "@/game/data";

interface Props {
  open: boolean;
  round: Round;
  picked: "A" | "B" | "C" | "D";
  isGood: boolean;
  changes: MetricChange;
  onContinue: () => void;
}

const METRIC_LABELS: Record<keyof MetricChange, string> = {
  businessImpact: "Tác động KD",
  encryptedData: "Dữ liệu mã hóa",
  downtimeHours: "Giờ ngừng hoạt động",
  customerTrust: "Niềm tin khách hàng",
  reputationDamage: "Thiệt hại uy tín",
  backupHealth: "Backup Health",
  recoveryReadiness: "Sẵn sàng khôi phục",
  defenderScore: "Defender Score",
};

const POSITIVE_KEYS: (keyof MetricChange)[] = [
  "defenderScore",
  "customerTrust",
  "backupHealth",
  "recoveryReadiness",
];

export function FeedbackModal({ open, round, picked, isGood, changes, onContinue }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[oklch(0.05_0.02_260/0.85)] backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className={`relative max-w-2xl w-full glass-strong rounded-3xl overflow-hidden ${
              isGood ? "shadow-safe" : "shadow-danger"
            }`}
          >
            <div
              className={`h-2 w-full ${isGood ? "gradient-safe" : "gradient-danger"}`}
            />
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                {isGood ? (
                  <CheckCircle2 className="text-neon-green" size={36} />
                ) : (
                  <AlertTriangle className="text-neon-red animate-pulse" size={36} />
                )}
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    Vòng {round.index} · Đáp án của bạn: {picked}
                  </div>
                  <h2
                    className={`font-display text-2xl md:text-3xl ${
                      isGood ? "text-neon-green text-glow-green" : "text-neon-red text-glow-red"
                    }`}
                  >
                    {isGood ? "Quyết định tốt" : "Quyết định rủi ro"}
                  </h2>
                </div>
              </div>

              <p className="text-foreground/90 text-base md:text-lg leading-relaxed mb-4">
                {isGood ? round.goodConsequence : round.riskyConsequence}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-5">
                {(Object.keys(changes) as (keyof MetricChange)[]).map((k) => {
                  const v = changes[k] ?? 0;
                  if (v === 0) return null;
                  const positive = POSITIVE_KEYS.includes(k) ? v > 0 : v < 0;
                  return (
                    <motion.div
                      key={k}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                        positive
                          ? "bg-[oklch(0.3_0.12_145/0.4)] text-neon-green"
                          : "bg-[oklch(0.3_0.18_25/0.4)] text-neon-red"
                      }`}
                    >
                      <span className="text-xs">{METRIC_LABELS[k]}</span>
                      <span className="font-display tabular-nums">
                        {v > 0 ? `+${v}` : v}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-[oklch(0.25_0.1_230/0.35)] border border-[oklch(0.6_0.15_230/0.3)] mb-6">
                <Lightbulb className="text-neon-amber flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <div className="text-xs uppercase tracking-widest text-neon-amber mb-1">
                    Bài học
                  </div>
                  <div className="text-foreground/90">{round.lesson}</div>
                </div>
              </div>

              <button
                onClick={onContinue}
                className="w-full gradient-neon text-primary-foreground font-display uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition shadow-neon"
              >
                Tiếp tục <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
