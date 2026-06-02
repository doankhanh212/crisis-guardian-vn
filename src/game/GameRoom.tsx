import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Clock,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Radio,
  Settings,
  X,
  Play,
  Eye,
  Zap,
  ShieldCheck,
  RotateCcw,
  FileText,
  Award,
  Bug,
  Users2,
  Activity,
} from "lucide-react";
import { CompanyMap } from "@/game/CompanyMap";
import { MetricsPanel } from "@/game/MetricsPanel";
import { Timeline } from "@/game/Timeline";
import { FeedbackModal } from "@/game/FeedbackModal";
import { FinalReport } from "@/game/FinalReport";
import {
  EVENT_MODE_NOTES,
  INITIAL_METRICS,
  INITIAL_NODES,
  ROUNDS,
  gradeFinal,
  type GameMode,
  type Metrics,
  type NodeId,
  type NodeState,
  type NodeStatus,
  type Round,
} from "@/game/data";

const MODE_LABELS: Record<GameMode, string> = {
  default: "Chế độ tiêu chuẩn",
  employee: "Chế độ Nhân viên",
  leader: "Chế độ Lãnh đạo",
  stage: "Chế độ Sân khấu",
};

interface Props {
  mode: GameMode;
  teamName: string;
  onExit: () => void;
}

