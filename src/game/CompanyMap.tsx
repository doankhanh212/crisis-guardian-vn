import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Monitor,
  Wallet,
  Server,
  HardDriveDownload,
  ShieldCheck,
  Building2,
  Users,
} from "lucide-react";
import type { NodeState, NodeStatus } from "@/game/data";
import { CONNECTIONS, type NodeId } from "@/game/data";

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Mail,
  Monitor,
  Wallet,
  Server,
  HardDriveDownload,
  ShieldCheck,
  Building2,
  Users,
};

const STATUS_STYLES: Record<
  NodeStatus,
  { ring: string; bg: string; text: string; pulse: string; label: string }
> = {
  safe: {
    ring: "ring-2 ring-[oklch(0.82_0.22_145/0.7)]",
    bg: "bg-[oklch(0.25_0.1_145/0.5)]",
    text: "text-neon-green",
    pulse: "",
    label: "An toàn",
  },
  suspicious: {
    ring: "ring-2 ring-[oklch(0.83_0.18_80/0.8)]",
    bg: "bg-[oklch(0.3_0.1_80/0.5)]",
    text: "text-neon-amber",
    pulse: "animate-pulse-warn",
    label: "Nghi ngờ",
  },
  infected: {
    ring: "ring-2 ring-[oklch(0.7_0.25_25/0.9)]",
    bg: "bg-[oklch(0.3_0.18_25/0.55)]",
    text: "text-neon-red",
    pulse: "animate-pulse-danger animate-shake",
    label: "Bị nhiễm",
  },
  isolated: {
    ring: "ring-2 ring-[oklch(0.78_0.18_230/0.9)]",
    bg: "bg-[oklch(0.25_0.12_230/0.5)]",
    text: "text-neon-blue",
    pulse: "",
    label: "Đã cô lập",
  },
  down: {
    ring: "ring-1 ring-[oklch(0.4_0.02_260/0.6)]",
    bg: "bg-[oklch(0.18_0.02_260/0.6)]",
    text: "text-muted-foreground",
    pulse: "",
    label: "Ngừng hoạt động",
  },
  recovered: {
    ring: "ring-2 ring-[oklch(0.78_0.18_175/0.8)]",
    bg: "bg-[oklch(0.25_0.12_175/0.5)]",
    text: "text-neon-green",
    pulse: "animate-pulse-safe",
    label: "Đã khôi phục",
  },
};

interface Props {
  nodes: NodeState[];
  infectionPulse?: { from: NodeId; to: NodeId[] } | null;
  recoveryPulse?: { from: NodeId; to: NodeId[] } | null;
}

export function CompanyMap({ nodes, infectionPulse, recoveryPulse }: Props) {
  const nodeById = (id: NodeId) => nodes.find((n) => n.id === id)!;

  return (
    <div className="relative w-full h-full min-h-[400px] glass rounded-2xl overflow-hidden grid-bg">
      <div className="absolute top-3 left-4 z-10">
        <div className="text-xs font-display uppercase tracking-widest text-muted-foreground">
          Bản đồ mạng doanh nghiệp
        </div>
      </div>

      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.18 230 / 0.4)" />
            <stop offset="100%" stopColor="oklch(0.7 0.22 295 / 0.3)" />
          </linearGradient>
          <linearGradient id="line-danger" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.7 0.25 25 / 0.9)" />
            <stop offset="100%" stopColor="oklch(0.7 0.25 25 / 0.2)" />
          </linearGradient>
          <linearGradient id="line-safe" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.82 0.22 145 / 0.9)" />
            <stop offset="100%" stopColor="oklch(0.78 0.18 175 / 0.3)" />
          </linearGradient>
        </defs>
        {CONNECTIONS.map(([a, b], i) => {
          const na = nodeById(a);
          const nb = nodeById(b);
          const isDanger =
            infectionPulse?.from === a && infectionPulse.to.includes(b);
          const isSafe =
            recoveryPulse?.from === a && recoveryPulse.to.includes(b);
          return (
            <line
              key={i}
              x1={`${na.x}%`}
              y1={`${na.y}%`}
              x2={`${nb.x}%`}
              y2={`${nb.y}%`}
              stroke={
                isDanger
                  ? "url(#line-danger)"
                  : isSafe
                  ? "url(#line-safe)"
                  : "url(#line)"
              }
              strokeWidth={isDanger || isSafe ? 2.5 : 1.2}
              strokeDasharray={isDanger || isSafe ? "6 6" : "0"}
              className={isDanger || isSafe ? "animate-pulse" : ""}
            />
          );
        })}

        {/* Traveling pulse dots */}
        <AnimatePresence>
          {infectionPulse?.to.map((toId) => {
            const a = nodeById(infectionPulse.from);
            const b = nodeById(toId);
            return (
              <motion.circle
                key={`inf-${toId}`}
                r={6}
                fill="oklch(0.75 0.27 25)"
                initial={{ cx: `${a.x}%`, cy: `${a.y}%`, opacity: 0 }}
                animate={{ cx: `${b.x}%`, cy: `${b.y}%`, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
                style={{
                  filter: "drop-shadow(0 0 8px oklch(0.7 0.25 25))",
                }}
              />
            );
          })}
          {recoveryPulse?.to.map((toId) => {
            const a = nodeById(recoveryPulse.from);
            const b = nodeById(toId);
            return (
              <motion.circle
                key={`rec-${toId}`}
                r={6}
                fill="oklch(0.85 0.22 145)"
                initial={{ cx: `${a.x}%`, cy: `${a.y}%`, opacity: 0 }}
                animate={{ cx: `${b.x}%`, cy: `${b.y}%`, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
                style={{
                  filter: "drop-shadow(0 0 8px oklch(0.82 0.22 145))",
                }}
              />
            );
          })}
        </AnimatePresence>
      </svg>

      {nodes.map((n) => {
        const s = STATUS_STYLES[n.status];
        const Icon = ICONS[n.icon] ?? Monitor;
        return (
          <motion.div
            key={n.id}
            layout
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
          >
            <div className="flex flex-col items-center gap-1">
              <motion.div
                key={n.status}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`relative w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center backdrop-blur-md ${s.bg} ${s.ring} ${s.pulse}`}
              >
                {n.status === "isolated" && (
                  <span className="absolute inset-[-6px] rounded-2xl ring-2 ring-[oklch(0.78_0.18_230/0.6)] animate-pulse" />
                )}
                <Icon size={26} className={s.text} />
              </motion.div>
              <div className="text-[10px] md:text-xs font-medium text-foreground/90 whitespace-nowrap bg-[oklch(0.1_0.02_260/0.7)] px-1.5 py-0.5 rounded">
                {n.label}
              </div>
              <div className={`text-[9px] md:text-[10px] font-display uppercase tracking-wider ${s.text}`}>
                {s.label}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
