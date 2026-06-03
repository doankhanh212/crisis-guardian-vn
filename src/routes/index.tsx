import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Landing } from "@/game/Landing";
import { GameRoom } from "@/game/GameRoom";
import type { GameMode } from "@/game/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ransomware Crisis Room — Mô phỏng khủng hoảng virus khóa dữ liệu" },
      {
        name: "description",
        content:
          "Trò chơi mô phỏng khủng hoảng ransomware (virus khóa dữ liệu) dành cho nhân viên, sinh viên, quản lý và lãnh đạo. 8 quyết định để cứu dữ liệu, công việc và niềm tin khách hàng.",
      },
      { property: "og:title", content: "Ransomware Crisis Room" },
      {
        property: "og:description",
        content:
          "Bạn có cứu được doanh nghiệp khỏi ransomware (virus khóa dữ liệu) không? Trò chơi mô phỏng an toàn, dễ hiểu cho sự kiện nâng cao nhận thức.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [mode, setMode] = useState<GameMode | null>(null);
  const [team, setTeam] = useState("");

  if (!mode) {
    return (
      <Landing
        onStart={(m, t) => {
          setMode(m);
          setTeam(t);
        }}
      />
    );
  }
  return (
    <GameRoom
      mode={mode}
      teamName={team}
      onExit={() => setMode(null)}
    />
  );
}
