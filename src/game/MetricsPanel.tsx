import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, type ReactNode } from "react";
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
  Activity,
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

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  previous: number;
  suffix?: string;
  description: string;
  dangerDirection: "up" | "down";
  max?: number;
  pulseKey: number;
}

const LOWER_IS_BETTER_METRICS = [
  "Tác động kinh doanh",
  "Dữ liệu bị mã hóa",
  "Thời gian gián đoạn",
  "Thiệt hại uy tín",
];

function getTone(value: number, dangerDirection: "up" | "down") {
  const dangerous = dangerDirection === "up" ? value >= 60 : value <= 45;
  const warning = dangerDirection === "up" ? value >= 30 : value <= 70;
  if (dangerous) return "danger";
  if (warning) return "warn";
  return "good";
}

function isImprovedMetricChange(label: string, delta: number) {
  if (delta === 0) return null;
  return LOWER_IS_BETTER_METRICS.includes(label) ? delta < 0 : delta > 0;
}

function MetricCard({
  icon,
  label,
  value,
  previous,
  suffix,
  description,
  dangerDirection,
  max = 100,
  pulseKey,
}: MetricCardProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const delta = value - previous;
  const displaySuffix = suffix ?? "";
  const tone = getTone(value, dangerDirection);
  const improved = isImprovedMetricChange(label, delta);
  const toneClass =
    tone === "danger"
      ? "border-neon-red/45 bg-[oklch(0.2_0.09_25/0.48)] text-neon-red"
      : tone === "warn"
      ? "border-neon-amber/45 bg-[oklch(0.22_0.09_80/0.42)] text-neon-amber"
      : "border-neon-green/35 bg-[oklch(0.2_0.08_145/0.38)] text-neon-green";
  const barClass =
    tone === "danger" ? "gradient-danger" : tone === "warn" ? "bg-neon-amber" : "gradient-safe";

  return (
    <motion.div
      key={`${label}-${pulseKey}`}
      initial={{ opacity: 0.8, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border p-3.5 ${toneClass}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-50" />
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-foreground/85">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[oklch(0.1_0.025_260/0.55)]">
            {icon}
          </span>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {label}
            </div>
            <div className="text-[11px] text-foreground/62">{description}</div>
          </div>
        </div>
        {improved !== null && (
          <div
            className={`rounded-full border px-2 py-0.5 text-[10px] font-display ${
              improved
                ? "border-neon-green/40 text-neon-green"
                : "border-neon-red/40 text-neon-red"
            }`}
          >
            {delta > 0 ? "+" : ""}
            {Math.round(delta)}
            {displaySuffix}
          </div>
        )}
      </div>
      <div className="mb-2 font-display text-3xl leading-none tabular-nums text-foreground">
        <AnimatedNumber value={value} suffix={suffix} />
      </div>
      <div className="h-2 rounded-full bg-[oklch(0.08_0.02_260/0.72)] overflow-hidden">
        <motion.div
          className={`h-full ${barClass}`}
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

export function MetricsPanel({ metrics, prev, pulseKey }: Props) {
  return (
    <div className="glass-strong h-full rounded-3xl p-4 md:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-neon-red animate-pulse" />
            <h3 className="font-display uppercase text-sm tracking-widest text-foreground">
              Business Impact Console
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Chỉ số điều hành trong khủng hoảng ransomware
          </p>
        </div>
        <Activity className="text-neon-blue" size={22} />
      </div>

      <div className="mb-4 rounded-2xl border border-neon-blue/30 bg-[oklch(0.18_0.06_230/0.42)] p-4">
        <div className="flex items-center gap-3">
          <Trophy className="text-neon-amber" size={28} />
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Điểm phòng thủ
            </div>
            <div className="font-display text-4xl text-glow-blue text-neon-blue tabular-nums">
              <AnimatedNumber value={metrics.defenderScore} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
        <MetricCard
          icon={<AlertTriangle size={18} />}
          label="Tác động kinh doanh"
          value={metrics.businessImpact}
          previous={prev.businessImpact}
          suffix="%"
          description="Mức ảnh hưởng vận hành"
          dangerDirection="up"
          pulseKey={pulseKey}
        />
        <MetricCard
          icon={<Database size={18} />}
          label="Dữ liệu bị mã hóa"
          value={metrics.encryptedData}
          previous={prev.encryptedData}
          suffix="%"
          description="Phạm vi dữ liệu khóa"
          dangerDirection="up"
          pulseKey={pulseKey}
        />
        <MetricCard
          icon={<Clock size={18} />}
          label="Thời gian gián đoạn"
          value={metrics.downtimeHours}
          previous={prev.downtimeHours}
          suffix="h"
          description="Giờ dịch vụ bị ảnh hưởng"
          dangerDirection="up"
          max={24}
          pulseKey={pulseKey}
        />
        <MetricCard
          icon={<Heart size={18} />}
          label="Niềm tin khách hàng"
          value={metrics.customerTrust}
          previous={prev.customerTrust}
          suffix="%"
          description="Khả năng giữ uy tín"
          dangerDirection="down"
          pulseKey={pulseKey}
        />
        <MetricCard
          icon={<TrendingDown size={18} />}
          label="Thiệt hại uy tín"
          value={metrics.reputationDamage}
          previous={prev.reputationDamage}
          suffix="%"
          description="Rủi ro truyền thông"
          dangerDirection="up"
          pulseKey={pulseKey}
        />
        <MetricCard
          icon={<HardDrive size={18} />}
          label="Sức khỏe backup"
          value={metrics.backupHealth}
          previous={prev.backupHealth}
          suffix="%"
          description="Cơ hội khôi phục"
          dangerDirection="down"
          pulseKey={pulseKey}
        />
        <MetricCard
          icon={<Wrench size={18} />}
          label="Sẵn sàng khôi phục"
          value={metrics.recoveryReadiness}
          previous={prev.recoveryReadiness}
          suffix="%"
          description="Mức sẵn sàng ứng cứu"
          dangerDirection="down"
          pulseKey={pulseKey}
        />
        <MetricCard
          icon={<TrendingUp size={18} />}
          label="Điểm phòng thủ"
          value={metrics.defenderScore}
          previous={prev.defenderScore}
          description="Tổng điểm quyết định đúng"
          dangerDirection="down"
          max={200}
          pulseKey={pulseKey}
        />
      </div>
    </div>
  );
}
