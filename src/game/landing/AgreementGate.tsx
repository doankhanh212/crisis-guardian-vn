import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CircleX, ShieldCheck } from "lucide-react";

interface AgreementGateProps {
  onAgree: () => void;
}

const ESCAPE_POINTS = [
  { x: 72, y: 76 },
  { x: 24, y: 72 },
  { x: 82, y: 45 },
  { x: 18, y: 44 },
  { x: 54, y: 82 },
  { x: 78, y: 22 },
  { x: 32, y: 24 },
  { x: 48, y: 58 },
];

export function AgreementGate({ onAgree }: AgreementGateProps) {
  const [escapeIndex, setEscapeIndex] = useState(0);
  const escapePoint = ESCAPE_POINTS[escapeIndex % ESCAPE_POINTS.length];
  const rotate = useMemo(() => (escapeIndex % 2 === 0 ? -3 : 3), [escapeIndex]);
  const hasDodged = escapeIndex > 0;

  function dodgeDisagree() {
    setEscapeIndex((index) => index + 1);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong relative mx-auto min-h-[300px] max-w-3xl overflow-hidden rounded-2xl p-5 md:p-7"
    >
      <div className="relative">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl text-neon-blue">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="font-display text-2xl text-foreground md:text-4xl">
              HQG xin chào!
            </h2>
          </div>
        </div>

        <p className="max-w-2xl text-base leading-relaxed text-foreground/92 md:text-lg">
          Thông tin bạn cung cấp được dùng để ghi nhận lượt tham gia, hiển thị kết quả trò
          chơi, hỗ trợ trao quà tại sự kiện và có thể liên hệ kết bạn / hợp tác sau chương
          trình nếu bạn dong tinh
        </p>

        <div className="mt-5 rounded-2xl border border-neon-blue/30 bg-[oklch(0.14_0.045_260/0.55)] px-4 py-3 text-sm text-muted-foreground">
          Thông tin được sử dụng trong phạm vi sự kiện, không dùng để spam và không chia sẻ trái phép.
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onAgree}
            className="gradient-neon text-primary-foreground font-display uppercase tracking-widest px-5 py-3 rounded-2xl inline-flex items-center justify-center gap-2 shadow-neon hover:opacity-90"
          >
            <ShieldCheck size={18} /> Toi dong tinh
          </button>

          <motion.button
            type="button"
            onMouseEnter={dodgeDisagree}
            onFocus={dodgeDisagree}
            onClick={dodgeDisagree}
            animate={
              hasDodged
                ? {
                    left: `${escapePoint.x}%`,
                    top: `${escapePoint.y}%`,
                    rotate,
                  }
                : { rotate: 0 }
            }
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className={`z-20 rounded-2xl border border-neon-blue/35 bg-[oklch(0.16_0.05_260/0.88)] px-5 py-3 font-display text-xs uppercase tracking-widest text-foreground shadow-neon hover:border-neon-red hover:text-neon-red ${
              hasDodged ? "absolute" : "relative"
            }`}
            style={hasDodged ? { transform: "translate(-50%, -50%)" } : undefined}
          >
            <CircleX size={16} className="mr-2 inline" />
            Toi khong dong tinh
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
}
