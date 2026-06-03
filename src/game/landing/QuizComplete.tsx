import { motion } from "framer-motion";
import { Play, Trophy } from "lucide-react";

interface QuizCompleteProps {
  answeredCount: number;
  totalQuestions: number;
  onStartGame: () => void;
}

export function QuizComplete({
  answeredCount,
  totalQuestions,
  onStartGame,
}: QuizCompleteProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="glass-strong rounded-2xl p-6 md:p-8 max-w-3xl mx-auto text-center"
    >
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl border border-neon-green/50 bg-[oklch(0.22_0.11_145/0.45)] text-neon-green shadow-safe">
        <Trophy size={32} />
      </div>
      <h2 className="font-display text-3xl md:text-5xl text-neon-green text-glow-green">
        Qua vòng khởi động!
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base md:text-xl text-foreground/90">
        Giờ thì vào Ransomware Crisis Room. Bạn có 8 quyết định để cứu doanh nghiệp
        khỏi virus khóa dữ liệu.
      </p>
      <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
        Bạn đã trả lời {answeredCount} / {totalQuestions} câu khởi động
      </div>
      <button
        onClick={onStartGame}
        className="mt-6 gradient-neon text-primary-foreground font-display uppercase tracking-widest px-8 py-4 rounded-2xl inline-flex items-center justify-center gap-2 shadow-neon hover:opacity-90"
      >
        <Play size={18} /> Bắt đầu thử thách
      </button>
    </motion.section>
  );
}
