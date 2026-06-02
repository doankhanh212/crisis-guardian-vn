import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import type { Metrics } from "@/game/data";
import {
  TrendingDown,
  TrendingUp,
  Database,
  Clock,
  Heart,
  AlertTriangle,
  HardDrive,
  Wrench,
  Trophy,
} from "lucide-react";

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const mv = useMotionValue(value);
  const rounded = useTransform(mv, (v) => `${Math.round(v)}${suffix}`);
  useEffect(() => {
    const c = animate(mv, value, { duration: 0.8, ease: "easeOut" });
    return c.stop;
  }, [value, mv]);
  return <motion.span>{rounded}</motion.span>;
}

interface MetricRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  tone: "good" | "bad" | "neutral";
  max?: number;
  pulseKey: number;
  pulseSign: 1 | -1 | 0;
}

function MetricRow({ icon, label, value, suffix, tone, max = 100, pulseKey, pulseSign }: MetricRowProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor =
    tone === "good"
      ? "gradient-safe"
      : tone === "bad"
      ? "gradient-danger"
      : "gradient-neon";
  const flash =
    pulseSign === 0
      ? ""
      : pulseSign > 0
      ? "shadow-[0_0_0_2px_oklch(0.82_0.22_145/0.6)]"
      : "shadow-[0_0_0_2px_oklch(0.7_0.25_25/0.6)]";

  return (
    <motion.div
      key={`${label}-${pulseKey}`}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      className={`p-2.5 rounded-xl glass transition-shadow ${flash}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="opacity-80">{icon}</span>
          <span className="font-medium">{label}</span>
        </div>
        <div className={`font-display text-base tabular-nums ${
          tone === "good" ? "text-neon-green" : tone === "bad" ? "text-neon-red" : "text-neon-blue"
        }`}>
          <AnimatedNumber value={value} suffix={suffix} />
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-[oklch(0.2_0.03_260/0.8)] overflow-hidden">
        <motion.div
          className={`h-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

interface Props {
  metrics: Metrics;
  prev: Metrics;
  pulseKey: number;
}

const sign = (a: number, b: number): 1 | -1 | 0 => (a > b ? 1 : a < b ? -1 : 0);

export function MetricsPanel({ metrics, prev, pulseKey }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <div className="h-2 w-2 rounded-full bg-neon-red animate-pulse" />
        <h3 className="font-display uppercase text-xs tracking-widest text-muted-foreground">
          Tác động kinh doanh
        </h3>
      </div>

      <MetricRow
        icon={<TrendingUp size={14} />}
        label="Defender Score"
        value={metrics.defenderScore}
        max={200}
        tone="good"
        pulseKey={pulseKey}
        pulseSign={sign(metrics.defenderScore, prev.defenderScore)}
      />
      <MetricRow
        icon={<AlertTriangle size={14} />}
        label="Tác động KD"
        value={metrics.businessImpact}
        suffix="%"
        tone="bad"
        pulseKey={pulseKey}
        pulseSign={sign(metrics.businessImpact, prev.businessImpact)}
      />
      <MetricRow
        icon={<Database size={14} />}
        label="Dữ liệu mã hóa"
        value={metrics.encryptedData}
        suffix="%"
        tone="bad"
        pulseKey={pulseKey}
        pulseSign={sign(metrics.encryptedData, prev.encryptedData)}
      />
      <MetricRow
        icon={<Clock size={14} />}
        label="Giờ ngừng hoạt động"
        value={metrics.downtimeHours}
        suffix="h"
        max={24}
        tone="bad"
        pulseKey={pulseKey}
        pulseSign={sign(metrics.downtimeHours, prev.downtimeHours)}
      />
      <MetricRow
        icon={<Heart size={14} />}
        label="Niềm tin khách hàng"
        value={metrics.customerTrust}
        suffix="%"
        tone="good"
        pulseKey={pulseKey}
        pulseSign={sign(metrics.customerTrust, prev.customerTrust)}
      />
      <MetricRow
        icon={<TrendingDown size={14} />}
        label="Thiệt hại uy tín"
        value={metrics.reputationDamage}
        suffix="%"
        tone="bad"
        pulseKey={pulseKey}
        pulseSign={sign(metrics.reputationDamage, prev.reputationDamage)}
      />
      <MetricRow
        icon={<HardDrive size={14} />}
        label="Backup Health"
        value={metrics.backupHealth}
        suffix="%"
        tone="good"
        pulseKey={pulseKey}
        pulseSign={sign(metrics.backupHealth, prev.backupHealth)}
      />
      <MetricRow
        icon={<Wrench size={14} />}
        label="Sẵn sàng khôi phục"
        value={metrics.recoveryReadiness}
        suffix="%"
        tone="good"
        pulseKey={pulseKey}
        pulseSign={sign(metrics.recoveryReadiness, prev.recoveryReadiness)}
      />

      <div className="mt-3 p-3 rounded-xl gradient-neon/10 glass flex items-center gap-3">
        <Trophy className="text-neon-amber" size={22} />
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Defender Score
          </div>
          <div className="font-display text-2xl text-glow-blue text-neon-blue tabular-nums">
            <AnimatedNumber value={metrics.defenderScore} />
          </div>
        </div>
      </div>
    </div>
  );
}