function applyMetrics(m: Metrics, c: Partial<Metrics>): Metrics {
  return {
    businessImpact: clamp(m.businessImpact + (c.businessImpact ?? 0), 0, 100),
    encryptedData: clamp(m.encryptedData + (c.encryptedData ?? 0), 0, 100),
    downtimeHours: Math.max(0, m.downtimeHours + (c.downtimeHours ?? 0)),
    customerTrust: clamp(m.customerTrust + (c.customerTrust ?? 0), 0, 100),
    reputationDamage: clamp(m.reputationDamage + (c.reputationDamage ?? 0), 0, 100),
    backupHealth: clamp(m.backupHealth + (c.backupHealth ?? 0), 0, 100),
    recoveryReadiness: clamp(m.recoveryReadiness + (c.recoveryReadiness ?? 0), 0, 100),
    defenderScore: Math.max(0, m.defenderScore + (c.defenderScore ?? 0)),
  };
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

const RISK_COLOR: Record<Round["riskLevel"], string> = {
  Thấp: "text-neon-green border-neon-green/50 bg-[oklch(0.22_0.1_145/0.35)]",
  "Trung bình": "text-neon-amber border-neon-amber/50 bg-[oklch(0.24_0.11_80/0.35)]",
  Cao: "text-neon-amber border-neon-amber bg-[oklch(0.24_0.11_80/0.45)]",
  "Nghiêm trọng": "text-neon-red border-neon-red bg-[oklch(0.24_0.14_25/0.42)] animate-pulse",
};

export function GameRoom({ mode, teamName, onExit }: Props) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [metrics, setMetrics] = useState<Metrics>(INITIAL_METRICS);
  const [prevMetrics, setPrevMetrics] = useState<Metrics>(INITIAL_METRICS);
  const [pulseKey, setPulseKey] = useState(0);
  const [nodes, setNodes] = useState<NodeState[]>(INITIAL_NODES);
  const [feedback, setFeedback] = useState<{
    picked: "A" | "B" | "C" | "D";
    isGood: boolean;
  } | null>(null);
  const [infectionPulse, setInfectionPulse] = useState<{ from: NodeId; to: NodeId[] } | null>(null);
  const [recoveryPulse, setRecoveryPulse] = useState<{ from: NodeId; to: NodeId[] } | null>(null);
  const [seconds, setSeconds] = useState(15 * 60);
  const [hostOpen, setHostOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [showVotes, setShowVotes] = useState(false);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const round = ROUNDS[roundIdx];
  const isStage = mode === "stage";

  const votes = useMemo(() => {
    const seed = round.index * 13;
    const arr = round.options.map((o, i) => {
      const base = 10 + ((seed * (i + 2)) % 25);
      return o.good ? base + 35 : base;
    });
    const total = arr.reduce((a, b) => a + b, 0);
    return arr.map((v) => Math.round((v / total) * 100));
  }, [round]);

  const activeNodeIds = useMemo(() => {
    const ids = new Set<NodeId>();
    if (round.spreadFrom) ids.add(round.spreadFrom);
    round.spreadTo?.forEach((id) => ids.add(id));
    Object.keys(round.goodNodes).forEach((id) => ids.add(id as NodeId));
    Object.keys(round.riskyNodes).forEach((id) => ids.add(id as NodeId));
    return Array.from(ids);
  }, [round]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function pickOption(key: "A" | "B" | "C" | "D") {
    if (feedback) return;
    const opt = round.options.find((o) => o.key === key)!;
    const isGood = opt.good;
    const changes = isGood ? round.goodChanges : round.riskyChanges;
    setPrevMetrics(metrics);
    setMetrics((m) => applyMetrics(m, changes));
    setPulseKey((k) => k + 1);

    const targetNodes = isGood ? round.goodNodes : round.riskyNodes;
    setNodes((ns) =>
      ns.map((n) => {
        const next = targetNodes[n.id];
        return next ? { ...n, status: next } : n;
      })
    );

    if (!isGood && round.spreadFrom && round.spreadTo) {
      setInfectionPulse({ from: round.spreadFrom, to: round.spreadTo });
      setTimeout(() => setInfectionPulse(null), 1500);
    }
    if (isGood && round.stage === "Recovery") {
      setRecoveryPulse({ from: "backup", to: ["fileserver", "ops"] });
      setTimeout(() => setRecoveryPulse(null), 1500);
    }

    setFeedback({ picked: key, isGood });
  }

  useEffect(() => {
    if (feedback || finished || hostOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const shortcutMap: Record<string, "A" | "B" | "C" | "D"> = {
        a: "A",
        b: "B",
        c: "C",
        d: "D",
        "1": "A",
        "2": "B",
        "3": "C",
        "4": "D",
      };
      const optionKey = shortcutMap[key];
      if (!optionKey || !round.options.some((option) => option.key === optionKey)) return;

      event.preventDefault();
      pickOption(optionKey);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [feedback, finished, hostOpen, round]);

  function continueNext() {
    setFeedback(null);
    setRevealed(false);
    setShowVotes(false);
    if (roundIdx + 1 >= ROUNDS.length) {
      setFinished(true);
    } else {
      setRoundIdx((i) => i + 1);
    }
  }

  function restart() {
    setRoundIdx(0);
    setMetrics(INITIAL_METRICS);
    setPrevMetrics(INITIAL_METRICS);
    setNodes(INITIAL_NODES);
    setFinished(false);
    setFeedback(null);
    setSeconds(15 * 60);
  }

  function triggerInfection() {
    if (round.spreadFrom && round.spreadTo) {
      setInfectionPulse({ from: round.spreadFrom, to: round.spreadTo });
      setTimeout(() => setInfectionPulse(null), 1500);
    }
  }

  function triggerIsolation() {
    setNodes((ns) =>
      ns.map((n) =>
        n.status === "infected" || n.status === "suspicious"
          ? { ...n, status: "isolated" as NodeStatus }
          : n
      )
    );
  }

  function triggerRecovery() {
    setRecoveryPulse({ from: "backup", to: ["fileserver", "ops"] });
    setTimeout(() => {
      setRecoveryPulse(null);
      setNodes((ns) =>
        ns.map((n) =>
          n.status === "infected" || n.status === "down"
            ? { ...n, status: "recovered" as NodeStatus }
            : n
        )
      );
    }, 1500);
  }

  if (finished) {
    return (
      <FinalReport
        metrics={metrics}
        result={gradeFinal(metrics)}
        teamName={teamName}
        onRestart={() => {
          restart();
          onExit();
        }}
      />
    );
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const completedCount = roundIdx;
  const currentStage = round.stage.includes("Email")
    ? "Email"
    : round.stage.includes("Infection")
    ? "Infection"
    : round.stage.includes("Spread")
    ? "Spread"
    : round.stage.includes("Backup")
    ? "Encryption"
    : round.stage.includes("Leadership")
    ? "Response"
    : round.stage.includes("Communication")
    ? "Response"
    : round.stage.includes("Recovery")
    ? "Recovery"
    : "Lessons Learned";

  const ModeIcon =
    mode === "leader" ? Users2 : mode === "employee" ? Bug : mode === "stage" ? Radio : Shield;

  return (
    <div className="relative min-h-screen overflow-hidden p-3 md:p-4">
      <div className="pointer-events-none fixed inset-0 opacity-70 grid-bg" />
      <div className="pointer-events-none fixed inset-0 crisis-ambient" />

      <div className="relative mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1800px] flex-col gap-4">
        <header className="glass-strong rounded-2xl px-4 md:px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShieldAlert className="text-neon-red" size={28} />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-neon-red animate-ping" />
            </div>
            <div>
              <h1 className="font-display text-base md:text-xl text-glow-blue">
                Ransomware Crisis Room
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                <ModeIcon size={11} /> {MODE_LABELS[mode]} {teamName && `· ${teamName}`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="glass rounded-xl px-3 py-1.5 flex items-center gap-2">
              <Clock size={16} className="text-neon-amber" />
              <span className="font-display tabular-nums text-base md:text-lg">{mm}:{ss}</span>
            </div>
            <div className="glass rounded-xl px-3 py-1.5">
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Vòng</div>
              <div className="font-display text-base md:text-lg text-neon-blue">
                {round.index} <span className="text-muted-foreground text-xs">/ {ROUNDS.length}</span>
              </div>
            </div>
            <div className="glass rounded-xl px-3 py-1.5 hidden md:block">
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Điểm phòng thủ</div>
              <div className="font-display text-base md:text-lg text-neon-green">{metrics.defenderScore}</div>
            </div>
            {isStage && (
              <button
                onClick={() => setHostOpen(true)}
                className="glass rounded-xl px-3 py-1.5 flex items-center gap-2 hover:bg-[oklch(0.3_0.08_260/0.6)]"
              >
                <Settings size={16} /> <span className="text-sm">Host</span>
              </button>
            )}
            <button
              onClick={onExit}
              className="glass rounded-xl px-3 py-1.5 hover:bg-[oklch(0.3_0.06_260/0.6)] text-sm flex items-center gap-1"
            >
              <X size={16} /> Thoát
            </button>
          </div>
        </header>

        <main className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-12 lg:auto-rows-min">
          <motion.section
            key={`briefing-${round.index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-1 lg:order-3 lg:col-span-5 glass-strong rounded-2xl p-5 md:p-6 relative scanlines overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-1 gradient-danger opacity-70" />
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-2 text-xs font-display uppercase tracking-widest text-neon-blue">
                <Activity size={14} /> Crisis Briefing
              </span>
              <span className="text-xs font-display uppercase tracking-widest text-muted-foreground">
                {round.time} · {round.stage}
              </span>
              <span
                className={`text-[10px] uppercase tracking-widest border rounded-full px-2 py-0.5 ${RISK_COLOR[round.riskLevel]}`}
              >
                <AlertTriangle size={10} className="inline mr-1" />
                Rủi ro: {round.riskLevel}
              </span>
            </div>
            <h2 className={`font-display ${isStage ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"} text-glow-blue leading-tight mb-4`}>
              {round.title}
            </h2>
            <p className={`${isStage ? "text-lg md:text-xl" : "text-base md:text-lg"} text-foreground/90 leading-relaxed`}>
              {round.scenario}
            </p>
          </motion.section>

          <section className="order-2 lg:order-1 lg:col-span-8 min-h-[460px] md:min-h-[560px] xl:min-h-[640px]">
            <CompanyMap
              nodes={nodes}
              activeNodeIds={activeNodeIds}
              infectionPulse={infectionPulse}
              recoveryPulse={recoveryPulse}
            />
          </section>

          <aside className="order-3 lg:order-2 lg:col-span-4">
            <MetricsPanel metrics={metrics} prev={prevMetrics} pulseKey={pulseKey} />
          </aside>

          <motion.section
            key={`decisions-${round.index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-4 lg:col-span-7 glass-strong rounded-2xl p-4 md:p-5"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Quyết định của phòng khủng hoảng
                </div>
                <div className="font-display text-lg text-foreground">
                  Chọn hướng xử lý
                </div>
              </div>
              {showVotes && (
                <div className="rounded-full border border-neon-blue/40 px-3 py-1 text-[10px] uppercase tracking-widest text-neon-blue">
                  Đang hiện vote
                </div>
              )}
            </div>
            <div className={`grid gap-3 ${isStage ? "md:grid-cols-2" : "md:grid-cols-2"}`}>
              {round.options.map((opt) => {
                const showCorrect = revealed && opt.good;
                const showWrong = revealed && !opt.good;
                const voteIndex = round.options.indexOf(opt);
                return (
                  <motion.button
                    key={opt.key}
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!!feedback}
                    onClick={() => pickOption(opt.key)}
                    className={`group text-left p-4 md:p-5 rounded-2xl glass border transition-all relative overflow-hidden min-h-[112px] ${
                      showCorrect
                        ? "border-neon-green shadow-safe bg-[oklch(0.23_0.11_145/0.55)]"
                        : showWrong
                        ? "border-neon-red/50 opacity-55 bg-[oklch(0.2_0.09_25/0.45)]"
                        : "border-[oklch(0.6_0.1_230/0.25)] hover:border-neon-blue hover:shadow-neon"
                    } ${feedback ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent opacity-0 transition group-hover:opacity-100" />
                    <div className="flex items-start gap-3">
                      <div
                        className={`font-display text-3xl md:text-4xl w-12 flex-shrink-0 ${
                          showCorrect ? "text-neon-green" : "text-neon-blue"
                        }`}
                      >
                        {opt.key}
                      </div>
                      <div className={`${isStage ? "text-base md:text-lg" : "text-sm md:text-base"} pt-1 text-foreground/90 leading-relaxed`}>
                        {opt.text}
                        {showVotes && (
                          <div className="mt-3 h-2 rounded-full bg-[oklch(0.2_0.03_260/0.8)] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${votes[voteIndex]}%` }}
                              className="h-full gradient-neon"
                            />
                          </div>
                        )}
                        {showVotes && (
                          <div className="text-[10px] mt-1 text-muted-foreground">
                            {votes[voteIndex]}% bình chọn
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.section>

          <div className="order-5 lg:col-span-12">
            <Timeline currentStage={currentStage} completedCount={completedCount} />
          </div>
        </main>
      </div>

      {feedback && (
        <FeedbackModal
          open={!!feedback}
          round={round}
          picked={feedback.picked}
          isGood={feedback.isGood}
          changes={feedback.isGood ? round.goodChanges : round.riskyChanges}
          onContinue={continueNext}
        />
      )}

      <AnimatePresence>
        {hostOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[oklch(0.05_0.02_260/0.85)] backdrop-blur-md flex items-end md:items-center justify-center p-4"
            onClick={() => setHostOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-3xl w-full max-w-3xl p-6 ring-1 ring-neon-blue/40 shadow-neon"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Radio className="text-neon-blue" />
                  <h3 className="font-display text-xl">Host Control Panel</h3>
                </div>
                <button onClick={() => setHostOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                <HostBtn icon={<Play size={18} />} label="Bắt đầu vòng" onClick={() => setShowVotes(true)} />
                <HostBtn icon={<Eye size={18} />} label="Hiện đáp án" onClick={() => setRevealed(true)} />
                <HostBtn icon={<Users2 size={18} />} label="Hiện vote khán giả" onClick={() => setShowVotes(true)} />
                <HostBtn icon={<Zap size={18} />} label="Trigger lây nhiễm" onClick={triggerInfection} />
                <HostBtn icon={<ShieldCheck size={18} />} label="Cô lập máy nhiễm" onClick={triggerIsolation} />
                <HostBtn icon={<ShieldCheck size={18} />} label="Khôi phục backup" onClick={triggerRecovery} />
                <HostBtn icon={<FileText size={18} />} label="Báo cáo cuối" onClick={() => setFinished(true)} />
                <HostBtn icon={<Award size={18} />} label="Hiện badge" onClick={() => setFinished(true)} />
                <HostBtn icon={<RotateCcw size={18} />} label="Reset game" onClick={restart} />
              </div>
              <div className="rounded-2xl border border-neon-blue/25 bg-[oklch(0.18_0.05_260/0.55)] p-4">
                <div className="text-[10px] uppercase tracking-widest text-neon-blue mb-2">
                  Câu dẫn MC
                </div>
                <div className="space-y-2 text-sm text-foreground/85">
                  {EVENT_MODE_NOTES.map((note) => (
                    <p key={note}>{note}</p>
                  ))}
                </div>
              </div>
              <div className="mt-4 text-[10px] text-muted-foreground uppercase tracking-widest text-center">
                Bảng điều khiển dành cho MC · ẩn khỏi khán giả
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HostBtn({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="glass rounded-xl p-3 hover:bg-[oklch(0.3_0.08_260/0.7)] hover:shadow-neon text-left flex items-center gap-2 transition"
    >
      <span className="text-neon-blue">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
