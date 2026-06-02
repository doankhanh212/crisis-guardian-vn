import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Landing } from "@/game/Landing";
import { GameRoom } from "@/game/GameRoom";
import type { GameMode } from "@/game/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ransomware Crisis Room — Mô phỏng khủng hoảng an ninh mạng" },
      {
        name: "description",
        content:
          "Trò chơi mô phỏng khủng hoảng ransomware dành cho nhân viên, quản lý và lãnh đạo. 8 vòng quyết định an toàn, giáo dục và đầy kịch tính.",
      },
      { property: "og:title", content: "Ransomware Crisis Room" },
      {
        property: "og:description",
        content:
          "Bạn có cứu được doanh nghiệp khỏi ransomware không? Trò chơi mô phỏng an toàn dành cho sự kiện đào tạo an ninh mạng.",
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
