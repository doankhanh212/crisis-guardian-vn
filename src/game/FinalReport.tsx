import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Award,
  RotateCcw,
  ShieldCheck,
  Trophy,
  AlertOctagon,
  Printer,
} from "lucide-react";
import type { GradeResult, Metrics } from "@/game/data";
import { FINAL_LESSONS } from "@/game/data";

interface Props {
  metrics: Metrics;
  result: GradeResult;
  teamName: string;
  onRestart: () => void;
}

const TONE_STYLES: Record<
  GradeResult["tone"],
  { ring: string; text: string; bar: string; icon: React.ReactNode }
> = {
  excellent: {
    ring: "ring-[oklch(0.82_0.22_145/0.8)]",
    text: "text-neon-green text-glow-green",
    bar: "gradient-safe",
    icon: <Trophy size={48} />,
  },
  good: {
    ring: "ring-[oklch(0.78_0.18_230/0.8)]",
    text: "text-neon-blue text-glow-blue",
    bar: "gradient-neon",
    icon: <ShieldCheck size={48} />,
  },
  warn: {
    ring: "ring-[oklch(0.83_0.18_80/0.8)]",
    text: "text-neon-amber",
    bar: "bg-[oklch(0.83_0.18_80)]",
    icon: <Award size={48} />,
  },
  fail: {
    ring: "ring-[oklch(0.7_0.25_25/0.8)]",
    text: "text-neon-red text-glow-red",
    bar: "gradient-danger",
    icon: <AlertOctagon size={48} />,
  },
};

export function FinalReport({ metrics, result, teamName, onRestart }: Props) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (result.tone === "excellent" || result.tone === "good") {
      const colors = ["#5fd0c6", "#7cf0a8", "#7ec5ff", "#ffd166"];
      const burst = (x: number) =>
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { x, y: 0.3 },
          colors,
        });
      burst(0.25);
      setTimeout(() => burst(0.75), 200);
      setTimeout(() => burst(0.5), 400);
    }
  }, [result.tone]);

  const tone = TONE_STYLES[result.tone];

  const whatWentRight: string[] = [];
  const whatWentWrong: string[] = [];
  if (metrics.defenderScore >= 90) whatWentRight.push("Quyết định tốt giúp tăng Defender Score.");
  if (metrics.backupHealth >= 70) whatWentRight.push("Backup được bảo vệ tốt.");
  if (metrics.customerTrust >= 70) whatWentRight.push("Niềm tin khách hàng được giữ ổn định.");
  if (metrics.encryptedData <= 30) whatWentRight.push("Hạn chế được phạm vi mã hóa.");
  if (whatWentRight.length === 0) whatWentRight.push("Doanh nghiệp vẫn duy trì hoạt động.");

  if (metrics.encryptedData > 30) whatWentWrong.push("Một phần lớn dữ liệu bị mã hóa.");
  if (metrics.backupHealth < 70) whatWentWrong.push("Backup bị ảnh hưởng, giảm khả năng phục hồi.");
  if (metrics.customerTrust < 70) whatWentWrong.push("Niềm tin khách hàng bị suy giảm.");
  if (metrics.downtimeHours >= 4) whatWentWrong.push("Thời gian ngừng hoạt động kéo dài.");
  if (whatWentWrong.length === 0) whatWentWrong.push("Không có vấn đề nghiêm trọng được ghi nhận.");

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">
          Báo cáo sự cố cuối cùng
        </div>
        <h1 className="font-display text-3xl md:text-5xl text-glow-blue">
          {teamName || "Đội của bạn"}
        </h1>
      </motion.div>

      {/* Badge */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.1 }}
        className={`relative mx-auto mb-8 w-full max-w-xl rounded-3xl glass-strong p-8 md:p-10 ring-2 ${tone.ring} text-center overflow-hidden`}
      >
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${tone.bar}`} />
        <div className={`mx-auto mb-3 ${tone.text}`}>{tone.icon}</div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Final Grade
        </div>
        <h2 className={`font-display text-3xl md:text-4xl mb-2 ${tone.text}`}>
          {result.grade}
        </h2>
        <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-display uppercase tracking-widest ${tone.bar} text-primary-foreground mb-4`}>
          {result.badge}
        </div>
        <p className="text-foreground/85 max-w-md mx-auto">{result.message}</p>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-3 mb-6">
        {[
          ["Defender Score", metrics.defenderScore, ""],
          ["Dữ liệu mã hóa", metrics.encryptedData, "%"],
          ["Giờ ngừng HĐ", metrics.downtimeHours, "h"],
          ["Niềm tin KH", metrics.customerTrust, "%"],
          ["Backup Health", metrics.backupHealth, "%"],
          ["Sẵn sàng KP", metrics.recoveryReadiness, "%"],
          ["Tác động KD", metrics.businessImpact, "%"],
          ["Thiệt hại uy tín", metrics.reputationDamage, "%"],
        ].map(([label, value, suffix], i) => (
          <motion.div
            key={label as string}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="glass rounded-xl p-3 text-center"
          >
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {label}
            </div>
            <div className="font-display text-2xl text-neon-blue tabular-nums">
              {value}
              {suffix}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-5 ring-1 ring-[oklch(0.82_0.22_145/0.4)]"
        >
          <h3 className="font-display text-neon-green mb-3 uppercase text-sm tracking-widest">
            Điểm tốt
          </h3>
          <ul className="space-y-2">
            {whatWentRight.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-foreground/85">
                <span className="text-neon-green">✓</span> {s}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-5 ring-1 ring-[oklch(0.7_0.25_25/0.4)]"
        >
          <h3 className="font-display text-neon-red mb-3 uppercase text-sm tracking-widest">
            Điểm cần cải thiện
          </h3>
          <ul className="space-y-2">
            {whatWentWrong.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-foreground/85">
                <span className="text-neon-red">!</span> {s}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass rounded-2xl p-5 mb-6"
      >
        <h3 className="font-display text-neon-blue mb-3 uppercase text-sm tracking-widest">
          5 Bài học cần nhớ
        </h3>
        <ol className="space-y-2 list-decimal list-inside">
          {FINAL_LESSONS.map((l) => (
            <li key={l} className="text-foreground/90">
              {l}
            </li>
          ))}
        </ol>
      </motion.div>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onRestart}
          className="gradient-neon text-primary-foreground font-display uppercase tracking-widest px-6 py-3 rounded-xl flex items-center gap-2 shadow-neon hover:opacity-90"
        >
          <RotateCcw size={18} /> Chơi lại
        </button>
        <button
          onClick={() => window.print()}
          className="glass px-6 py-3 rounded-xl font-display uppercase tracking-widest text-sm flex items-center gap-2 hover:bg-[oklch(0.3_0.06_260/0.6)]"
        >
          <Printer size={18} /> In báo cáo
        </button>
      </div>
    </div>
  );
}
