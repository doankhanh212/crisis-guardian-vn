import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Saves participant info entered on the landing form into an Excel file.
// The .handler body runs server-only, so node:fs / node:path and the xlsx
// library are tree-shaken from the client bundle.
//
// Each submission is appended as a new row to data/participants.xlsx
// (relative to the server working directory). The file is created on the
// first submission. NOTE: this writes to the local filesystem, so it works
// on Node-based hosting and in dev, but not on edge runtimes like
// Cloudflare Workers.

const participantSchema = z.object({
  playerName: z.string().trim().min(1, "Tên người chơi là bắt buộc"),
  company: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
});

interface ParticipantRow {
  "Họ tên": string;
  "Công ty": string;
  "Số điện thoại": string;
  "Thời gian": string;
}

export const saveParticipant = createServerFn({ method: "POST" })
  .inputValidator(participantSchema)
  .handler(async ({ data }) => {
    const { promises: fs } = await import("node:fs");
    const path = await import("node:path");
    const XLSX = await import("xlsx");

    const dir = path.resolve(process.cwd(), "data");
    const filePath = path.join(dir, "participants.xlsx");
    const sheetName = "NguoiThamGia";

    await fs.mkdir(dir, { recursive: true });

    // Load existing rows (if the file already exists) so we append instead
    // of overwriting previous submissions.
    let rows: ParticipantRow[] = [];
    try {
      const existing = await fs.readFile(filePath);
      const wb = XLSX.read(existing, { type: "buffer" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      if (ws) {
        rows = XLSX.utils.sheet_to_json<ParticipantRow>(ws);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }

    rows.push({
      "Họ tên": data.playerName,
      "Công ty": data.company,
      "Số điện thoại": data.phone,
      "Thời gian": new Date().toLocaleString("vi-VN"),
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [{ wch: 24 }, { wch: 24 }, { wch: 16 }, { wch: 22 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    await fs.writeFile(filePath, buffer);

    return { saved: true, total: rows.length };
  });
