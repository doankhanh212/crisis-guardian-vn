import { motion } from "framer-motion";
import type { ComponentType, ReactNode } from "react";
import {
  Mail,
  Monitor,
  Wallet,
  Server,
  HardDriveDownload,
  ShieldCheck,
  Building2,
  Users,
  Bug,
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
  email: { x: 34, y: 35 },
  employee: { x: 49, y: 25 },
  finance: { x: 49, y: 46 },
  fileserver: { x: 64, y: 35 },
  backup: { x: 69, y: 58 },
  soc: { x: 14, y: 61 },
  ops: { x: 45, y: 76 },
  customers: { x: 63, y: 76 },
};

const HACKER_POSITION = { x: 88, y: 32 };

const ZONES = [
  {
    title: "Phe phòng thủ",
    subtitle: "Người chơi / Đội cứu hộ kỹ thuật",
    className: "left-[3%] top-[18%] h-[70%] w-[21%] border-neon-blue/35",
    glow: "bg-[oklch(0.45_0.14_230/0.16)]",
    accent: "text-neon-blue",
  },
  {
    title: "Doanh nghiệp mục tiêu",
    subtitle: "Email, máy người dùng, dữ liệu, vận hành, khách hàng",
    className: "left-[27%] top-[14%] h-[76%] w-[48%] border-neon-amber/28",
    glow: "bg-[oklch(0.55_0.14_80/0.1)]",
    accent: "text-neon-amber",
  },
  {
    title: "Phe tấn công",
    subtitle: "Hacker / Nguồn phát tán virus",
    className: "left-[78%] top-[18%] h-[70%] w-[19%] border-neon-red/35",
    glow: "bg-[oklch(0.56_0.2_25/0.14)]",
    accent: "text-neon-red",
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
  threatPulse?: { to: NodeId[]; intensity: "warning" | "danger" } | null;
  infectionPulse?: { from: NodeId; to: NodeId[] } | null;
  recoveryPulse?: { from: NodeId; to: NodeId[] } | null;
  phaseTone?: "watch" | "danger" | "safe";
  children?: ReactNode;
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

export function CompanyMap({
  nodes,
  activeNodeIds = [],
  threatPulse,
  infectionPulse,
  recoveryPulse,
  phaseTone = "watch",
  children,
}: Props) {
  const nodeById = (id: NodeId) => nodes.find((n) => n.id === id)!;
  const activeSet = new Set(activeNodeIds);
  const infectionTargets = infectionPulse
    ? infectionPulse.to.map((to) => ({ from: infectionPulse.from, to }))
    : [];
  const recoveryTargets = recoveryPulse
    ? recoveryPulse.to.map((to) => ({ from: recoveryPulse.from, to }))
    : [];
  const threatTargets = threatPulse?.to ?? [];
  const isThreatActive = threatTargets.length > 0;

  return (
    <div className="relative h-full min-h-[460px] w-full overflow-hidden rounded-3xl border border-neon-blue/25 bg-[oklch(0.12_0.035_260/0.78)] shadow-neon">
      <div className="absolute inset-0 grid-bg opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_38%,oklch(0.3_0.11_230/0.26),transparent_34%),radial-gradient(circle_at_80%_25%,oklch(0.35_0.13_80/0.14),transparent_28%),radial-gradient(circle_at_72%_76%,oklch(0.35_0.15_25/0.14),transparent_30%)]" />

      <div className="absolute left-4 right-4 top-4 z-20 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-sm md:text-lg uppercase text-foreground">
            Bản đồ chiến đấu: phòng thủ vs hacker
          </div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Phe phòng thủ → doanh nghiệp mục tiêu ← phe tấn công
          </div>
        </div>
        <div className="rounded-full border border-neon-red/40 bg-[oklch(0.2_0.08_25/0.45)] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-neon-red">
          Bản đồ trực tiếp
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
            <div className={`mt-0.5 text-xs md:text-sm ${zone.accent}`}>{zone.subtitle}</div>
          </div>
        </div>
      ))}

      <div className="absolute left-[4.5%] top-[29%] z-20 max-w-[18%] rounded-2xl border border-neon-blue/35 bg-[oklch(0.14_0.06_230/0.72)] p-3 text-neon-blue shadow-neon backdrop-blur-xl">
        <div className="mb-2 grid h-12 w-12 place-items-center rounded-2xl border border-neon-blue/45 bg-[oklch(0.18_0.08_230/0.7)]">
          <ShieldCheck size={26} />
        </div>
        <div className="font-display text-xs uppercase md:text-sm">Người chơi</div>
        <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Lệnh phòng thủ xuất phát từ đây
        </div>
      </div>

      <motion.div
        className={`absolute left-[88%] top-[32%] z-20 max-w-[16%] -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-3 text-neon-red backdrop-blur-xl ${
          isThreatActive
            ? "border-neon-red bg-[oklch(0.18_0.1_25/0.78)] shadow-danger"
            : "border-neon-red/35 bg-[oklch(0.14_0.06_25/0.58)]"
        }`}
        animate={{
          scale: isThreatActive ? [1, 1.05, 1] : 1,
          boxShadow: isThreatActive
            ? [
                "0 0 22px oklch(0.7 0.25 25 / 0.45)",
                "0 0 44px oklch(0.7 0.25 25 / 0.78)",
                "0 0 22px oklch(0.7 0.25 25 / 0.45)",
              ]
            : "0 0 14px oklch(0.7 0.25 25 / 0.22)",
        }}
        transition={{ duration: 1.2, repeat: isThreatActive ? Infinity : 0 }}
      >
        <div className="mb-2 grid h-14 w-14 place-items-center rounded-2xl border border-neon-red/55 bg-[oklch(0.2_0.12_25/0.72)]">
          <Bug size={30} />
        </div>
        <div className="font-display text-xs uppercase md:text-sm">Hacker</div>
        <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Nguồn phát tán virus
        </div>
        <div className="mt-3 rounded-xl border border-neon-red/35 bg-[oklch(0.1_0.06_25/0.6)] px-2 py-1 text-[10px] uppercase tracking-widest">
          Đòi tiền chuộc
        </div>
      </motion.div>

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
          const isActivePulse = activeSet.has(from) && activeSet.has(to);
          const stroke =
            isActivePulse && phaseTone === "danger"
              ? "oklch(0.7 0.25 25 / 0.72)"
              : isActivePulse && phaseTone === "safe"
              ? "oklch(0.82 0.22 145 / 0.72)"
              : isActivePulse
              ? "oklch(0.83 0.18 80 / 0.68)"
              : tone === "danger"
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
                strokeWidth={
                  isDangerPulse || isRecoveryPulse || isActivePulse
                    ? 4
                    : tone === "base" || tone === "responseBase"
                    ? 1.5
                    : 2.8
                }
                strokeDasharray={kind === "response" ? "7 7" : "0"}
                className={isDangerPulse ? "animate-pulse" : undefined}
                markerEnd={marker}
              />
              {(isDangerPulse || isRecoveryPulse || isActivePulse || tone === "response") && (
                <motion.circle
                  r={isDangerPulse || (isActivePulse && phaseTone === "danger") ? 5.5 : 4.5}
                  fill={
                    isDangerPulse || (isActivePulse && phaseTone === "danger")
                      ? "oklch(0.76 0.27 25)"
                      : isRecoveryPulse || (isActivePulse && phaseTone === "safe")
                      ? "oklch(0.85 0.22 145)"
                      : isActivePulse
                      ? "oklch(0.9 0.18 80)"
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
                  style={{
                    filter: `drop-shadow(0 0 10px ${
                      isDangerPulse || phaseTone === "danger"
                        ? "#ff5b5b"
                        : isRecoveryPulse || phaseTone === "safe"
                        ? "#7cf0a8"
                        : "#ffd166"
                    })`,
                  }}
                />
              )}
            </g>
          );
        })}
        {threatTargets.map((to) => {
          const target = MAP_POSITIONS[to];
          return (
            <g key={`hacker-line-${to}`}>
              <line
                x1={`${HACKER_POSITION.x}%`}
                y1={`${HACKER_POSITION.y}%`}
                x2={`${target.x}%`}
                y2={`${target.y}%`}
                stroke="oklch(0.7 0.25 25 / 0.68)"
                strokeWidth={3}
                strokeDasharray="9 8"
                className="animate-pulse"
                markerEnd="url(#arrow-red)"
              />
              <line
                x1={`${HACKER_POSITION.x}%`}
                y1={`${HACKER_POSITION.y}%`}
                x2={`${target.x}%`}
                y2={`${target.y}%`}
                stroke="oklch(0.7 0.25 25 / 0.18)"
                strokeWidth={12}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0 z-[25]">
        {threatTargets.map((to) => {
          const b = MAP_POSITIONS[to];
          return (
            <motion.div
              key={`hacker-packet-${to}`}
              className={`absolute grid h-12 w-12 place-items-center rounded-full border bg-[oklch(0.18_0.12_25/0.86)] text-neon-red shadow-danger ${
                threatPulse?.intensity === "danger" ? "border-neon-red animate-shake" : "border-neon-amber/80"
              }`}
              initial={{
                left: `${HACKER_POSITION.x}%`,
                top: `${HACKER_POSITION.y}%`,
                opacity: 0,
                scale: 0.7,
              }}
              animate={{
                left: [`${HACKER_POSITION.x}%`, `${b.x}%`],
                top: [`${HACKER_POSITION.y}%`, `${b.y}%`],
                opacity: [0, 1, 1, 0],
                scale: [0.7, 1.18, 1, 0.86],
                rotate: [0, -12, 12, 0],
              }}
              transition={{
                duration: threatPulse?.intensity === "danger" ? 1.15 : 1.45,
                repeat: Infinity,
                repeatDelay: 0.28,
                ease: "easeInOut",
              }}
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <Bug size={26} />
            </motion.div>
          );
        })}
        {infectionTargets.map(({ from, to }) => {
          const a = MAP_POSITIONS[from];
          const b = MAP_POSITIONS[to];
          return (
            <motion.div
              key={`bug-${from}-${to}`}
              className="absolute grid h-9 w-9 place-items-center rounded-full border border-neon-red/70 bg-[oklch(0.18_0.12_25/0.82)] text-neon-red shadow-danger"
              initial={{ left: `${a.x}%`, top: `${a.y}%`, opacity: 0, scale: 0.75 }}
              animate={{
                left: [`${a.x}%`, `${b.x}%`],
                top: [`${a.y}%`, `${b.y}%`],
                opacity: [0, 1, 1, 0],
                scale: [0.75, 1.12, 1, 0.85],
                rotate: [0, -10, 12, 0],
              }}
              transition={{ duration: 1.35, repeat: Infinity, repeatDelay: 0.32, ease: "easeInOut" }}
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <Bug size={20} />
            </motion.div>
          );
        })}
        {recoveryTargets.map(({ from, to }) => {
          const a = MAP_POSITIONS[from];
          const b = MAP_POSITIONS[to];
          return (
            <motion.div
              key={`shield-${from}-${to}`}
              className="absolute grid h-9 w-9 place-items-center rounded-full border border-neon-green/70 bg-[oklch(0.17_0.1_145/0.82)] text-neon-green shadow-safe"
              initial={{ left: `${a.x}%`, top: `${a.y}%`, opacity: 0, scale: 0.75 }}
              animate={{
                left: [`${a.x}%`, `${b.x}%`],
                top: [`${a.y}%`, `${b.y}%`],
                opacity: [0, 1, 1, 0],
                scale: [0.75, 1.08, 1, 0.9],
              }}
              transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.55, ease: "easeInOut" }}
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <ShieldCheck size={20} />
            </motion.div>
          );
        })}
      </div>

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
                  animate={{
                    scale: isActive ? [1, 1.1, 1] : 1,
                    x: isActive && phaseTone === "danger" ? [0, -2, 2, -1, 1, 0] : 0,
                  }}
                  transition={{ duration: isActive ? 1.2 : 0.25, repeat: isActive ? Infinity : 0 }}
                  className={`relative flex h-16 w-16 items-center justify-center rounded-[1.35rem] backdrop-blur-md md:h-[78px] md:w-[78px] ${s.shell} ${s.ring} ${s.glow} ${s.pulse}`}
                  style={{ clipPath: "polygon(50% 0%, 92% 24%, 92% 76%, 50% 100%, 8% 76%, 8% 24%)" }}
                >
                  {isActive && (
                    <span
                      className={`absolute inset-[-12px] rounded-[1.8rem] border animate-pulse ${
                        phaseTone === "danger"
                          ? "border-neon-red/80 shadow-danger"
                          : phaseTone === "safe"
                          ? "border-neon-green/80 shadow-safe"
                          : "border-neon-blue/60"
                      }`}
                    />
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

      {children}
    </div>
  );
}
