import { motion } from "framer-motion";

export function LandingHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-7 md:mb-9"
    >
      <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-5">
        <span className="h-2 w-2 rounded-full bg-neon-red animate-pulse" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Mô phỏng Ransomware
        </span>
      </div>

      <motion.h1
        initial={{ scale: 0.94 }}
        animate={{ scale: 1 }}
        className="font-display text-4xl md:text-7xl text-glow-blue leading-[1.05] mb-4"
      >
        Ransomware
        <br />
        <span className="bg-gradient-to-r from-[oklch(0.7_0.25_25)] via-[oklch(0.85_0.18_80)] to-[oklch(0.78_0.18_230)] bg-clip-text text-transparent">
          Crisis Room
        </span>
      </motion.h1>

      <p className="text-lg md:text-2xl text-foreground/90 mb-3 max-w-3xl mx-auto">
        Một cú click sai. Một bản sao dữ liệu chưa thử khôi phục. Một quyết định
        chậm. Và thế là cả công ty có một ngày thứ Hai rất dài.
      </p>
      <p className="text-sm md:text-lg text-muted-foreground max-w-3xl mx-auto">
        Bạn có 8 quyết định để cứu doanh nghiệp khỏi ransomware (virus khóa dữ liệu).
        Chọn đúng, công ty phục hồi. Chọn sai, virus khóa dữ liệu mở tour du lịch nội bộ.
      </p>
      <p className="mt-3 text-xs md:text-base text-neon-blue/90 max-w-3xl mx-auto">
        Ransomware là virus khóa dữ liệu và đòi tiền chuộc. Trong game này, bạn sẽ
        chọn cách xử lý để cứu dữ liệu, công việc và niềm tin khách hàng.
      </p>
    </motion.div>
  );
}
