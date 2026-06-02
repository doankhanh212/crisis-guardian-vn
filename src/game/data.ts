export type NodeId =
  | "email"
  | "employee"
  | "finance"
  | "fileserver"
  | "backup"
  | "soc"
  | "ops"
  | "customers";

export type NodeStatus =
  | "safe"
  | "suspicious"
  | "infected"
  | "isolated"
  | "down"
  | "recovered";

export interface NodeState {
  id: NodeId;
  label: string;
  icon: string;
  x: number;
  y: number;
  status: NodeStatus;
}

export interface Metrics {
  businessImpact: number;
  encryptedData: number;
  downtimeHours: number;
  customerTrust: number;
  reputationDamage: number;
  backupHealth: number;
  recoveryReadiness: number;
  defenderScore: number;
}

export const INITIAL_METRICS: Metrics = {
  businessImpact: 0,
  encryptedData: 0,
  downtimeHours: 0,
  customerTrust: 100,
  reputationDamage: 0,
  backupHealth: 100,
  recoveryReadiness: 50,
  defenderScore: 0,
};

export const INITIAL_NODES: NodeState[] = [
  { id: "email", label: "Email Gateway", icon: "Mail", x: 10, y: 18, status: "safe" },
  { id: "employee", label: "Máy Nhân Viên", icon: "Monitor", x: 32, y: 8, status: "safe" },
  { id: "finance", label: "Máy Kế Toán", icon: "Wallet", x: 58, y: 8, status: "safe" },
  { id: "fileserver", label: "File Server", icon: "Server", x: 78, y: 28, status: "safe" },
  { id: "backup", label: "Backup Server", icon: "HardDriveDownload", x: 86, y: 62, status: "safe" },
  { id: "soc", label: "IT / SOC", icon: "ShieldCheck", x: 12, y: 62, status: "safe" },
  { id: "ops", label: "Vận Hành KD", icon: "Building2", x: 36, y: 82, status: "safe" },
  { id: "customers", label: "Khách Hàng", icon: "Users", x: 64, y: 82, status: "safe" },
];

export const CONNECTIONS: [NodeId, NodeId][] = [
  ["email", "employee"],
  ["email", "finance"],
  ["employee", "fileserver"],
  ["finance", "fileserver"],
  ["fileserver", "backup"],
  ["fileserver", "ops"],
  ["ops", "customers"],
  ["soc", "employee"],
  ["soc", "fileserver"],
  ["soc", "backup"],
];

export interface MetricChange {
  businessImpact?: number;
  encryptedData?: number;
  downtimeHours?: number;
  customerTrust?: number;
  reputationDamage?: number;
  backupHealth?: number;
  recoveryReadiness?: number;
  defenderScore?: number;
}

export interface DecisionOption {
  key: "A" | "B" | "C" | "D";
  text: string;
  good: boolean;
}

export interface Round {
  index: number;
  title: string;
  time: string;
  stage: string;
  riskLevel: "Thấp" | "Trung bình" | "Cao" | "Nghiêm trọng";
  scenario: string;
  options: DecisionOption[];
  bestAnswer: "A" | "B" | "C" | "D";
  goodConsequence: string;
  riskyConsequence: string;
  lesson: string;
  goodChanges: MetricChange;
  riskyChanges: MetricChange;
  goodNodes: Partial<Record<NodeId, NodeStatus>>;
  riskyNodes: Partial<Record<NodeId, NodeStatus>>;
  spreadFrom?: NodeId;
  spreadTo?: NodeId[];
}

