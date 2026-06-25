import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Lưu thông tin người chơi vào Google Sheet (Google Drive) thông qua một
// Google Apps Script Web App. Server function chỉ gửi 1 request POST nên
// chạy được cả khi dev lẫn trên Vercel/serverless (không cần ghi ổ đĩa).
//
// Cấu hình: đặt URL của web app vào biến môi trường SHEETS_WEBAPP_URL
//   - Local: thêm dòng SHEETS_WEBAPP_URL=... vào file .env
//   - Vercel: Project Settings → Environment Variables
// Mã Apps Script và hướng dẫn deploy nằm ở scripts/google-apps-script.gs

const participantSchema = z.object({
  playerName: z.string().trim().min(1, "Tên người chơi là bắt buộc"),
  company: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
});

export const saveParticipant = createServerFn({ method: "POST" })
  .inputValidator(participantSchema)
  .handler(async ({ data }) => {
    const webAppUrl = process.env.SHEETS_WEBAPP_URL;
    if (!webAppUrl) {
      console.warn(
        "SHEETS_WEBAPP_URL chưa được cấu hình — bỏ qua việc lưu vào Google Sheet."
      );
      return { saved: false as const, reason: "not-configured" as const };
    }

    const payload = {
      playerName: data.playerName,
      company: data.company,
      phone: data.phone,
      timestamp: new Date().toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      }),
    };

    // Apps Script web app trả về 302 chuyển hướng sang googleusercontent để
    // lấy nội dung phản hồi — fetch tự follow redirect nên vẫn nhận được kết quả.
    const response = await fetch(webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Google Sheet trả về HTTP ${response.status}`);
    }

    return { saved: true as const };
  });
