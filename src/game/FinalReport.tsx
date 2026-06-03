import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import confetti from "canvas-confetti";
import {
  Award,
  RotateCcw,
  ShieldCheck,
  Trophy,
  AlertOctagon,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileText,
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
  { ring: string; text: string; bar: string; icon: ReactNode; label: string }
> = {
  excellent: {
    ring: "ring-[oklch(0.82_0.22_145/0.8)]",
    text: "text-neon-green text-glow-green",
    bar: "gradient-safe",
    icon: <Trophy size={56} />,
    label: "Doanh nghiệp sống sót",
  },
  good: {
    ring: "ring-[oklch(0.78_0.18_230/0.8)]",
    text: "text-neon-blue text-glow-blue",
    bar: "gradient-neon",
    icon: <ShieldCheck size={56} />,
    label: "Phục hồi được",
  },
  warn: {
    ring: "ring-[oklch(0.83_0.18_80/0.8)]",
    text: "text-neon-amber",
    bar: "bg-[oklch(0.83_0.18_80)]",
    icon: <Award size={56} />,
    label: "Cần vá quy trình",
  },
  fail: {
    ring: "ring-[oklch(0.7_0.25_25/0.8)]",
    text: "text-neon-red text-glow-red",
    bar: "gradient-danger",
    icon: <AlertOctagon size={56} />,
    label: "Khủng hoảng nghiêm trọng",
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
          particleCount: 90,
          spread: 75,
          origin: { x, y: 0.3 },
          colors,
        });
      burst(0.25);
      setTimeout(() => burst(0.75), 200);
      setTimeout(() => burst(0.5), 420);
    }
  }, [result.tone]);

  const tone = TONE_STYLES[result.tone];

  const whatWentRight: string[] = [];
  const whatWentWrong: string[] = [];
  if (metrics.defenderScore >= 90) whatWentRight.push("Các quyết định đúng lúc giúp điểm bảo vệ tăng mạnh.");
  if (metrics.backupHealth >= 70) whatWentRight.push("Bản sao dữ liệu cứu hộ còn đủ khỏe để làm phao cứu sinh.");
  if (metrics.customerTrust >= 70) whatWentRight.push("Khách hàng chưa vui, nhưng vẫn còn niềm tin.");
  if (metrics.encryptedData <= 30) whatWentRight.push("Phạm vi dữ liệu bị khóa được hạn chế trước khi lan rộng.");
  if (whatWentRight.length === 0) whatWentRight.push("Doanh nghiệp vẫn còn cơ hội phục hồi nếu hành động ngay.");

  if (metrics.encryptedData > 30) whatWentWrong.push("Một phần lớn dữ liệu bị khóa, kho dữ liệu công ty chính thức đình công.");
  if (metrics.backupHealth < 70) whatWentWrong.push("Bản sao dữ liệu cứu hộ bị ảnh hưởng hoặc chưa được bảo vệ đúng cách.");
  if (metrics.customerTrust < 70) whatWentWrong.push("Niềm tin khách hàng suy giảm, đội truyền thông bắt đầu tăng nhịp tim.");
  if (metrics.downtimeHours >= 4) whatWentWrong.push("Thời gian ngừng hoạt động kéo dài, tác động kinh doanh tăng rõ rệt.");
  if (whatWentWrong.length === 0) whatWentWrong.push("Không có sự cố nghiêm trọng. Đội cứu hộ kỹ thuật được uống cà phê có đường.");

  const summaryCards = [
    ["Điểm bảo vệ", metrics.defenderScore, ""],
    ["Dữ liệu bị khóa", metrics.encryptedData, "%"],
    ["Thời gian gián đoạn", metrics.downtimeHours, "h"],
    ["Niềm tin khách hàng", metrics.customerTrust, "%"],
    ["An toàn bản sao dữ liệu", metrics.backupHealth, "%"],
    ["Khả năng khôi phục", metrics.recoveryReadiness, "%"],
    ["Thiệt hại công việc", metrics.businessImpact, "%"],
    ["Ảnh hưởng uy tín", metrics.reputationDamage, "%"],
  ];

  return (
    <div className="relative min-h-screen overflow-hidden p-4 md:p-8">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-70" />
      <div className="pointer-events-none fixed inset-0 crisis-ambient" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <FileText size={14} /> Báo cáo sự cố cuối cùng
            </div>
            <h1 className="font-display text-3xl md:text-5xl text-glow-blue">
              {teamName || "Đội của bạn"}
            </h1>
          </div>
          <div className="rounded-full border border-neon-blue/35 bg-[oklch(0.18_0.06_230/0.45)] px-4 py-2 text-xs uppercase tracking-widest text-neon-blue">
            Báo cáo khủng hoảng cuối cùng
          </div>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr,1.1fr]">
          <motion.div
            initial={{ scale: 0.78, opacity: 0, rotate: -6 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 155, damping: 14, delay: 0.1 }}
            className={`relative overflow-hidden rounded-3xl glass-strong p-8 md:p-10 ring-2 ${tone.ring} text-center`}
          >
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${tone.bar}`} />
            <div className={`mx-auto mb-4 grid h-24 w-24 place-items-center rounded-3xl border border-current/35 bg-[oklch(0.1_0.03_260/0.45)] ${tone.text}`}>
              {tone.icon}
            </div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Huy hiệu kết quả · {tone.label}
            </div>
            <h2 className={`font-display text-4xl md:text-6xl leading-tight mb-3 ${tone.text}`}>
              {result.badge}
            </h2>
            <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-display uppercase tracking-widest ${tone.bar} text-primary-foreground mb-5`}>
              {result.grade}
            </div>
            <p className="text-lg text-foreground/92 max-w-xl mx-auto mb-3">
              {result.badgeDescription}
            </p>
            <p className="text-foreground/76 max-w-xl mx-auto">{result.message}</p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2">
            {summaryCards.map(([label, value, suffix], i) => (
              <motion.div
                key={label as string}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.04 }}
                className="glass rounded-2xl p-4"
              >
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {label}
                </div>
                <div className="mt-2 font-display text-3xl text-neon-blue tabular-nums">
                  {value}
                  {suffix}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 }}
            className="glass rounded-3xl p-5 ring-1 ring-[oklch(0.82_0.22_145/0.4)]"
          >
            <h3 className="font-display text-neon-green mb-3 uppercase text-sm tracking-widest">
              Điều làm tốt
            </h3>
            <ul className="space-y-3">
              {whatWentRight.map((s) => (
                <li key={s} className="flex gap-2 text-sm text-foreground/86">
                  <CheckCircle2 size={18} className="text-neon-green flex-shrink-0 mt-0.5" /> {s}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 }}
            className="glass rounded-3xl p-5 ring-1 ring-[oklch(0.7_0.25_25/0.4)]"
          >
            <h3 className="font-display text-neon-red mb-3 uppercase text-sm tracking-widest">
              Điều cần cải thiện
            </h3>
            <ul className="space-y-3">
              {whatWentWrong.map((s) => (
                <li key={s} className="flex gap-2 text-sm text-foreground/86">
                  <AlertTriangle size={18} className="text-neon-red flex-shrink-0 mt-0.5" /> {s}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72 }}
          className="mt-5 glass rounded-3xl p-5"
        >
          <h3 className="font-display text-neon-blue mb-3 uppercase text-sm tracking-widest">
            Bài học chính
          </h3>
          <ol className="grid gap-3 md:grid-cols-5">
            {FINAL_LESSONS.map((l, i) => (
              <li key={l} className="rounded-2xl border border-neon-blue/20 bg-[oklch(0.14_0.04_260/0.45)] p-3 text-sm text-foreground/90">
                <span className="mb-2 block font-display text-xl text-neon-blue">{i + 1}</span>
                {l}
              </li>
            ))}
          </ol>
        </motion.div>

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button
            onClick={onRestart}
            className="gradient-neon text-primary-foreground font-display uppercase tracking-widest px-6 py-3 rounded-2xl flex items-center gap-2 shadow-neon hover:opacity-90"
          >
            <RotateCcw size={18} /> Chơi lại
          </button>
          <button
            onClick={() => window.print()}
            className="glass px-6 py-3 rounded-2xl font-display uppercase tracking-widest text-sm flex items-center gap-2 hover:bg-[oklch(0.3_0.06_260/0.6)]"
          >
            <Printer size={18} /> In báo cáo
          </button>
        </div>
      </div>
    </div>
  );
}
