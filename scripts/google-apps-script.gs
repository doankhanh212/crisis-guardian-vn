/**
 * Google Apps Script — nhận dữ liệu người chơi và ghi vào Google Sheet.
 *
 * Cách cài đặt (làm 1 lần):
 * 1. Mở Google Sheet của bạn:
 *    https://docs.google.com/spreadsheets/d/12-pxLt0eM3IqTJHFOJ3hBMIBZ7A_gZbC_bN0rm0jd6w/edit
 * 2. Menu: Extensions (Tiện ích mở rộng) → Apps Script.
 * 3. Xóa hết code mẫu, dán toàn bộ nội dung file này vào.
 * 4. Bấm Save (biểu tượng đĩa).
 * 5. Bấm Deploy (Triển khai) → New deployment (Triển khai mới).
 *    - Select type → Web app.
 *    - Execute as (Thực thi với tư cách): Me (chính bạn).
 *    - Who has access (Ai có quyền truy cập): Anyone (Bất kỳ ai).
 *    - Bấm Deploy, cấp quyền (Authorize) nếu được hỏi.
 * 6. Copy "Web app URL" có dạng:
 *    https://script.google.com/macros/s/XXXXXXXX/exec
 * 7. Dán URL đó vào biến môi trường SHEETS_WEBAPP_URL (xem hướng dẫn trong chat).
 *
 * Lưu ý: mỗi lần sửa code phải Deploy → Manage deployments → Edit → New version
 * thì URL mới có hiệu lực (URL /exec giữ nguyên).
 */

var SHEET_NAME = "NguoiThamGia";
var HEADERS = ["Họ tên", "Công ty", "Số điện thoại", "Thời gian"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // tránh ghi đè khi nhiều người nộp cùng lúc
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      data.playerName || "",
      data.company || "",
      data.phone || "",
      data.timestamp || new Date().toLocaleString(),
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Cho phép mở URL bằng trình duyệt để kiểm tra nhanh (không bắt buộc).
function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, message: "Endpoint hoạt động. Hãy gửi POST." })
  ).setMimeType(ContentService.MimeType.JSON);
}