export const ROUNDS: Round[] = [
  {
    index: 1,
    title: "Email hóa đơn khẩn cấp",
    time: "08:30",
    stage: "Email",
    riskLevel: "Trung bình",
    scenario:
      "Nhân viên kế toán nhận email có tiêu đề 'Hóa đơn quá hạn - cần xử lý ngay'. File đính kèm là invoice.pdf.exe. Bạn sẽ làm gì?",
    options: [
      { key: "A", text: "Mở file để kiểm tra nhanh", good: false },
      { key: "B", text: "Chuyển tiếp cho đồng nghiệp", good: false },
      { key: "C", text: "Báo IT/Security kiểm tra", good: true },
      { key: "D", text: "Tải file lên cloud cá nhân", good: false },
    ],
    bestAnswer: "C",
    goodConsequence:
      "Email đáng ngờ được báo cáo kịp thời. IT/Security kiểm tra và chặn các email tương tự.",
    riskyConsequence:
      "Mã độc được kích hoạt trên máy nhân viên. Cuộc tấn công bắt đầu.",
    lesson:
      "Ransomware thường bắt đầu từ email phishing. Khi nghi ngờ, hãy báo đúng bộ phận.",
    goodChanges: { defenderScore: 15, recoveryReadiness: 5 },
    riskyChanges: { businessImpact: 10, encryptedData: 5, customerTrust: -5 },
    goodNodes: { email: "safe", soc: "safe" },
    riskyNodes: { employee: "infected", email: "suspicious" },
    spreadFrom: "email",
    spreadTo: ["employee"],
  },
  {
    index: 2,
    title: "Máy tính có dấu hiệu lạ",
    time: "09:00",
    stage: "Infection",
    riskLevel: "Cao",
    scenario:
      "Máy nhân viên chạy chậm bất thường, xuất hiện cảnh báo lạ và nhiều file bắt đầu đổi tên.",
    options: [
      { key: "A", text: "Tiếp tục làm việc", good: false },
      { key: "B", text: "Rút mạng / tắt Wi-Fi và báo IT", good: true },
      { key: "C", text: "Cắm USB backup vào để copy dữ liệu", good: false },
      { key: "D", text: "Tải phần mềm lạ trên mạng để sửa", good: false },
    ],
    bestAnswer: "B",
    goodConsequence:
      "Máy nghi nhiễm được cô lập sớm. Ransomware bị hạn chế lan rộng.",
    riskyConsequence:
      "Ransomware tiếp tục chạy và có nguy cơ lan sang hệ thống khác.",
    lesson: "Cô lập sớm giúp ngăn ransomware lan sang hệ thống khác.",
    goodChanges: { defenderScore: 15, recoveryReadiness: 10, businessImpact: -5 },
    riskyChanges: {
      businessImpact: 15,
      encryptedData: 10,
      downtimeHours: 1,
      customerTrust: -5,
    },
    goodNodes: { employee: "isolated", soc: "safe" },
    riskyNodes: { employee: "infected", finance: "suspicious" },
    spreadFrom: "employee",
    spreadTo: ["finance"],
  },
  {
    index: 3,
    title: "Ransomware lan sang File Server",
    time: "09:20",
    stage: "Spread",
    riskLevel: "Nghiêm trọng",
    scenario:
      "File server xuất hiện nhiều file bị đổi đuôi .locked. Một số phòng ban không mở được dữ liệu.",
    options: [
      { key: "A", text: "Tắt toàn bộ hệ thống không cần kiểm tra", good: false },
      { key: "B", text: "Cô lập máy nghi nhiễm và xác định phạm vi", good: true },
      { key: "C", text: "Chờ thêm để xem có tự hết không", good: false },
      { key: "D", text: "Chia sẻ tài khoản admin cho mọi người xử lý", good: false },
    ],
    bestAnswer: "B",
    goodConsequence:
      "Đội xử lý sự cố khoanh vùng được phạm vi ảnh hưởng và ngăn lây lan thêm.",
    riskyConsequence:
      "Việc xử lý chậm hoặc sai cách khiến file server bị ảnh hưởng nặng hơn.",
    lesson: "Ứng cứu sự cố cần bình tĩnh: xác định, cô lập, xử lý và khôi phục.",
    goodChanges: { defenderScore: 15, recoveryReadiness: 10, downtimeHours: 1 },
    riskyChanges: {
      businessImpact: 20,
      encryptedData: 20,
      downtimeHours: 3,
      customerTrust: -10,
    },
    goodNodes: { fileserver: "isolated", soc: "safe" },
    riskyNodes: { fileserver: "infected", ops: "suspicious" },
    spreadFrom: "fileserver",
    spreadTo: ["ops", "backup"],
  },
  {
    index: 4,
    title: "Backup có nguy cơ bị mã hóa",
    time: "09:45",
    stage: "Backup Risk",
    riskLevel: "Nghiêm trọng",
    scenario:
      "Backup server vẫn đang kết nối với hệ thống chính. Nếu ransomware lan tới đây, khả năng khôi phục sẽ giảm mạnh.",
    options: [
      { key: "A", text: "Kiểm tra và bảo vệ backup ngay", good: true },
      { key: "B", text: "Bỏ qua vì backup luôn an toàn", good: false },
      { key: "C", text: "Xóa backup cũ cho nhẹ hệ thống", good: false },
      { key: "D", text: "Cho tất cả nhân viên truy cập backup", good: false },
    ],
    bestAnswer: "A",
    goodConsequence:
      "Backup được kiểm tra, bảo vệ và tách khỏi vùng nguy hiểm.",
    riskyConsequence:
      "Backup có nguy cơ bị mã hóa hoặc bị xóa, làm giảm khả năng phục hồi.",
    lesson:
      "Backup phải tách biệt, có versioning/offline và phải được kiểm tra khôi phục định kỳ.",
    goodChanges: { defenderScore: 20, recoveryReadiness: 15 },
    riskyChanges: { backupHealth: -35, businessImpact: 20, recoveryReadiness: -20 },
    goodNodes: { backup: "safe" },
    riskyNodes: { backup: "suspicious" },
    spreadFrom: "fileserver",
    spreadTo: ["backup"],
  },
  {
    index: 5,
    title: "Hacker yêu cầu tiền chuộc",
    time: "10:00",
    stage: "Leadership",
    riskLevel: "Nghiêm trọng",
    scenario:
      "Hacker yêu cầu thanh toán để lấy khóa giải mã. Hệ thống bán hàng đang bị gián đoạn. Lãnh đạo cần quyết định bước tiếp theo.",
    options: [
      { key: "A", text: "Trả tiền ngay", good: false },
      {
        key: "B",
        text: "Kích hoạt quy trình ứng cứu & kiểm tra backup",
        good: true,
      },
      { key: "C", text: "Im lặng, không báo ai", good: false },
      { key: "D", text: "Để nhân viên tự xử lý", good: false },
    ],
    bestAnswer: "B",
    goodConsequence:
      "Doanh nghiệp kích hoạt quy trình ứng cứu, kiểm tra backup và phối hợp truyền thông có kiểm soát.",
    riskyConsequence:
      "Quyết định sai làm tăng thời gian gián đoạn, rủi ro uy tín và thiệt hại kinh doanh.",
    lesson:
      "Trả tiền không đảm bảo lấy lại dữ liệu. Quy trình ứng cứu và backup mới là nền tảng phục hồi.",
    goodChanges: { defenderScore: 20, recoveryReadiness: 15, customerTrust: -5 },
    riskyChanges: {
      businessImpact: 25,
      downtimeHours: 4,
      reputationDamage: 20,
      customerTrust: -20,
    },
    goodNodes: { soc: "safe", ops: "suspicious" },
    riskyNodes: { ops: "down", customers: "suspicious" },
  },
  {
    index: 6,
    title: "Khách hàng bắt đầu phàn nàn",
    time: "10:30",
    stage: "Communication",
    riskLevel: "Cao",
    scenario:
      "Một số dịch vụ bị gián đoạn. Khách hàng gọi điện hỏi chuyện gì đang xảy ra.",
    options: [
      { key: "A", text: "Không phản hồi gì", good: false },
      { key: "B", text: "Đổ lỗi cho nhân viên", good: false },
      {
        key: "C",
        text: "Thông báo minh bạch, ngắn gọn, có kiểm soát",
        good: true,
      },
      { key: "D", text: "Đăng thông tin chưa xác minh lên mạng xã hội", good: false },
    ],
    bestAnswer: "C",
    goodConsequence:
      "Thông tin được truyền đạt minh bạch và có kiểm soát, giúp giảm thiệt hại uy tín.",
    riskyConsequence:
      "Truyền thông kém khiến khách hàng mất niềm tin và khủng hoảng lan rộng.",
    lesson:
      "Truyền thông khủng hoảng là một phần quan trọng trong ứng cứu ransomware.",
    goodChanges: { defenderScore: 10, customerTrust: 5, reputationDamage: -5 },
    riskyChanges: { customerTrust: -20, reputationDamage: 20, businessImpact: 10 },
    goodNodes: { customers: "suspicious" },
    riskyNodes: { customers: "down", ops: "down" },
  },
  {
    index: 7,
    title: "Khôi phục hệ thống",
    time: "11:30",
    stage: "Recovery",
    riskLevel: "Cao",
    scenario:
      "Đội IT tìm thấy bản backup sạch trước thời điểm nhiễm. Cần quyết định bước tiếp theo.",
    options: [
      { key: "A", text: "Khôi phục ngay lên hệ thống chưa làm sạch", good: false },
      {
        key: "B",
        text: "Làm sạch môi trường, xác minh backup, khôi phục có kiểm soát",
        good: true,
      },
      { key: "C", text: "Bỏ backup và tạo dữ liệu mới", good: false },
      { key: "D", text: "Cho người dùng tự tải file về", good: false },
    ],
    bestAnswer: "B",
    goodConsequence:
      "Môi trường được làm sạch, backup được xác minh và hệ thống khôi phục an toàn hơn.",
    riskyConsequence:
      "Khôi phục sai cách có thể khiến ransomware quay lại hoặc dữ liệu tiếp tục bị ảnh hưởng.",
    lesson:
      "Khôi phục phải có kiểm soát. Nếu môi trường còn nhiễm, ransomware có thể quay lại.",
    goodChanges: {
      defenderScore: 20,
      encryptedData: -10,
      recoveryReadiness: 20,
      customerTrust: 10,
    },
    riskyChanges: {
      businessImpact: 20,
      downtimeHours: 3,
      encryptedData: 10,
      customerTrust: -10,
    },
    goodNodes: {
      backup: "recovered",
      fileserver: "recovered",
      ops: "recovered",
    },
    riskyNodes: { fileserver: "down", backup: "suspicious" },
  },
  {
    index: 8,
    title: "Bài học sau sự cố",
    time: "Ngày hôm sau",
    stage: "Lessons Learned",
    riskLevel: "Thấp",
    scenario:
      "Doanh nghiệp đã hoạt động trở lại. Lãnh đạo cần chọn ưu tiên đầu tư để giảm rủi ro lần sau.",
    options: [
      {
        key: "A",
        text: "Đào tạo nhân viên, MFA, backup an toàn, EDR & quy trình ứng cứu",
        good: true,
      },
      { key: "B", text: "Chỉ mua thêm máy tính mới", good: false },
      { key: "C", text: "Chỉ đổi mật khẩu một lần", good: false },
      { key: "D", text: "Không làm gì vì sự cố đã qua", good: false },
    ],
    bestAnswer: "A",
    goodConsequence:
      "Doanh nghiệp xây dựng chiến lược phòng thủ nhiều lớp, giảm rủi ro ransomware trong tương lai.",
    riskyConsequence:
      "Không rút kinh nghiệm khiến doanh nghiệp có nguy cơ bị tấn công lại.",
    lesson: "Phòng chống ransomware cần kết hợp con người, quy trình và công nghệ.",
    goodChanges: { defenderScore: 25, recoveryReadiness: 20, customerTrust: 10 },
    riskyChanges: {
      reputationDamage: 10,
      businessImpact: 10,
      recoveryReadiness: -10,
    },
    goodNodes: {
      email: "safe",
      employee: "safe",
      finance: "safe",
      fileserver: "recovered",
      backup: "recovered",
      soc: "safe",
      ops: "recovered",
      customers: "safe",
    },
    riskyNodes: { ops: "suspicious", customers: "suspicious" },
  },
];

