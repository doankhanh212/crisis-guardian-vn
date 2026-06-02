import { motion } from "framer-motion";
import type { ComponentType } from "react";
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
import type { NodeId } from "@/game/data";

const ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  Mail,
  Monitor,
  Wallet,
  Server,
  HardDriveDownload,
  ShieldCheck,
  Building2,
  Users,
};

const MAP_POSITIONS: Record<NodeId, { x: number; y: number }> = {
  email: { x: 11, y: 31 },
  employee: { x: 30, y: 22 },
  finance: { x: 30, y: 44 },
  fileserver: { x: 55, y: 31 },
  backup: { x: 78, y: 31 },
  soc: { x: 18, y: 76 },
  ops: { x: 58, y: 74 },
  customers: { x: 82, y: 74 },
};

const ZONES = [
  {
    title: "Điểm vào & Nhân viên",
    subtitle: "Email, người dùng, kế toán",
    className: "left-[3%] top-[12%] h-[45%] w-[39%] border-neon-blue/25",
    glow: "bg-[oklch(0.45_0.12_230/0.12)]",
  },
  {
    title: "Hạ tầng lõi",
    subtitle: "File Server, Backup Server",
    className: "left-[46%] top-[12%] h-[40%] w-[48%] border-neon-amber/25",
    glow: "bg-[oklch(0.55_0.14_80/0.1)]",
  },
  {
    title: "Đội phản ứng",
    subtitle: "IT / SOC cô lập và khôi phục",
    className: "left-[3%] top-[63%] h-[29%] w-[34%] border-neon-green/25",
    glow: "bg-[oklch(0.55_0.16_145/0.09)]",
  },
  {
    title: "Tác động kinh doanh",
    subtitle: "Vận hành, khách hàng, niềm tin",
    className: "left-[46%] top-[60%] h-[32%] w-[48%] border-neon-red/25",
    glow: "bg-[oklch(0.56_0.18_25/0.1)]",
  },
];

const VISUAL_CONNECTIONS: { from: NodeId; to: NodeId; kind: "attack" | "response" | "recovery" }[] = [
  { from: "email", to: "employee", kind: "attack" },
  { from: "email", to: "finance", kind: "attack" },
  { from: "employee", to: "fileserver", kind: "attack" },
  { from: "finance", to: "fileserver", kind: "attack" },
  { from: "fileserver", to: "backup", kind: "attack" },
  { from: "fileserver", to: "ops", kind: "attack" },
  { from: "ops", to: "customers", kind: "attack" },
  { from: "soc", to: "employee", kind: "response" },
  { from: "soc", to: "fileserver", kind: "response" },
  { from: "backup", to: "fileserver", kind: "recovery" },
];

const STATUS_STYLES: Record<
  NodeStatus,
  {
    ring: string;
    shell: string;
    icon: string;
    glow: string;
    chip: string;
    pulse: string;
    label: string;
  }
> = {
  safe: {
    ring: "ring-2 ring-neon-green/70",
    shell: "bg-[oklch(0.2_0.08_145/0.72)]",
    icon: "text-neon-green",
    glow: "shadow-[0_0_28px_oklch(0.82_0.22_145/0.45)]",
    chip: "border-neon-green/45 bg-[oklch(0.24_0.11_145/0.55)] text-neon-green",
    pulse: "",
    label: "An toàn",
  },
  suspicious: {
    ring: "ring-2 ring-neon-amber",
    shell: "bg-[oklch(0.24_0.1_80/0.75)]",
    icon: "text-neon-amber",
    glow: "shadow-[0_0_30px_oklch(0.83_0.18_80/0.5)]",
    chip: "border-neon-amber/50 bg-[oklch(0.28_0.12_80/0.55)] text-neon-amber",
    pulse: "animate-pulse-warn",
    label: "Nghi ngờ",
  },
  infected: {
    ring: "ring-2 ring-neon-red",
    shell: "bg-[oklch(0.24_0.14_25/0.82)]",
    icon: "text-neon-red",
    glow: "shadow-[0_0_34px_oklch(0.7_0.25_25/0.65)]",
    chip: "border-neon-red/55 bg-[oklch(0.3_0.16_25/0.6)] text-neon-red",
    pulse: "animate-pulse-danger animate-shake",
    label: "Bị nhiễm",
  },
  isolated: {
    ring: "ring-2 ring-neon-blue",
    shell: "bg-[oklch(0.22_0.11_230/0.78)]",
    icon: "text-neon-blue",
    glow: "shadow-[0_0_34px_oklch(0.78_0.18_230/0.55)]",
    chip: "border-neon-blue/55 bg-[oklch(0.26_0.13_230/0.55)] text-neon-blue",
    pulse: "",
    label: "Đã cô lập",
  },
  down: {
    ring: "ring-1 ring-[oklch(0.55_0.02_260/0.45)]",
    shell: "bg-[oklch(0.16_0.02_260/0.78)]",
    icon: "text-muted-foreground",
    glow: "shadow-[0_0_18px_oklch(0.05_0.02_260/0.7)] opacity-70",
    chip: "border-muted-foreground/25 bg-[oklch(0.18_0.02_260/0.55)] text-muted-foreground",
    pulse: "",
    label: "Ngừng hoạt động",
  },
  recovered: {
    ring: "ring-2 ring-[oklch(0.78_0.18_175)]",
    shell: "bg-[oklch(0.22_0.11_175/0.8)]",
    icon: "text-neon-green",
    glow: "shadow-[0_0_34px_oklch(0.78_0.18_175/0.58)]",
    chip: "border-neon-green/55 bg-[oklch(0.24_0.12_175/0.58)] text-neon-green",
    pulse: "animate-pulse-safe",
    label: "Đã khôi phục",
  },
};

