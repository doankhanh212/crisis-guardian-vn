import { Lock } from "lucide-react";

export function SafetyNote() {
  return (
    <div className="mt-7 flex flex-wrap items-center justify-center gap-4 text-[10px] uppercase tracking-widest text-muted-foreground">
      <span className="flex items-center gap-1">
        <Lock size={11} /> Đây là mô phỏng giáo dục an toàn, không chứa mã độc hay
        hướng dẫn tấn công.
      </span>
    </div>
  );
}
