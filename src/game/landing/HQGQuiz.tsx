import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { HQG_QUIZ } from "@/game/landing/quizData";
import type { QuizFeedback, QuizKey, QuizQuestion } from "@/game/landing/types";

interface HQGQuizProps {
  quizIndex: number;
  currentQuestion: QuizQuestion;
  activeFeedback: QuizFeedback | null;
  onSelectAnswer: (selected: QuizKey) => void;
  onContinueFeedback: () => void;
  onSkip: () => void;
}

export function HQGQuiz({
  quizIndex,
  currentQuestion,
  activeFeedback,
  onSelectAnswer,
  onContinueFeedback,
  onSkip,
}: HQGQuizProps) {
  const isLastQuestion = quizIndex + 1 >= HQG_QUIZ.length;

  return (
    <motion.section
      key={`quiz-${quizIndex}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-strong rounded-2xl p-5 md:p-7 max-w-4xl mx-auto overflow-hidden relative ${
        activeFeedback?.correct
          ? "ring-2 ring-neon-green/60 shadow-safe"
          : activeFeedback
          ? "ring-2 ring-neon-amber/60 shadow-danger"
          : ""
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-1 gradient-neon" />
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-neon-blue">
            Câu {quizIndex + 1} / {HQG_QUIZ.length}
          </div>
          <h2 className="mt-2 font-display text-2xl md:text-4xl text-glow-blue">
            Bạn hiểu HQG cỡ nào?
          </h2>
          <p className="mt-2 max-w-2xl text-sm md:text-base text-muted-foreground">
            Trả lời nhanh 3 câu hỏi trước khi bước vào Ransomware Crisis Room.
            Sai cũng được, nhưng đừng chọn cơm sườn quá tự tin.
          </p>
        </div>
        <button
          onClick={onSkip}
          className="self-start rounded-2xl border border-neon-blue/30 bg-[oklch(0.18_0.06_230/0.45)] px-4 py-2 text-xs font-display uppercase tracking-widest text-neon-blue hover:bg-[oklch(0.24_0.09_230/0.55)]"
        >
          Bỏ qua và vào game
        </button>
      </div>

      <div className="mb-4 rounded-2xl border border-neon-blue/25 bg-[oklch(0.12_0.035_260/0.58)] p-4">
        <h3 className="font-display text-xl md:text-3xl text-foreground leading-tight">
          {currentQuestion.title}
        </h3>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {currentQuestion.options.map((option) => {
          const isSelected = activeFeedback?.selected === option.key;
          const isCorrectOption = option.key === currentQuestion.correct;
          return (
            <motion.button
              key={option.key}
              whileHover={!activeFeedback ? { y: -3, scale: 1.01 } : undefined}
              whileTap={!activeFeedback ? { scale: 0.98 } : undefined}
              disabled={!!activeFeedback}
              onClick={() => onSelectAnswer(option.key)}
              className={`group min-h-[104px] rounded-2xl border p-4 text-left transition ${
                isSelected && activeFeedback?.correct
                  ? "border-neon-green bg-[oklch(0.22_0.12_145/0.55)] shadow-safe"
                  : isSelected
                  ? "border-neon-amber bg-[oklch(0.25_0.1_80/0.48)] shadow-danger"
                  : activeFeedback && isCorrectOption
                  ? "border-neon-green/60 bg-[oklch(0.18_0.09_145/0.35)]"
                  : "glass border-[oklch(0.6_0.1_230/0.25)] hover:border-neon-blue hover:shadow-neon"
              } ${activeFeedback ? "cursor-default" : "cursor-pointer"}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl ${
                    isSelected && activeFeedback?.correct
                      ? "bg-[oklch(0.3_0.14_145/0.55)] text-neon-green"
                      : isSelected
                      ? "bg-[oklch(0.3_0.12_80/0.55)] text-neon-amber"
                      : "bg-[oklch(0.16_0.05_260/0.68)] text-neon-blue"
                  }`}
                >
                  {option.icon}
                </div>
                <div>
                  <div className="font-display text-2xl text-neon-blue">{option.key}</div>
                  <div className="text-base md:text-lg leading-relaxed text-foreground/92">
                    {option.text}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {activeFeedback && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[oklch(0.04_0.02_260/0.72)] p-4 backdrop-blur-sm">
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              x: activeFeedback.correct ? 0 : [0, -6, 6, -3, 3, 0],
            }}
            className={`glass-strong w-full max-w-xl rounded-2xl border p-6 text-center ${
              activeFeedback.correct
                ? "border-neon-green/70 shadow-safe"
                : "border-neon-amber/70 shadow-danger"
            }`}
          >
            <div
              className={`mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl border ${
                activeFeedback.correct
                  ? "border-neon-green/60 bg-[oklch(0.22_0.11_145/0.45)] text-neon-green"
                  : "border-neon-amber/60 bg-[oklch(0.24_0.11_80/0.45)] text-neon-amber"
              }`}
            >
              {activeFeedback.correct ? <CheckCircle2 size={34} /> : <XCircle size={34} />}
            </div>

            <div
              className={`font-display text-3xl ${
                activeFeedback.correct ? "text-neon-green text-glow-green" : "text-neon-amber"
              }`}
            >
              {activeFeedback.correct ? "Chọn chuẩn!" : "Chưa đúng rồi!"}
            </div>
            <p className="mt-4 text-base md:text-lg font-semibold leading-relaxed text-foreground/92">
              {activeFeedback.message}
            </p>
            <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
              Tự chuyển sau 7 giây
            </p>

            <button
              onClick={onContinueFeedback}
              className="mt-6 gradient-neon text-primary-foreground font-display uppercase tracking-widest px-6 py-3 rounded-2xl inline-flex items-center justify-center gap-2 shadow-neon hover:opacity-90"
            >
              {isLastQuestion ? "Hoàn tất khởi động" : "Qua câu tiếp theo"}
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </motion.section>
  );
}
