import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  FileSearch,
  Radio,
  ShieldCheck,
} from "lucide-react";
import type { DecisionOption, MetricChange, Round } from "@/game/data";

type UiPhase = "preQuestion" | "question" | "consequence";

interface QuestionOverlayProps {
  round: Round;
  isStage: boolean;
  showVotes: boolean;
  revealed: boolean;
  votes: number[];
  secondsLeft: number;
  onPick: (key: DecisionOption["key"]) => void;
}

const QUESTION_WARN_AT = 10;

interface PhaseStatusProps {
  round: Round;
  uiPhase: UiPhase;
}

interface ConsequenceOverlayProps {
  round: Round;
  picked: DecisionOption["key"];
  isGood: boolean;
  changes: MetricChange;
  isLastRound: boolean;
  onContinue: () => void;
}

const EVIDENCE_CHIPS: Record<number, string[]> = {
  1: ["File .pdf.exe", "Khẩn cấp", "Người gửi lạ"],
  2: ["Máy chạy chậm", "File .locked", "Dấu hiệu lạ"],
  3: ["Dữ liệu bị khóa", "Nhiều phòng ban ảnh hưởng", "Kho dữ liệu nguy hiểm"],
  4: ["Bản sao dữ liệu", "Nguy cơ lây nhiễm", "Khả năng khôi phục"],
  5: ["Đòi tiền chuộc", "Dịch vụ gián đoạn", "Áp lực kinh doanh"],
  6: ["Khách hàng gọi", "Dịch vụ gián đoạn", "Niềm tin giảm"],
  7: ["Có bản sao sạch", "Cần làm sạch môi trường", "Khôi phục có kiểm soát"],
  8: ["Đào tạo", "MFA", "Bản sao dữ liệu", "Quy trình rõ ràng"],
};

const PHASE_LABELS: Record<number, string> = {
  1: "Hacker đang thả mồi qua cổng email...",
  2: "Máy người dùng bắt đầu phát tín hiệu bất thường...",
  3: "Virus đang nhắm vào kho dữ liệu quan trọng...",
  4: "Phao cứu sinh cuối cùng đang bị nhắm tới...",
  5: "Hacker gửi yêu cầu chuộc dữ liệu...",
  6: "Niềm tin khách hàng đang dao động...",
  7: "Đã tìm thấy bản sao dữ liệu sạch...",
  8: "Doanh nghiệp cần nâng cấp khả năng phòng thủ...",
};

const QUESTION_LABELS: Record<number, string> = {
  8: "Bạn chọn hướng nào cho tương lai?",
};

const METRIC_LABELS: Record<keyof MetricChange, string> = {
  businessImpact: "Thiệt hại công việc",
  encryptedData: "Dữ liệu bị khóa",
  downtimeHours: "Gián đoạn",
  customerTrust: "Niềm tin KH",
  reputationDamage: "Uy tín",
  backupHealth: "An toàn bản sao",
  recoveryReadiness: "Khả năng khôi phục",
  defenderScore: "Điểm bảo vệ",
};

const STAGE_LABELS: Record<string, string> = {
  Email: "Email lừa đảo",
  Infection: "Máy bị nhiễm",
  Spread: "Lan sang kho dữ liệu",
  "Backup Risk": "Rủi ro bản sao dữ liệu",
  "Leadership Decision": "Quyết định của lãnh đạo",
  Communication: "Thông báo khách hàng",
  Recovery: "Khôi phục hoạt động",
  "Lessons Learned": "Bài học sau sự cố",
};