interface Props {
  nodes: NodeState[];
  activeNodeIds?: NodeId[];
  infectionPulse?: { from: NodeId; to: NodeId[] } | null;
  recoveryPulse?: { from: NodeId; to: NodeId[] } | null;
}

function isBad(status: NodeStatus) {
  return status === "infected" || status === "suspicious" || status === "down";
}

function lineTone(from: NodeState, to: NodeState, kind: "attack" | "response" | "recovery") {
  if (kind === "recovery" && (from.status === "recovered" || to.status === "recovered")) return "safe";
  if (kind === "response" && (from.status === "isolated" || to.status === "isolated")) return "response";
  if (to.status === "isolated") return "response";
  if (isBad(from.status) || isBad(to.status)) return "danger";
  if (from.status === "recovered" || to.status === "recovered") return "safe";
  return kind === "response" ? "responseBase" : "base";
}

export function CompanyMap({ nodes, activeNodeIds = [], infectionPulse, recoveryPulse }: Props) {
  const nodeById = (id: NodeId) => nodes.find((n) => n.id === id)!;
  const activeSet = new Set(activeNodeIds);

  return (
    <div className="relative h-full min-h-[460px] w-full overflow-hidden rounded-3xl border border-neon-blue/25 bg-[oklch(0.12_0.035_260/0.78)] shadow-neon">
      <div className="absolute inset-0 grid-bg opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_38%,oklch(0.3_0.11_230/0.26),transparent_34%),radial-gradient(circle_at_80%_25%,oklch(0.35_0.13_80/0.14),transparent_28%),radial-gradient(circle_at_72%_76%,oklch(0.35_0.15_25/0.14),transparent_30%)]" />

      <div className="absolute left-4 right-4 top-4 z-20 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-sm md:text-lg uppercase text-foreground">
            Bản đồ khủng hoảng doanh nghiệp
          </div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Email → endpoint → hạ tầng lõi → vận hành → khách hàng
          </div>
        </div>
        <div className="rounded-full border border-neon-red/40 bg-[oklch(0.2_0.08_25/0.45)] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-neon-red">
          Live incident view
        </div>
      </div>

      {ZONES.map((zone) => (
        <div
          key={zone.title}
          className={`absolute z-0 rounded-3xl border bg-[oklch(0.17_0.035_260/0.45)] backdrop-blur-sm ${zone.className}`}
        >
          <div className={`absolute inset-0 rounded-3xl blur-2xl ${zone.glow}`} />
          <div className="relative p-3">
            <div className="font-display text-sm md:text-base font-semibold uppercase tracking-widest text-foreground/80">
              {zone.title}
            </div>
            <div className="mt-0.5 text-xs md:text-sm text-muted-foreground">{zone.subtitle}</div>
          </div>
        </div>
      ))}

      <svg className="absolute inset-0 z-10 h-full w-full" preserveAspectRatio="none">
        <defs>
          <marker id="arrow-blue" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L8,4.5 L0,9 Z" fill="oklch(0.78 0.18 230 / 0.62)" />
          </marker>
          <marker id="arrow-red" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L8,4.5 L0,9 Z" fill="oklch(0.7 0.25 25 / 0.75)" />
          </marker>
          <marker id="arrow-green" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L8,4.5 L0,9 Z" fill="oklch(0.82 0.22 145 / 0.75)" />
          </marker>
        </defs>
        {VISUAL_CONNECTIONS.map(({ from, to, kind }) => {
          const fromNode = nodeById(from);
          const toNode = nodeById(to);
          const a = MAP_POSITIONS[from];
          const b = MAP_POSITIONS[to];
          const tone = lineTone(fromNode, toNode, kind);
          const isDangerPulse =
            tone === "danger" ||
            (infectionPulse?.from === from && infectionPulse.to.includes(to));
          const isRecoveryPulse =
            tone === "safe" ||
            (recoveryPulse?.from === from && recoveryPulse.to.includes(to));
          const stroke =
            tone === "danger"
              ? "oklch(0.7 0.25 25 / 0.72)"
              : tone === "safe"
              ? "oklch(0.82 0.22 145 / 0.75)"
              : tone === "response"
              ? "oklch(0.78 0.18 230 / 0.75)"
              : tone === "responseBase"
              ? "oklch(0.78 0.18 230 / 0.34)"
              : "oklch(0.68 0.09 230 / 0.28)";
          const marker =
            tone === "danger"
              ? "url(#arrow-red)"
              : tone === "safe"
              ? "url(#arrow-green)"
              : "url(#arrow-blue)";
          return (
            <g key={`${from}-${to}`}>
              <line
                x1={`${a.x}%`}
                y1={`${a.y}%`}
                x2={`${b.x}%`}
                y2={`${b.y}%`}
                stroke={stroke}
                strokeWidth={tone === "base" || tone === "responseBase" ? 1.5 : 2.8}
                strokeDasharray={kind === "response" ? "7 7" : "0"}
                markerEnd={marker}
              />
              {(isDangerPulse || isRecoveryPulse || tone === "response") && (
                <motion.circle
                  r={isDangerPulse ? 5.5 : 4.5}
                  fill={
                    isDangerPulse
                      ? "oklch(0.76 0.27 25)"
                      : isRecoveryPulse
                      ? "oklch(0.85 0.22 145)"
                      : "oklch(0.78 0.18 230)"
                  }
                  initial={{ cx: `${a.x}%`, cy: `${a.y}%`, opacity: 0 }}
                  animate={{
                    cx: [`${a.x}%`, `${b.x}%`],
                    cy: [`${a.y}%`, `${b.y}%`],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: isDangerPulse ? 1.35 : 1.8,
                    repeat: Infinity,
                    repeatDelay: isDangerPulse ? 0.35 : 1.2,
                    ease: "easeInOut",
                  }}
                  style={{ filter: `drop-shadow(0 0 10px ${isDangerPulse ? "#ff5b5b" : "#7cf0a8"})` }}
                />
              )}
            </g>
          );
        })}
      </svg>

      <div className="absolute inset-0 z-20">
        {nodes.map((n) => {
          const s = STATUS_STYLES[n.status];
          const Icon = ICONS[n.icon] ?? Monitor;
          const pos = MAP_POSITIONS[n.id];
          const isActive = activeSet.has(n.id);
          return (
            <motion.div
              key={n.id}
              layout
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
            >
              <div className="flex min-w-[92px] flex-col items-center gap-1.5">
                <motion.div
                  key={n.status}
                  initial={{ scale: 0.86 }}
                  animate={{ scale: isActive ? [1, 1.08, 1] : 1 }}
                  transition={{ duration: isActive ? 1.8 : 0.25, repeat: isActive ? Infinity : 0 }}
                  className={`relative flex h-16 w-16 items-center justify-center rounded-[1.35rem] backdrop-blur-md md:h-[78px] md:w-[78px] ${s.shell} ${s.ring} ${s.glow} ${s.pulse}`}
                  style={{ clipPath: "polygon(50% 0%, 92% 24%, 92% 76%, 50% 100%, 8% 76%, 8% 24%)" }}
                >
                  {isActive && (
                    <span className="absolute inset-[-10px] rounded-[1.8rem] border border-neon-blue/60 animate-pulse" />
                  )}
                  {n.status === "isolated" && (
                    <span className="absolute inset-[-7px] rounded-[1.7rem] ring-2 ring-neon-blue/60 animate-pulse" />
                  )}
                  <Icon size={30} className={s.icon} />
                </motion.div>
                <div className="max-w-[150px] rounded-md bg-[oklch(0.08_0.02_260/0.78)] px-2 py-0.5 text-center text-xs font-semibold text-foreground/95 md:text-sm">
                  {n.label}
                </div>
                <div className={`rounded-full border px-2.5 py-0.5 text-[11px] font-display uppercase tracking-wider ${s.chip}`}>
                  {s.label}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
