import { type FormEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Phone, Sparkles, UserRound } from "lucide-react";

interface ParticipantFormProps {
  playerName: string;
  company: string;
  phone: string;
  canContinue: boolean;
  onPlayerNameChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function ParticipantForm({
  playerName,
  company,
  phone,
  canContinue,
  onPlayerNameChange,
  onCompanyChange,
  onPhoneChange,
  onSubmit,
}: ParticipantFormProps) {
  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-5 md:p-6 max-w-3xl mx-auto"
    >
      <div className="grid gap-4">
        <Field
          icon={<UserRound size={18} />}
          label="Họ tên người chơi"
          value={playerName}
          onChange={onPlayerNameChange}
          placeholder=""
          required
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            icon={<Building2 size={18} />}
            label="Công ty / đơn vị"
            value={company}
            onChange={onCompanyChange}
            placeholder=""
          />
          <Field
            icon={<Phone size={18} />}
            label="Số điện thoại"
            value={phone}
            onChange={onPhoneChange}
            placeholder=""
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          type="submit"
          disabled={!canContinue}
          className="gradient-neon text-primary-foreground font-display uppercase tracking-widest px-8 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-neon hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 w-full sm:w-auto min-w-[220px]"
        >
          Tiếp tục <ArrowRight size={18} />
        </button>
        <div className="text-xs uppercase tracking-widest text-muted-foreground text-center">
          3 câu khởi động · 8 quyết định · Có điểm, badge và quà
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          "Né email lừa đảo",
          "Giữ bản sao dữ liệu sống sót",
          "Cứu niềm tin khách hàng",
        ].map((chip) => (
          <div
            key={chip}
            className="glass rounded-xl px-3 py-3 text-center text-sm text-foreground/88"
          >
            <Sparkles size={14} className="inline text-neon-amber mr-1" />
            {chip}
          </div>
        ))}
      </div>
    </motion.form>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="glass rounded-2xl p-4 flex items-start gap-3">
      <span className="mt-1 text-neon-blue">{icon}</span>
      <span className="flex-1">
        <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
          {required && <span className="text-neon-red"> *</span>}
        </span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className="mt-1 block w-full bg-transparent border-none outline-none text-base md:text-lg text-foreground placeholder:text-muted-foreground/50"
        />
      </span>
    </label>
  );
}