export const TIMELINE_STAGES = [
  "Email",
  "Click",
  "Infection",
  "Spread",
  "Encryption",
  "Response",
  "Recovery",
  "Lessons Learned",
];

export const FINAL_LESSONS = [
  "Không click link hoặc file lạ.",
  "Báo IT/Security ngay khi nghi ngờ.",
  "Bật MFA để giảm nguy cơ bị chiếm tài khoản.",
  "Backup phải tách biệt, có versioning/offline và được kiểm tra khôi phục.",
  "Ransomware là rủi ro kinh doanh, không chỉ là sự cố kỹ thuật.",
];

export type GameMode = "employee" | "leader" | "stage" | "default";

export interface GradeResult {
  grade: string;
  message: string;
  tone: "excellent" | "good" | "warn" | "fail";
  badge: string;
}

export function gradeFinal(m: Metrics): GradeResult {
  if (m.encryptedData >= 70 || m.backupHealth <= 30) {
    return {
      grade: "Business Critical Failure",
      message:
        "Doanh nghiệp bị ảnh hưởng nghiêm trọng. Backup yếu, xử lý chậm hoặc quyết định sai làm thiệt hại tăng cao.",
      tone: "fail",
      badge: "Needs Improvement",
    };
  }
  if (m.defenderScore >= 120 && m.encryptedData <= 20 && m.backupHealth >= 70) {
    return {
      grade: "Excellent Defender",
      message:
        "Bạn đã kiểm soát khủng hoảng rất tốt. Doanh nghiệp phục hồi nhanh và giảm thiểu thiệt hại.",
      tone: "excellent",
      badge: "Excellent Defender",
    };
  }
  if (m.defenderScore >= 90 && m.encryptedData <= 40) {
    return {
      grade: "Good Recovery",
      message: "Bạn xử lý khá tốt, nhưng vẫn còn một số điểm cần cải thiện.",
      tone: "good",
      badge: m.backupHealth >= 80 ? "Backup Hero" : "Crisis Leader",
    };
  }
  if (m.defenderScore >= 60) {
    return {
      grade: "Needs Improvement",
      message:
        "Doanh nghiệp sống sót, nhưng thiệt hại còn cao. Cần cải thiện backup, quy trình và đào tạo.",
      tone: "warn",
      badge: "Phishing Hunter",
    };
  }
  return {
    grade: "Business Critical Failure",
    message:
      "Doanh nghiệp bị ảnh hưởng nghiêm trọng. Cần đầu tư mạnh vào con người, quy trình và công nghệ.",
    tone: "fail",
    badge: "Needs Improvement",
  };
}
