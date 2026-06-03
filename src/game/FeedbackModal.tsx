import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, ArrowRight, Lightbulb, Radio, Gauge } from "lucide-react";
import { ImpactBanner } from "@/game/ImpactBanner";
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
  businessImpact: "Thiệt hại công việc",
  encryptedData: "Dữ liệu bị khóa",
  downtimeHours: "Gián đoạn",
  customerTrust: "Niềm tin KH",
  reputationDamage: "Ảnh hưởng uy tín",
  backupHealth: "An toàn bản sao",
  recoveryReadiness: "Khả năng khôi phục",
  defenderScore: "Điểm bảo vệ",
};

const POSITIVE_KEYS: (keyof MetricChange)[] = [
  "defenderScore",
  "customerTrust",
  "backupHealth",
  "recoveryReadiness",
];

const LOWER_IS_BETTER_KEYS: (keyof MetricChange)[] = [
  "businessImpact",
  "encryptedData",
  "downtimeHours",
  "reputationDamage",
];

function isGoodMetricChange(key: keyof MetricChange, value: number) {
  if (LOWER_IS_BETTER_KEYS.includes(key)) return value < 0;
  if (POSITIVE_KEYS.includes(key)) return value > 0;
  return value > 0;
}

export function FeedbackModal({ open, round, picked, isGood, changes, onContinue }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[oklch(0.05_0.02_260/0.88)] backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.92, y: 28, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 190, damping: 21 }}
            className={`relative w-full max-w-5xl rounded-3xl glass-strong ${
              isGood ? "shadow-safe" : "shadow-danger"
            }`}
          >
            <div className={`h-2 w-full ${isGood ? "gradient-safe" : "gradient-danger"}`} />
            <div className="p-4 md:p-5">
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl ${
                    isGood
                      ? "bg-[oklch(0.25_0.12_145/0.5)] text-neon-green"
                      : "bg-[oklch(0.25_0.14_25/0.56)] text-neon-red animate-pulse"
                  }`}
                >
                  {isGood ? <CheckCircle2 size={30} /> : <AlertTriangle size={30} />}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    Vòng {round.index} · Đáp án của bạn: {picked}
                  </div>
                  <h2
                    className={`font-display text-2xl md:text-4xl ${
                      isGood ? "text-neon-green text-glow-green" : "text-neon-red text-glow-red"
                    }`}
                  >
                    {isGood ? "Quyết định tốt" : "Quyết định rủi ro"}
                  </h2>
                </div>
              </div>

              <ImpactBanner
                message={isGood ? round.goodImpact : round.riskyImpact}
                isGood={isGood}
              />

              <div className="mt-3 rounded-2xl border border-[oklch(0.6_0.1_230/0.24)] bg-[oklch(0.13_0.035_260/0.62)] p-3 md:p-4">
                <div className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">
                  Hậu quả quyết định
                </div>
                <p className="text-base md:text-lg leading-relaxed text-foreground/90">
                  {isGood ? round.goodConsequence : round.riskyConsequence}
                </p>
              </div>

              <div className="mt-3">
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <Gauge size={14} className="text-neon-blue" /> Chỉ số thay đổi
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {(Object.keys(changes) as (keyof MetricChange)[]).map((k) => {
                    const v = changes[k] ?? 0;
                    if (v === 0) return null;
                    const positive = isGoodMetricChange(k, v);
                    return (
                      <motion.div
                        key={k}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl border px-3 py-2 ${
                          positive
                            ? "border-neon-green/45 bg-[oklch(0.24_0.12_145/0.42)] text-neon-green"
                            : "border-neon-red/45 bg-[oklch(0.24_0.16_25/0.42)] text-neon-red"
                        }`}
                      >
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          {METRIC_LABELS[k]}
                        </div>
                        <div className="font-display text-2xl tabular-nums">
                          {v > 0 ? `+${v}` : v}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 flex items-start gap-3 rounded-2xl border border-neon-amber/35 bg-[oklch(0.23_0.1_80/0.32)] p-3">
                <Lightbulb className="text-neon-amber flex-shrink-0 mt-0.5" size={22} />
                <div>
                  <div className="text-xs uppercase tracking-widest text-neon-amber mb-1">
                    Bài học
                  </div>
                  <div className="text-foreground/90">{round.lesson}</div>
                </div>
              </div>

              {round.mcNote && (
                <details className="mt-3 rounded-2xl border border-neon-blue/25 bg-[oklch(0.2_0.08_230/0.24)] p-3 text-sm">
                  <summary className="flex cursor-pointer items-center gap-2 text-xs uppercase tracking-widest text-neon-blue">
                    <Radio size={16} /> Gợi ý cho MC
                  </summary>
                  <div className="mt-2 text-foreground/75">{round.mcNote}</div>
                </details>
              )}

              <button
                onClick={onContinue}
                className="mt-4 w-full gradient-neon text-primary-foreground font-display uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition shadow-neon"
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
