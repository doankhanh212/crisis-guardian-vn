import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Award,
  Bug,
  Clock,
  Eye,
  FileText,
  Lock,
  Play,
  Radio,
  RotateCcw,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users2,
  X,
  Zap,
} from "lucide-react";
import { CompanyMap } from "@/game/CompanyMap";
import {
  MapConsequenceOverlay,
  MapPhaseStatus,
  MapQuestionOverlay,
} from "@/game/MapQuestionOverlay";
import { Timeline } from "@/game/Timeline";
import { FinalReport } from "@/game/FinalReport";
import {
  EVENT_MODE_NOTES,
  INITIAL_METRICS,
  INITIAL_NODES,
  ROUNDS,
  gradeFinal,
  type GameMode,
  type GradeResult,
  type MetricChange,
  type Metrics,
  type NodeId,
  type NodeState,
  type NodeStatus,
} from "@/game/data";

const MODE_LABELS: Record<GameMode, string> = {
  default: "Chế độ tiêu chuẩn",
  employee: "Chế độ Nhân viên",
  leader: "Chế độ Lãnh đạo",
  stage: "Chế độ Sân khấu",
};

const PRE_QUESTION_WAIT_MS = 3000;
const CONSEQUENCE_WAIT_MS = 5000;

// Mỗi câu hỏi chỉ có 30 giây để trả lời. Từ giây thứ 10 trở xuống sẽ bật
// hiệu ứng cảnh báo đỏ; hết giờ thì mã hóa toàn bộ và thua cuộc.
const QUESTION_TIME = 30;
const QUESTION_WARN_AT = 10;
const ENCRYPT_TAKEOVER_MS = 4200;

const TIMEOUT_DEFEAT: GradeResult = {
  grade: "Hết giờ — toàn bộ công ty đã bị mã hóa.",
  message:
    "Bạn không đưa ra quyết định trong 30 giây. Ransomware không chờ đợi: toàn bộ hệ thống đã bị khóa, bản sao dữ liệu mất sạch và công ty thất thủ.",
  tone: "fail",
  badge: "Total Lockdown",
  badgeDescription:
    "Khi thời gian đếm về 0, ransomware mã hóa mọi thứ. Quyết định chậm cũng là một quyết định — và đây là cái giá của nó.",
};

type UiPhase = "preQuestion" | "question" | "consequence";

interface AnswerResult {
  picked: "A" | "B" | "C" | "D";
  isGood: boolean;
  changes: MetricChange;
}

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

