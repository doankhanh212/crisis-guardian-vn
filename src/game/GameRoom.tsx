import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
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
} from "lucide-react";
import { CompanyMap } from "@/game/CompanyMap";
import { MetricsPanel } from "@/game/MetricsPanel";
import { Timeline } from "@/game/Timeline";
import { FeedbackModal } from "@/game/FeedbackModal";
import { FinalReport } from "@/game/FinalReport";
import {
  INITIAL_METRICS,
  INITIAL_NODES,
  ROUNDS,
  TIMELINE_STAGES,
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
  Thấp: "text-neon-green border-neon-green/50",
  "Trung bình": "text-neon-amber border-neon-amber/50",
  Cao: "text-neon-amber border-neon-amber",
  "Nghiêm trọng": "text-neon-red border-neon-red animate-pulse",
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

  // mock vote bars
  const votes = useMemo(() => {
    const seed = round.index * 13;
    const arr = round.options.map((o, i) => {
      const base = 10 + ((seed * (i + 2)) % 25);
      return o.good ? base + 35 : base;
    });
    const total = arr.reduce((a, b) => a + b, 0);
    return arr.map((v) => Math.round((v / total) * 100));
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

    // update nodes
    const targetNodes = isGood ? round.goodNodes : round.riskyNodes;
    setNodes((ns) =>
      ns.map((n) => {
        const next = targetNodes[n.id];
        return next ? { ...n, status: next } : n;
      })
    );

    // pulses
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
    <div className="min-h-screen p-3 md:p-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="glass-strong rounded-2xl px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShieldAlert className="text-neon-red" size={28} />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-neon-red animate-ping" />
          </div>
          <div>
            <h1 className="font-display text-lg md:text-xl text-glow-blue">
              RANSOMWARE CRISIS ROOM
            </h1>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <ModeIcon size={11} /> {MODE_LABELS[mode]} {teamName && `· ${teamName}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
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
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Defender Score</div>
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

      {/* Main grid */}
      <div className={`grid gap-4 ${isStage ? "lg:grid-cols-[1fr,1.4fr,280px]" : "lg:grid-cols-[1.2fr,1.4fr,300px]"}`}>
        {/* Left: Map */}
        <div className="min-h-[420px]">
          <CompanyMap
            nodes={nodes}
            infectionPulse={infectionPulse}
            recoveryPulse={recoveryPulse}
          />
        </div>

        {/* Center: Scenario */}
        <motion.div
          key={round.index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-5 md:p-6 relative scanlines"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-display uppercase tracking-widest text-neon-blue">
                  {round.time} · {round.stage}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-widest border rounded-full px-2 py-0.5 ${RISK_COLOR[round.riskLevel]}`}
                >
                  <AlertTriangle size={10} className="inline mr-1" />
                  Rủi ro: {round.riskLevel}
                </span>
              </div>
              <h2 className={`font-display ${isStage ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"} text-glow-blue leading-tight`}>
                {round.title}
              </h2>
            </div>
          </div>

          <p className={`${isStage ? "text-lg md:text-xl" : "text-base"} text-foreground/90 leading-relaxed mb-5`}>
            {round.scenario}
          </p>

          <div className={`grid gap-3 ${isStage ? "md:grid-cols-2" : "grid-cols-1"}`}>
            {round.options.map((opt) => {
              const showCorrect = revealed && opt.good;
              const showWrong = revealed && !opt.good;
              return (
                <motion.button
                  key={opt.key}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!!feedback}
                  onClick={() => pickOption(opt.key)}
                  className={`group text-left p-4 rounded-xl glass border transition-all relative overflow-hidden ${
                    showCorrect
                      ? "border-neon-green shadow-safe"
                      : showWrong
                      ? "border-neon-red/40 opacity-50"
                      : "border-[oklch(0.6_0.1_230/0.25)] hover:border-neon-blue hover:shadow-neon"
                  } ${feedback ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`font-display ${isStage ? "text-3xl md:text-4xl w-12" : "text-2xl w-10"} flex-shrink-0 ${
                        showCorrect ? "text-neon-green" : "text-neon-blue"
                      }`}
                    >
                      {opt.key}
                    </div>
                    <div className={`${isStage ? "text-base md:text-lg" : "text-sm md:text-base"} pt-1 text-foreground/90`}>
                      {opt.text}
                      {showVotes && (
                        <div className="mt-2 h-1.5 rounded-full bg-[oklch(0.2_0.03_260/0.8)] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${votes[round.options.indexOf(opt)]}%` }}
                            className="h-full gradient-neon"
                          />
                        </div>
                      )}
                      {showVotes && (
                        <div className="text-[10px] mt-1 text-muted-foreground">
                          {votes[round.options.indexOf(opt)]}% bình chọn
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Right: metrics + timeline (timeline at bottom on wide) */}
        <aside className="space-y-3">
          <MetricsPanel metrics={metrics} prev={prevMetrics} pulseKey={pulseKey} />
        </aside>
      </div>

      <div className="mt-4">
        <Timeline currentStage={currentStage} completedCount={completedCount} />
      </div>

      {/* Feedback */}
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

      {/* Host Control Panel */}
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
              className="glass-strong rounded-3xl w-full max-w-2xl p-6 ring-1 ring-neon-blue/40 shadow-neon"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Radio className="text-neon-blue" />
                  <h3 className="font-display text-xl">HOST CONTROL PANEL</h3>
                </div>
                <button onClick={() => setHostOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
              <div className="mt-4 text-[10px] text-muted-foreground uppercase tracking-widest text-center">
                Bảng điều khiển chỉ dành cho MC · ẩn khỏi khán giả
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HostBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
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
