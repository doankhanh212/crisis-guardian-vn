import {
  Cloud,
  Coffee,
  Database,
  Disc3,
  Server,
  ShieldCheck,
  Shirt,
  Sparkles,
  Trophy,
  Utensils,
} from "lucide-react";
import type { QuizQuestion } from "@/game/landing/types";

export const FEEDBACK_MS = 7000;

export const HQG_QUIZ: QuizQuestion[] = [
  {
    title: "HQG hiện tại đang kinh doanh gì?",
    correct: "C",
    correctFeedback:
      "Chuẩn! HQG không bán cơm sườn, HQG xây giải pháp công nghệ cho doanh nghiệp.",
    wrongFeedback:
      "Nghe cũng hấp dẫn, nhưng chưa đúng. HQG làm giải pháp công nghệ, hạ tầng CNTT, cloud, bảo mật và dịch vụ kỹ thuật.",
    options: [
      { key: "A", text: "Bán cơm sườn văn phòng", icon: <Utensils size={22} /> },
      { key: "B", text: "Bán quần áo công sở", icon: <Shirt size={22} /> },
      {
        key: "C",
        text: "Giải pháp công nghệ, hạ tầng CNTT, cloud và bảo mật",
        icon: <Cloud size={22} />,
      },
      { key: "D", text: "Mở lớp dạy nhảy TikTok ", icon: <Disc3 size={22} /> },
    ],
  },
  {
    title: "Nếu doanh nghiệp bị mất dữ liệu hoặc hệ thống ngưng chạy, HQG có thể hỗ trợ mảng nào?",
    correct: "A",
    correctFeedback:
      "Đúng rồi! Dữ liệu không tự sống lại, cần có sao lưu, phục hồi và kế hoạch bảo vệ dữ liệu.",
    wrongFeedback:
      "Ý tưởng vui đó, nhưng khi hệ thống gặp sự cố, doanh nghiệp cần sao lưu, phục hồi và đội kỹ thuật xử lý thật.",
    options: [
      { key: "A", text: "Sao lưu, phục hồi dữ liệu và bảo vệ hệ thống", icon: <Database size={22} /> },
      { key: "B", text: "Pha cà phê động viên phòng IT", icon: <Coffee size={22} /> },
      { key: "C", text: "Chọn nhạc nền cho server ngủ ngon", icon: <Disc3 size={22} /> },
      { key: "D", text: "Bán decal 'Đừng click linh tinh'", icon: <ShieldCheck size={22} /> },
    ],
  },
  {
    title: "HQG đã hoạt động trong lĩnh vực công nghệ khoảng bao lâu?",
    correct: "B",
    correctFeedback: "Chính xác! HQG đã có hơn 15 năm đồng hành trong lĩnh vực công nghệ.",
    wrongFeedback:
      "Gần đúng về độ drama, nhưng đáp án thật là hơn 15 năm phát triển và đồng hành cùng doanh nghiệp.",
    options: [
      { key: "A", text: "Mới mở hôm qua", icon: <Sparkles size={22} /> },
      { key: "B", text: "Hơn 15 năm", icon: <Trophy size={22} /> },
      { key: "C", text: "Thời kỳ đồ đá", icon: <Server size={22} /> },
      { key: "D", text: "Đang bán cơm sườn , mai mở", icon: <Cloud size={22} /> },
    ],
  },
];