export function GameRoom({ mode, teamName, onExit }: Props) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [metrics, setMetrics] = useState<Metrics>(INITIAL_METRICS);
  const [prevMetrics, setPrevMetrics] = useState<Metrics>(INITIAL_METRICS);
  const [pulseKey, setPulseKey] = useState(0);
  const [nodes, setNodes] = useState<NodeState[]>(INITIAL_NODES);
  const [uiPhase, setUiPhase] = useState<UiPhase>("preQuestion");
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [infectionPulse, setInfectionPulse] = useState<{ from: NodeId; to: NodeId[] } | null>(
    null
  );
  const [recoveryPulse, setRecoveryPulse] = useState<{ from: NodeId; to: NodeId[] } | null>(
    null
  );
  const [seconds, setSeconds] = useState(15 * 60);
  const [hostOpen, setHostOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [showVotes, setShowVotes] = useState(false);
  const [finished, setFinished] = useState(false);
  const [questionSeconds, setQuestionSeconds] = useState(QUESTION_TIME);
  const [encrypting, setEncrypting] = useState(false);
  const [forcedResult, setForcedResult] = useState<GradeResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const encryptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timedOutRef = useRef(false);

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

  const threatTargetIds = useMemo(() => {
    const ids = new Set<NodeId>();
    round.spreadTo?.forEach((id) => ids.add(id));
    Object.keys(round.riskyNodes).forEach((id) => ids.add(id as NodeId));
    if (ids.size === 0 && round.spreadFrom) ids.add(round.spreadFrom);
    if (ids.size === 0) ids.add("ops");
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

  useEffect(() => {
    setUiPhase("preQuestion");
    setAnswerResult(null);
    setRevealed(false);
    setShowVotes(false);
    setInfectionPulse(null);
    setRecoveryPulse(null);

    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    phaseTimerRef.current = setTimeout(() => {
      setUiPhase("question");
    }, PRE_QUESTION_WAIT_MS);

    return () => {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    };
  }, [roundIdx]);

  useEffect(() => {
    return () => {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      if (encryptTimerRef.current) clearTimeout(encryptTimerRef.current);
    };
  }, []);

  // Đếm ngược 30 giây cho mỗi câu hỏi. Chỉ chạy khi đang ở phase "question".
  // Khi đổi phase (đã trả lời) hoặc sang vòng khác, interval được dọn sạch.
  useEffect(() => {
    if (uiPhase !== "question") return;
    setQuestionSeconds(QUESTION_TIME);
    timedOutRef.current = false;

    const id = setInterval(() => {
      setQuestionSeconds((s) => {
        if (s <= 1) {
          clearInterval(id);
          handleQuestionTimeout();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiPhase, roundIdx]);

  // Hết 30 giây mà chưa trả lời: hủy câu hỏi, mã hóa toàn bộ công ty rồi thua.
  function handleQuestionTimeout() {
    if (timedOutRef.current || finished || encrypting) return;
    timedOutRef.current = true;

    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);

    setNodes((ns) => ns.map((n) => ({ ...n, status: "down" as NodeStatus })));
    setMetrics((m) => {
      setPrevMetrics(m);
      return applyMetrics(m, {
        encryptedData: 100,
        backupHealth: -100,
        customerTrust: -100,
        recoveryReadiness: -100,
        businessImpact: 100,
        reputationDamage: 100,
      });
    });
    setPulseKey((k) => k + 1);
    setInfectionPulse({
      from: "fileserver",
      to: ["email", "employee", "finance", "ops", "customers", "backup", "soc"],
    });

    setUiPhase("consequence");
    setAnswerResult(null);
    setForcedResult(TIMEOUT_DEFEAT);
    setEncrypting(true);

    if (encryptTimerRef.current) clearTimeout(encryptTimerRef.current);
    encryptTimerRef.current = setTimeout(() => {
      setEncrypting(false);
      setFinished(true);
    }, ENCRYPT_TAKEOVER_MS);
  }

  function advanceAfterConsequence() {
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
    if (pulseTimerRef.current) {
      clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = null;
    }
    setInfectionPulse(null);
    setRecoveryPulse(null);

    if (roundIdx + 1 >= ROUNDS.length) {
      setFinished(true);
    } else {
      setRoundIdx((i) => i + 1);
    }
  }

  function pickOption(key: "A" | "B" | "C" | "D") {
    if (uiPhase !== "question" || answerResult) return;

    const opt = round.options.find((o) => o.key === key)!;
    const isGood = opt.good;
    const changes = isGood ? round.goodChanges : round.riskyChanges;
    const targetNodes = isGood ? round.goodNodes : round.riskyNodes;

    setPrevMetrics(metrics);
    setMetrics((m) => applyMetrics(m, changes));
    setPulseKey((k) => k + 1);
    setNodes((ns) =>
      ns.map((n) => {
        const next = targetNodes[n.id];
        return next ? { ...n, status: next } : n;
      })
    );

    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    if (isGood) {
      const protectedNodes = Object.keys(round.goodNodes) as NodeId[];
      setRecoveryPulse({
        from: round.stage === "Recovery" ? "backup" : "soc",
        to: protectedNodes.length > 0 ? protectedNodes : ["fileserver", "backup"],
      });
    } else {
      setInfectionPulse({
        from: round.spreadFrom ?? "email",
        to: round.spreadTo && round.spreadTo.length > 0 ? round.spreadTo : ["ops", "customers"],
      });
    }
    pulseTimerRef.current = setTimeout(() => {
      setInfectionPulse(null);
      setRecoveryPulse(null);
    }, 5000);

    setAnswerResult({ picked: key, isGood, changes });
    setUiPhase("consequence");

    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    phaseTimerRef.current = setTimeout(advanceAfterConsequence, CONSEQUENCE_WAIT_MS);
  }

  useEffect(() => {
    if (uiPhase !== "question" || answerResult || finished || hostOpen) return;

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
      const optionKey = shortcutMap[event.key.toLowerCase()];
      if (!optionKey || !round.options.some((option) => option.key === optionKey)) return;

      event.preventDefault();
      pickOption(optionKey);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [answerResult, finished, hostOpen, round, uiPhase]);

  function restart() {
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    if (encryptTimerRef.current) clearTimeout(encryptTimerRef.current);
    setRoundIdx(0);
    setMetrics(INITIAL_METRICS);
    setPrevMetrics(INITIAL_METRICS);
    setNodes(INITIAL_NODES);
    setFinished(false);
    setAnswerResult(null);
    setUiPhase("preQuestion");
    setInfectionPulse(null);
    setRecoveryPulse(null);
    setSeconds(15 * 60);
    setQuestionSeconds(QUESTION_TIME);
    setEncrypting(false);
    setForcedResult(null);
  }

  function triggerInfection() {
    if (round.spreadFrom && round.spreadTo) {
      setInfectionPulse({ from: round.spreadFrom, to: round.spreadTo });
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = setTimeout(() => setInfectionPulse(null), 1500);
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
    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = setTimeout(() => {
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
        result={forcedResult ?? gradeFinal(metrics)}
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
  const completedCount = uiPhase === "consequence" ? Math.min(roundIdx + 1, ROUNDS.length) : roundIdx;
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
  const mapActiveNodeIds =
    uiPhase === "preQuestion"
      ? Array.from(
          new Set(
            [round.spreadFrom, ...threatTargetIds].filter(
              (id): id is NodeId => Boolean(id)
            )
          )
        )
      : activeNodeIds;

  return (
    <div className="relative min-h-screen overflow-hidden p-3 md:p-4">
      <div className="pointer-events-none fixed inset-0 opacity-70 grid-bg" />
      <div className="pointer-events-none fixed inset-0 crisis-ambient" />

      {/* Viền màn hình đỏ nhấp nháy khi còn <=10 giây */}
      {uiPhase === "question" && questionSeconds <= QUESTION_WARN_AT && !encrypting && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-30"
          animate={{ opacity: [0.25, 0.7, 0.25] }}
          transition={{ repeat: Infinity, duration: 1 }}
          style={{ boxShadow: "inset 0 0 220px 50px oklch(0.55 0.26 25 / 0.65)" }}
        />
      )}

      <div className="relative mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1800px] flex-col gap-4">
        <header className="glass-strong rounded-2xl px-4 md:px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShieldAlert className="text-neon-red" size={28} />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-neon-red animate-ping" />
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
            <MetricBadge label="Dữ liệu bị khóa" value={`${metrics.encryptedData}%`} tone="danger" />
            <MetricBadge label="Bản sao an toàn" value={`${metrics.backupHealth}%`} tone="safe" />
            <MetricBadge label="Niềm tin" value={`${metrics.customerTrust}%`} tone="blue" />
            <div className="glass rounded-xl px-3 py-1.5 flex items-center gap-2">
              <Clock size={16} className="text-neon-amber" />
              <span className="font-display tabular-nums text-base md:text-lg">
                {mm}:{ss}
              </span>
            </div>
            <div className="glass rounded-xl px-3 py-1.5">
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Vòng
              </div>
              <div className="font-display text-base md:text-lg text-neon-blue">
                {round.index} <span className="text-muted-foreground text-xs">/ {ROUNDS.length}</span>
              </div>
            </div>
            <div className="glass rounded-xl px-3 py-1.5 hidden md:block">
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Điểm bảo vệ
              </div>
              <div className="font-display text-base md:text-lg text-neon-green">
                {metrics.defenderScore}
              </div>
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
          <section className="order-1 min-h-[620px] md:min-h-[720px] xl:min-h-[calc(100vh-12rem)] lg:col-span-12">
            <CompanyMap
              nodes={nodes}
              activeNodeIds={mapActiveNodeIds}
              threatPulse={
                uiPhase === "preQuestion"
                  ? { to: threatTargetIds, intensity: "warning" }
                  : uiPhase === "consequence" && answerResult && !answerResult.isGood
                  ? { to: threatTargetIds, intensity: "danger" }
                  : null
              }
              infectionPulse={infectionPulse}
              recoveryPulse={recoveryPulse}
              phaseTone={
                uiPhase === "preQuestion"
                  ? "danger"
                  : uiPhase === "consequence"
                  ? answerResult?.isGood
                    ? "safe"
                    : "danger"
                  : "watch"
              }
            >
              <AnimatePresence mode="wait">
                {uiPhase === "preQuestion" && (
                  <MapPhaseStatus
                    key={`pre-${round.index}`}
                    round={round}
                    uiPhase={uiPhase}
                  />
                )}
                {uiPhase === "question" && (
                  <MapQuestionOverlay
                    key={`question-${round.index}`}
                    round={round}
                    isStage={isStage}
                    showVotes={showVotes}
                    revealed={revealed}
                    votes={votes}
                    secondsLeft={questionSeconds}
                    onPick={pickOption}
                  />
                )}
                {uiPhase === "consequence" && answerResult && (
                  <>
                    <MapPhaseStatus
                      key={`status-${round.index}-${answerResult.picked}`}
                      round={round}
                      uiPhase={uiPhase}
                    />
                    <MapConsequenceOverlay
                      key={`result-${round.index}-${answerResult.picked}`}
                      round={round}
                      picked={answerResult.picked}
                      isGood={answerResult.isGood}
                      changes={answerResult.changes}
                      isLastRound={roundIdx + 1 >= ROUNDS.length}
                      onContinue={advanceAfterConsequence}
                    />
                  </>
                )}
              </AnimatePresence>
            </CompanyMap>
          </section>

          <div className="order-2 lg:col-span-12">
            <Timeline currentStage={currentStage} completedCount={completedCount} />
          </div>
        </main>
      </div>

      <AnimatePresence>{encrypting && <EncryptionTakeover />}</AnimatePresence>

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
                  <h3 className="font-display text-xl">Bảng điều khiển host</h3>
                </div>
                <button
                  onClick={() => setHostOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                <HostBtn
                  icon={<Play size={18} />}
                  label="Bắt đầu vòng"
                  onClick={() => setUiPhase("question")}
                />
                <HostBtn
                  icon={<Eye size={18} />}
                  label="Hiện đáp án"
                  onClick={() => setRevealed(true)}
                />
                <HostBtn
                  icon={<Users2 size={18} />}
                  label="Hiện vote khán giả"
                  onClick={() => setShowVotes(true)}
                />
                <HostBtn icon={<Zap size={18} />} label="Trigger lây nhiễm" onClick={triggerInfection} />
                <HostBtn
                  icon={<ShieldCheck size={18} />}
                  label="Cô lập máy nhiễm"
                  onClick={triggerIsolation}
                />
                <HostBtn
                  icon={<ShieldCheck size={18} />}
                  label="Khôi phục bản sao"
                  onClick={triggerRecovery}
                />
                <HostBtn
                  icon={<FileText size={18} />}
                  label="Báo cáo cuối"
                  onClick={() => setFinished(true)}
                />
                <HostBtn
                  icon={<Award size={18} />}
                  label="Hiện badge"
                  onClick={() => setFinished(true)}
                />
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

const LOCKED_FILES = [
  "hop_dong_2026.docx.locked",
  "bao_cao_tai_chinh.xlsx.locked",
  "ke_hoach_kinh_doanh.pptx.locked",
  "du_lieu_khach_hang.db.locked",
  "backup_he_thong.bak.locked",
  "luong_nhan_vien.xlsx.locked",
  "ma_nguon_san_pham.zip.locked",
  "hoa_don_dien_tu.pdf.locked",
];

function EncryptionTakeover() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-[oklch(0.06_0.03_25/0.97)] p-6 backdrop-blur-md"
    >
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ repeat: Infinity, duration: 1.1 }}
        className="grid h-24 w-24 place-items-center rounded-3xl border border-neon-red/60 bg-[oklch(0.15_0.08_25/0.6)] text-neon-red shadow-neon"
      >
        <Lock size={56} />
      </motion.div>

      <div className="text-center">
        <div className="mb-2 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] text-neon-red">
          <AlertTriangle size={14} /> Hết thời gian
        </div>
        <motion.h2
          animate={{ x: [0, -2, 2, -1, 0] }}
          transition={{ repeat: Infinity, duration: 0.35 }}
          className="font-display text-2xl leading-tight text-neon-red text-glow-red md:text-4xl"
        >
          ĐANG MÃ HÓA TOÀN BỘ HỆ THỐNG CÔNG TY
        </motion.h2>
        <p className="mt-2 text-sm text-foreground/70 md:text-base">
          Ransomware đang khóa mọi tệp dữ liệu. Không thể hoàn tác.
        </p>
      </div>

      <div className="h-2.5 w-full max-w-md overflow-hidden rounded-full border border-neon-red/40 bg-[oklch(0.12_0.04_25/0.7)]">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: ENCRYPT_TAKEOVER_MS / 1000, ease: "linear" }}
          className="h-full gradient-danger"
        />
      </div>

      <div className="w-full max-w-md space-y-1 font-mono text-xs text-neon-red/80">
        {LOCKED_FILES.map((file, i) => (
          <motion.div
            key={file}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.35 }}
            className="flex items-center gap-2"
          >
            <Lock size={11} /> {file}
          </motion.div>
        ))}
      </div>
    </motion.div>
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

function MetricBadge({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "safe" | "danger";
}) {
  const toneClass =
    tone === "safe"
      ? "border-neon-green/35 text-neon-green"
      : tone === "danger"
      ? "border-neon-red/35 text-neon-red"
      : "border-neon-blue/35 text-neon-blue";

  return (
    <div className={`hidden rounded-xl border bg-[oklch(0.14_0.04_260/0.55)] px-3 py-1.5 md:block ${toneClass}`}>
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-base tabular-nums">{value}</div>
    </div>
  );
}