export function MapPhaseStatus({ round, uiPhase }: PhaseStatusProps) {
  const isConsequence = uiPhase === "consequence";
  return (
    <motion.div
      key={`${round.index}-${uiPhase}`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`absolute left-4 top-20 z-30 max-w-[calc(100%-2rem)] rounded-2xl border px-4 py-3 backdrop-blur-xl md:left-6 ${
        isConsequence
          ? "border-neon-blue/40 bg-[oklch(0.16_0.06_230/0.72)]"
          : "border-neon-amber/40 bg-[oklch(0.18_0.08_80/0.52)]"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isConsequence ? "bg-neon-blue" : "bg-neon-amber"
          } animate-pulse`}
        />
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {round.time} · {STAGE_LABELS[round.stage] ?? round.stage}
          </div>
          <div className="font-display text-sm text-foreground md:text-base">
            {isConsequence ? "Đang ghi nhận tác động lên hệ thống..." : PHASE_LABELS[round.index]}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function MapQuestionOverlay({
  round,
  isStage,
  showVotes,
  revealed,
  votes,
  secondsLeft,
  onPick,
}: QuestionOverlayProps) {
  const chips = EVIDENCE_CHIPS[round.index] ?? [round.stage, round.riskLevel, round.time];
  const warning = secondsLeft <= QUESTION_WARN_AT;

  return (
    <motion.div
      key={`question-${round.index}`}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 210, damping: 22 }}
      className="absolute inset-x-3 bottom-3 z-40 mx-auto max-h-[82%] max-w-5xl overflow-y-auto rounded-3xl border border-neon-blue/55 bg-[oklch(0.12_0.04_260/0.88)] p-4 shadow-neon backdrop-blur-2xl md:inset-x-6 md:bottom-6 md:p-5"
    >
      <div className="absolute inset-x-0 top-0 h-1 gradient-neon" />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-widest text-neon-blue">
            <Radio size={14} /> Cảnh báo trực tiếp · Vòng {round.index}
          </div>
          <h2 className="font-display text-xl leading-tight text-glow-blue md:text-3xl">
            {round.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={warning ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={warning ? { repeat: Infinity, duration: 0.7 } : { duration: 0.2 }}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-display tabular-nums ${
              warning
                ? "border-neon-red/70 bg-[oklch(0.2_0.1_25/0.6)] text-neon-red shadow-neon"
                : "border-neon-amber/50 bg-[oklch(0.2_0.08_80/0.4)] text-neon-amber"
            }`}
          >
            {warning ? <AlertTriangle size={14} /> : <Clock size={14} />}
            <span className="text-lg leading-none">{secondsLeft}s</span>
          </motion.div>
          <div className="rounded-full border border-neon-red/40 bg-[oklch(0.2_0.08_25/0.45)] px-3 py-1 text-[10px] uppercase tracking-widest text-neon-red">
            Rủi ro: {round.riskLevel}
          </div>
        </div>
      </div>

      {warning && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: [1, 0.55, 1], y: 0 }}
          transition={{ opacity: { repeat: Infinity, duration: 1 } }}
          className="mb-3 flex items-center gap-2 rounded-2xl border border-neon-red/60 bg-[oklch(0.2_0.1_25/0.55)] px-4 py-2 text-neon-red"
        >
          <AlertTriangle size={18} className="flex-shrink-0" />
          <span className="font-display text-sm md:text-base">
            {secondsLeft} giây nữa ransomware sẽ mã hóa TOÀN BỘ công ty!
          </span>
        </motion.div>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-neon-amber/35 bg-[oklch(0.24_0.09_80/0.35)] px-3 py-1 text-xs text-neon-amber"
          >
            <FileSearch size={12} className="mr-1 inline" />
            {chip}
          </span>
        ))}
      </div>

      <div className="mb-3 font-display text-lg text-foreground md:text-2xl">
        {QUESTION_LABELS[round.index] ?? "Bạn xử lý thế nào?"}
      </div>

      <motion.p
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-2xl border border-neon-blue/20 bg-[oklch(0.13_0.035_260/0.64)] p-3 text-sm leading-relaxed text-foreground/88 md:text-base"
      >
        {round.scenario}
      </motion.p>

      <div className="grid gap-3 md:grid-cols-2">
        {round.options.map((option, index) => {
          const showCorrect = revealed && option.good;
          const showWrong = revealed && !option.good;
          return (
            <motion.button
              key={option.key}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPick(option.key)}
              className={`group min-h-[92px] rounded-2xl border p-4 text-left transition ${
                showCorrect
                  ? "border-neon-green shadow-safe bg-[oklch(0.23_0.11_145/0.55)]"
                  : showWrong
                  ? "border-neon-red/50 opacity-60 bg-[oklch(0.2_0.09_25/0.45)]"
                  : "glass border-[oklch(0.6_0.1_230/0.28)] hover:border-neon-blue hover:shadow-neon"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`font-display text-3xl md:text-4xl ${
                    showCorrect ? "text-neon-green" : "text-neon-blue"
                  }`}
                >
                  {option.key}
                </div>
                <div className="pt-1">
                  <div className={`${isStage ? "text-base md:text-lg" : "text-sm md:text-base"} leading-relaxed text-foreground/92`}>
                    {option.text}
                  </div>
                  {showVotes && (
                    <>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[oklch(0.2_0.03_260/0.8)]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${votes[index]}%` }}
                          className="h-full gradient-neon"
                        />
                      </div>
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        {votes[index]}% bình chọn
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

export function MapConsequenceOverlay({
  round,
  picked,
  isGood,
  changes,
  isLastRound,
  onContinue,
}: ConsequenceOverlayProps) {
  const Icon = isGood ? ShieldCheck : AlertTriangle;
  const tone = isGood ? "text-neon-green border-neon-green/55 bg-[oklch(0.18_0.09_145/0.72)]" : "text-neon-red border-neon-red/55 bg-[oklch(0.18_0.1_25/0.76)]";
  const metricEntries = (Object.keys(changes) as (keyof MetricChange)[]).filter(
    (key) => (changes[key] ?? 0) !== 0
  );

  return (
    <motion.div
      key={`consequence-${round.index}-${picked}`}
      initial={{ opacity: 0, x: "-50%", y: "-42%", scale: 0.94 }}
      animate={{ opacity: 1, x: "-50%", y: "-50%", scale: 1 }}
      exit={{ opacity: 0, x: "-50%", y: "-46%", scale: 0.98 }}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
      className={`absolute left-1/2 top-1/2 z-40 w-[calc(100%-2rem)] max-w-5xl overflow-hidden rounded-3xl border p-5 shadow-neon backdrop-blur-2xl md:p-7 ${tone}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1.5 ${isGood ? "gradient-safe" : "gradient-danger"}`} />
      <div className="flex items-start gap-4">
        <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl border border-current/45 bg-[oklch(0.08_0.025_260/0.5)] md:h-20 md:w-20">
          <Icon size={38} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground md:text-xs">
            Đáp án {picked} · {isGood ? "Quyết định tốt" : "Quyết định rủi ro"}
          </div>
          <div className="font-display text-2xl leading-tight text-foreground md:text-5xl">
            {isGood ? round.goodImpact : round.riskyImpact}
          </div>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-foreground/86 md:text-xl">
            {isGood ? round.goodConsequence : round.riskyConsequence}
          </p>
        </div>
      </div>

      {metricEntries.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
          {metricEntries.slice(0, 4).map((key) => {
            const value = changes[key] ?? 0;
            return (
              <div
                key={key}
                className="rounded-2xl border border-white/10 bg-[oklch(0.08_0.025_260/0.42)] px-3 py-2 md:px-4 md:py-3"
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {METRIC_LABELS[key]}
                </div>
                <div className="font-display text-2xl text-foreground md:text-3xl">
                  {value > 0 ? `+${value}` : value}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-4 md:flex-row">
        <div className="text-center text-xs uppercase tracking-widest text-muted-foreground md:text-left">
          Tự chuyển sau 5 giây
        </div>
        <button
          onClick={onContinue}
          className="ml-auto gradient-neon text-primary-foreground font-display uppercase tracking-widest px-6 py-3 rounded-2xl inline-flex items-center justify-center gap-2 shadow-neon hover:opacity-90"
        >
          {isLastRound ? "Xem báo cáo cuối" : "Bỏ qua"}
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}
