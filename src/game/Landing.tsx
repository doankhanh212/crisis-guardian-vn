import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Play,
  Users2,
  Bug,
  Radio,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { GameMode } from "@/game/data";

interface Props {
  onStart: (mode: GameMode, teamName: string) => void;
}

export function Landing({ onStart }: Props) {
  const [team, setTeam] = useState("");

  const modes: { key: GameMode; label: string; desc: string; icon: React.ReactNode; tone: string }[] = [
    {
      key: "default",
      label: "Bắt đầu chơi",
      desc: "Chế độ tiêu chuẩn cho người mới",
      icon: <Play size={22} />,
      tone: "gradient-neon",
    },
    {
      key: "leader",
      label: "Chế độ lãnh đạo",
      desc: "Quyết định kinh doanh & ứng cứu sự cố",
      icon: <Users2 size={22} />,
      tone: "gradient-safe",
    },
    {
      key: "employee",
      label: "Chế độ nhân viên",
      desc: "Phishing, báo cáo & xử lý nghi ngờ",
      icon: <Bug size={22} />,
      tone: "bg-[oklch(0.7_0.22_295)]",
    },
    {
      key: "stage",
      label: "Chế độ sân khấu",
      desc: "Layout lớn cho MC & sự kiện trực tiếp",
      icon: <Radio size={22} />,
      tone: "gradient-danger",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* ambient glows */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[oklch(0.5_0.25_25/0.15)] blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[oklch(0.6_0.2_230/0.18)] blur-3xl" />

      <div className="relative w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-5">
            <span className="h-2 w-2 rounded-full bg-neon-red animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Live Simulation · Mô phỏng an toàn
            </span>
          </div>

          <motion.h1
            initial={{ scale: 0.94 }}
            animate={{ scale: 1 }}
            className="font-display text-4xl md:text-7xl text-glow-blue leading-[1.05] mb-4"
          >
            RANSOMWARE
            <br />
            <span className="bg-gradient-to-r from-[oklch(0.7_0.25_25)] via-[oklch(0.85_0.18_50)] to-[oklch(0.78_0.18_230)] bg-clip-text text-transparent">
              CRISIS ROOM
            </span>
          </motion.h1>

          <p className="text-lg md:text-2xl text-foreground/85 mb-3 max-w-2xl mx-auto">
            Bạn có cứu được doanh nghiệp khỏi ransomware không?
          </p>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Trò chơi mô phỏng khủng hoảng ransomware dành cho nhân viên, quản lý
            và lãnh đạo. 8 vòng quyết định · Mã hóa, backup, truyền thông & phục
            hồi.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-strong rounded-2xl p-5 mb-5 flex flex-col md:flex-row items-stretch md:items-center gap-3"
        >
          <div className="flex items-center gap-3 flex-1">
            <ShieldAlert className="text-neon-amber" />
            <div className="flex-1">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Tên đội / Người chơi
              </label>
              <input
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder="Ví dụ: Đội Phòng Thủ Alpha"
                className="block w-full bg-transparent border-none outline-none text-lg md:text-xl font-display text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
          <div className="text-xs text-muted-foreground md:max-w-[240px]">
            <Sparkles size={12} className="inline text-neon-amber mr-1" />
            Mẹo: nhập tên đội để xuất hiện trên báo cáo & badge cuối cùng.
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
          {modes.map((m, i) => (
            <motion.button
              key={m.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStart(m.key, team.trim())}
              className="group relative glass-strong rounded-2xl p-5 text-left overflow-hidden hover:shadow-neon transition border border-[oklch(0.6_0.1_230/0.2)]"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 ${m.tone} opacity-80`} />
              <div className="flex items-center gap-3 mb-2">
                <div className={`h-11 w-11 rounded-xl ${m.tone} flex items-center justify-center text-primary-foreground shadow-neon`}>
                  {m.icon}
                </div>
                <div className="font-display text-lg md:text-xl">{m.label}</div>
                <ArrowRight
                  size={18}
                  className="ml-auto text-muted-foreground group-hover:text-neon-blue group-hover:translate-x-1 transition"
                />
              </div>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
            </motion.button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="flex items-center gap-1">
            <Lock size={11} /> Mock data · không chứa mã độc thật
          </span>
          <span>·</span>
          <span>Suitable for live events · 100% educational</span>
        </div>
      </div>
    </div>
  );
}
