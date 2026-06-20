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
  { id: "email", label: "Cổng email", icon: "Mail", x: 10, y: 18, status: "safe" },
  { id: "employee", label: "Máy nhân viên", icon: "Monitor", x: 32, y: 8, status: "safe" },
  { id: "finance", label: "Máy kế toán", icon: "Wallet", x: 58, y: 8, status: "safe" },
  { id: "fileserver", label: "Kho dữ liệu công ty", icon: "Server", x: 78, y: 28, status: "safe" },
  { id: "backup", label: "Kho dữ liệu cứu hộ", icon: "HardDriveDownload", x: 86, y: 62, status: "safe" },
  { id: "soc", label: "Đội cứu hộ kỹ thuật", icon: "ShieldCheck", x: 12, y: 62, status: "safe" },
  { id: "ops", label: "Hoạt động công ty", icon: "Building2", x: 36, y: 82, status: "safe" },
  { id: "customers", label: "Khách hàng", icon: "Users", x: 64, y: 82, status: "safe" },
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
  goodImpact: string;
  riskyImpact: string;
  mcNote?: string;
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
    title: "Email hóa đơn lạ",
    time: "08:30",
    stage: "Email",
    riskLevel: "Trung bình",
    scenario:
      "Máy kế toán nhận một email hóa đơn nghe rất khẩn cấp. File nhìn giống PDF nhưng lại kết thúc bằng .exe. Đây có thể là email lừa đảo dùng để thả virus khóa dữ liệu. Nếu xử lý sai, phòng kế toán sẽ có một buổi sáng rất dài.",
    options: [
      { key: "A", text: "Mở file ngay", good: false },
      { key: "B", text: "Chuyển tiếp cho đồng nghiệp", good: false },
      { key: "C", text: "Báo đội cứu hộ kỹ thuật", good: true },
      { key: "D", text: "Tải lên cloud cá nhân", good: false },
    ],
    bestAnswer: "C",
    goodConsequence:
      "Email đáng ngờ bị bắt quả tang trước khi kịp 'làm anh hùng' trong phòng kế toán.",
    riskyConsequence:
      "Nhân viên kế toán giờ đang nhìn màn hình đen mà tim đập nhanh hơn loading Windows XP.",
    lesson:
      "Email càng gấp rút, càng nên nghi ngờ. File .pdf.exe không phải PDF, nó là drama đội lốt hóa đơn.",
    goodImpact: "Bạn vừa cứu công ty khỏi một pha tự hủy cấp tốc!",
    riskyImpact: "Máy kế toán đã chính thức bay màu.",
    mcNote:
      "Nếu thấy file .pdf.exe mà vẫn mở, thì hôm nay chúng ta không chơi game nữa, chúng ta chơi cảm giác mạnh.",
    goodChanges: { defenderScore: 15, recoveryReadiness: 5 },
    riskyChanges: { businessImpact: 10, encryptedData: 5, customerTrust: -5 },
    goodNodes: { email: "safe", soc: "safe" },
    riskyNodes: { employee: "infected", email: "suspicious", finance: "suspicious" },
    spreadFrom: "email",
    spreadTo: ["employee", "finance"],
  },
  {
    index: 2,
    title: "Máy người dùng có dấu hiệu lạ",
    time: "09:00",
    stage: "Infection",
    riskLevel: "Cao",
    scenario:
      "Máy người dùng bỗng chạy chậm, quạt kêu to và một số file đổi tên thành .locked. Đây là dấu hiệu dữ liệu có thể đang bị virus khóa dữ liệu. Nếu xử lý sai, virus có thể đi dạo khắp công ty như đang tham quan văn phòng.",
    options: [
      { key: "A", text: "Tiếp tục làm việc", good: false },
      { key: "B", text: "Rút mạng và báo IT", good: true },
      { key: "C", text: "Cắm USB cứu dữ liệu", good: false },
      { key: "D", text: "Tải tool sửa lỗi miễn phí", good: false },
    ],
    bestAnswer: "B",
    goodConsequence:
      "Máy nghi nhiễm được cô lập nhanh như nhân viên nghe tiếng chuông tan tầm.",
    riskyConsequence:
      "Bạn chần chừ 5 giây. Virus đã kịp lang thang qua nửa công ty như đi cà phê vòng.",
    lesson:
      "Nghi nhiễm thì rút mạng và báo IT ngay. Đừng cắm USB hay tải tool 'fix miễn phí' kiểu Google bác sĩ.",
    goodImpact: "SOC vào trận, virus chạy không kịp chào tạm biệt!",
    riskyImpact: "Virus khóa dữ liệu vừa mở tour du lịch nội bộ.",
    mcNote:
      "Một quyết định đúng lúc có thể cứu hàng trăm giờ khôi phục.",
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
    title: "Kho dữ liệu công ty bị ảnh hưởng",
    time: "09:20",
    stage: "Spread",
    riskLevel: "Nghiêm trọng",
    scenario:
      "Kho dữ liệu công ty bắt đầu xuất hiện nhiều file bị khóa. Hợp đồng, báo cáo và kế hoạch vẫn nằm đó, nhưng nhân viên không mở được. Nếu không khoanh vùng nhanh, nhiều phòng ban sẽ đứng hình tập thể.",
    options: [
      { key: "A", text: "Tắt đại toàn bộ", good: false },
      { key: "B", text: "Cô lập và khoanh vùng", good: true },
      { key: "C", text: "Chờ thêm 30 phút xem có tự hết không", good: false },
      { key: "D", text: "Chia sẻ tài khoản admin", good: false },
    ],
    bestAnswer: "B",
    goodConsequence:
      "Virus bị chặn trước khi kịp biến kho dữ liệu công ty thành két sắt khóa trái toàn diện.",
    riskyConsequence:
      "Ai đó vừa đưa 'thẻ VIP' - tài khoản admin - cho hacker. Virus không cần hack, nó chỉ việc đi cửa chính.",
    lesson:
      "Xử lý sự cố cần bình tĩnh: xác định phạm vi, cô lập, điều tra, rồi mới khôi phục. Làm loạn chỉ giúp hacker vui hơn.",
    goodImpact: "Đội cứu hộ kỹ thuật khoanh vùng thành công.",
    riskyImpact: "File Server chính thức đổi nghề thành két sắt khóa trái.",
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
    title: "Bản sao dữ liệu cứu hộ",
    time: "09:45",
    stage: "Backup Risk",
    riskLevel: "Nghiêm trọng",
    scenario:
      "Kho dữ liệu cứu hộ vẫn đang nối với hệ thống chính. Mọi người nói: 'Không sao đâu, mình có bản sao dữ liệu mà.' Nhưng nếu virus khóa dữ liệu lan tới bản sao này, công ty có thể mất luôn phao cứu sinh cuối cùng.",
    options: [
      { key: "A", text: "Bảo vệ bản sao ngay", good: true },
      { key: "B", text: "Bỏ qua vì đã có bản sao", good: false },
      { key: "C", text: "Xóa bớt cho nhẹ", good: false },
      { key: "D", text: "Mở quyền cho mọi người", good: false },
    ],
    bestAnswer: "A",
    goodConsequence:
      "Bản sao dữ liệu cứu hộ còn sống. CEO chưa cần mở họp lúc 7 giờ sáng.",
    riskyConsequence:
      "Bản sao dữ liệu bị lây luôn. Giờ cả công ty chỉ còn cách cầu nguyện và dùng Excel.",
    lesson:
      "Bản sao dữ liệu phải tách biệt, có phiên bản dự phòng và phải được thử khôi phục định kỳ. Có bản sao nhưng chưa thử khôi phục thì vẫn chỉ là niềm tin có giao diện.",
    goodImpact: "Phao cứu sinh vẫn nổi! Phòng IT thở phào nhẹ nhõm.",
    riskyImpact: "Phao cứu sinh cuối cùng cũng... chìm.",
    mcNote:
      "Bản sao dữ liệu cứu hộ là phao cứu sinh. Nhưng phao để trong kho, chưa từng bơm thử, thì lúc chìm cũng hơi khó nói.",
    goodChanges: { defenderScore: 20, recoveryReadiness: 15 },
    riskyChanges: { backupHealth: -35, businessImpact: 20, recoveryReadiness: -20 },
    goodNodes: { backup: "safe" },
    riskyNodes: { backup: "suspicious" },
    spreadFrom: "fileserver",
    spreadTo: ["backup"],
  },
  {
    index: 5,
    title: "Quyết định lãnh đạo",
    time: "10:00",
    stage: "Leadership Decision",
    riskLevel: "Nghiêm trọng",
    scenario:
      "Kẻ xấu gửi thông báo đòi tiền để mở lại dữ liệu. Dịch vụ gián đoạn, khách hàng gọi liên tục, lãnh đạo cần ra quyết định. Đây không chỉ là chuyện kỹ thuật, mà là khủng hoảng công việc và niềm tin.",
    options: [
      { key: "A", text: "Trả tiền ngay", good: false },
      { key: "B", text: "Kích hoạt xử lý khủng hoảng", good: true },
      { key: "C", text: "Im lặng chờ qua chuyện", good: false },
      { key: "D", text: "Để nhân viên tự xử lý", good: false },
    ],
    bestAnswer: "B",
    goodConsequence:
      "Kích hoạt quy trình khủng hoảng. Mọi người vẫn căng nhưng chưa đến mức 'ai chịu trách nhiệm?'.",
    riskyConsequence:
      "Quyết định chậm làm tin đồn lan nhanh hơn virus. Phòng IT bắt đầu tắt thông báo Zalo.",
    lesson:
      "Trả tiền không đảm bảo lấy lại dữ liệu. Xử lý khủng hoảng, bản sao dữ liệu cứu hộ và quyết định nhanh mới giúp công ty có cơ hội phục hồi.",
    goodImpact: "CEO tạm thời chưa nổi điên.",
    riskyImpact: "Không khí công ty lạnh như điều hòa để 18 độ.",
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
    title: "Khách hàng bắt đầu hỏi",
    time: "10:30",
    stage: "Communication",
    riskLevel: "Cao",
    scenario:
      "Dịch vụ bị gián đoạn. Khách hàng bắt đầu nhắn: 'Sao tôi không đăng nhập được?', 'Bên bạn ổn không vậy?'. Nếu trả lời sai hoặc im lặng quá lâu, niềm tin khách hàng sẽ giảm nhanh hơn pin điện thoại ở hội chợ.",
    options: [
      { key: "A", text: "Không phản hồi", good: false },
      { key: "B", text: "Đổ lỗi chung chung", good: false },
      { key: "C", text: "Thông báo rõ ràng", good: true },
      { key: "D", text: "Đăng status cho vui", good: false },
    ],
    bestAnswer: "C",
    goodConsequence:
      "Thông tin được truyền đạt minh bạch và có kiểm soát. Khách hàng chưa vỗ tay, nhưng họ biết công ty đang xử lý nghiêm túc.",
    riskyConsequence:
      "Khủng hoảng truyền thông mở season 2. Virus không chỉ khóa dữ liệu, nó còn khóa luôn nụ cười của CSKH.",
    lesson:
      "Virus khóa dữ liệu (ransomware) không chỉ là sự cố kỹ thuật. Nó còn là khủng hoảng niềm tin, vận hành và truyền thông.",
    goodImpact: "Khách hàng chưa vui, nhưng vẫn còn niềm tin.",
    riskyImpact: "Tổng đài bắt đầu gọi IT liên tục.",
    goodChanges: { defenderScore: 10, customerTrust: 5, reputationDamage: -5 },
    riskyChanges: { customerTrust: -20, reputationDamage: 20, businessImpact: 10 },
    goodNodes: { customers: "suspicious" },
    riskyNodes: { customers: "down", ops: "down" },
  },
  {
    index: 7,
    title: "Khôi phục hoạt động",
    time: "11:30",
    stage: "Recovery",
    riskLevel: "Cao",
    scenario:
      "Đội cứu hộ kỹ thuật tìm thấy một bản sao dữ liệu sạch. Cả phòng vui như bắt được Wi-Fi mạnh ở sân bay. Nhưng nếu khôi phục lên hệ thống còn nhiễm, virus khóa dữ liệu có thể quay lại ngay.",
    options: [
      { key: "A", text: "Khôi phục ngay", good: false },
      { key: "B", text: "Làm sạch rồi khôi phục", good: true },
      { key: "C", text: "Gửi file cho từng người", good: false },
      { key: "D", text: "Nhập lại bằng Excel", good: false },
    ],
    bestAnswer: "B",
    goodConsequence:
      "Môi trường được làm sạch, bản sao dữ liệu được xác minh, kho dữ liệu công ty dần hoạt động lại. Phòng kế toán bắt đầu tin vào ngày mai.",
    riskyConsequence:
      "Khôi phục lên hệ thống còn nhiễm = virus quay lại chơi ván 2. Công ty vừa thở ra một cái đã phải nín thở tiếp.",
    lesson:
      "Khôi phục phải có kiểm soát. Nếu môi trường còn nhiễm, virus khóa dữ liệu có thể quay lại nhanh hơn lần đầu.",
    goodImpact: "File Server vừa hồi sinh đã muốn xin nghỉ phép lần nữa.",
    riskyImpact: "Đội cứu hộ kỹ thuật bắt đầu uống cà phê không đường.",
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
      "Công ty hoạt động lại. Lãnh đạo hỏi: 'Làm sao để chuyện này không lặp lại?' Đây là lúc chọn giữa an toàn thật và slide PowerPoint rất đẹp nhưng không ai làm.",
    options: [
      { key: "A", text: "Đào tạo, MFA, sao lưu, bảo vệ", good: true },
      { key: "B", text: "Đổi hình nền cảnh báo", good: false },
      { key: "C", text: "Đổi mật khẩu một lần", good: false },
      { key: "D", text: "Không làm gì nữa", good: false },
    ],
    bestAnswer: "A",
    goodConsequence:
      "Đào tạo, MFA, bản sao dữ liệu tốt và quy trình rõ ràng. Giờ hacker phải xếp hàng chờ như nhân viên chờ in tài liệu.",
    riskyConsequence:
      "Không rút kinh nghiệm = mời hacker quay lại ăn mừng sinh nhật công ty năm sau.",
    lesson:
      "Phòng chống virus khóa dữ liệu (ransomware) cần kết hợp con người, quy trình và công nghệ. Không có một món đồ thần kỳ cứu được tất cả.",
    goodImpact: "Công ty sống sót qua ngày thứ Hai.",
    riskyImpact: "Hacker lên kế hoạch gửi báo giá lần 2",
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
  "Đừng click link hoặc file lạ, đặc biệt là file có mùi 'gấp lắm chị ơi'.",
  "Nghi nhiễm virus khóa dữ liệu (ransomware) thì rút mạng, báo đội cứu hộ kỹ thuật (IT/SOC). Đừng tự làm bác sĩ Google.",
  "Bật xác minh nhiều lớp (MFA) để kẻ xấu có mật khẩu cũng chưa chắc vào được.",
  "Bản sao dữ liệu cứu hộ (Backup) phải tách biệt và phải khôi phục thử định kỳ.",
  "Virus khóa dữ liệu không chỉ khóa dữ liệu. Nó khóa luôn công việc, uy tín và niềm tin khách hàng.",
];

export const EVENT_MODE_NOTES = [
  "Trò chơi này không dạy hack. Trò chơi này dạy cách không biến mình thành người mở cửa mời kẻ xấu vào.",
  "Nếu thấy file .pdf.exe mà vẫn mở, thì hôm nay chúng ta không chơi game nữa, chúng ta chơi cảm giác mạnh.",
  "Bản sao dữ liệu cứu hộ là phao cứu sinh. Nhưng phao để trong kho, chưa từng bơm thử, thì lúc chìm cũng hơi khó nói.",
  "Một quyết định đúng lúc có thể cứu hàng trăm giờ khôi phục.",
];

export type GameMode = "employee" | "leader" | "stage" | "default";

export interface GradeResult {
  grade: string;
  message: string;
  tone: "excellent" | "good" | "warn" | "fail";
  badge: string;
  badgeDescription: string;
}

const HIGH_BADGES = [
  {
    badge: "Excellent Defender",
    badgeDescription: "Người đã cứu công ty trước khi CEO mở cuộc họp khẩn.",
  },
  {
    badge: "Backup Hero",
    badgeDescription: "Người hiểu rằng bản sao dữ liệu chưa thử khôi phục thì chỉ là niềm tin.",
  },
  {
    badge: "Crisis Leader",
    badgeDescription: "Bình tĩnh giữa bão virus khóa dữ liệu, không đổ lỗi lung tung.",
  },
  {
    badge: "Phishing Hunter",
    badgeDescription: "Nhìn thấy .pdf.exe là biết có mùi drama.",
  },
  {
    badge: "SOC Whisperer",
    badgeDescription: "Người nghe tiếng log và hiểu hệ thống đang kêu cứu.",
  },
];

const MEDIUM_BADGES = [
  {
    badge: "Good Recovery",
    badgeDescription: "Có vài pha hú hồn, nhưng công ty vẫn sống.",
  },
  {
    badge: "Good Recovery",
    badgeDescription: "Suýt nữa thì cả phòng đi uống cà phê bắt buộc.",
  },
  {
    badge: "Good Recovery",
    badgeDescription: "Bạn sống sót, nhưng bản sao dữ liệu cứu hộ đang nhìn bạn với ánh mắt thất vọng.",
  },
];

const LOW_BADGES = [
  {
    badge: "Business Critical Failure",
    badgeDescription: "Công ty không sập vì thiếu may mắn. Công ty sập vì chọn A hơi nhiều.",
  },
  {
    badge: "Business Critical Failure",
    badgeDescription: "Quyết định chậm và thiếu kiểm soát khiến khủng hoảng leo thang nhanh.",
  },
  {
    badge: "Click First, Think Later",
    badgeDescription: "Một triết lý sống cần được cập nhật bản vá.",
  },
];

export function gradeFinal(m: Metrics): GradeResult {
  if (m.encryptedData >= 70 || m.backupHealth <= 30) {
    const badge = m.backupHealth <= 30 ? LOW_BADGES[1] : LOW_BADGES[0];
    return {
      grade: "Công ty không sập hoàn toàn... chỉ suýt chút xíu.",
      message:
        "Dữ liệu bị khóa nhiều. Phản ứng chậm. Niềm tin khách hàng giảm. Lần sau nhớ chọn C nhiều hơn, vì chọn A hơi nhiều là công ty dễ bay màu.",
      tone: "fail",
      ...badge,
    };
  }
  if (m.defenderScore >= 120 && m.encryptedData <= 20 && m.backupHealth >= 70) {
    const badge =
      m.backupHealth >= 90 ? HIGH_BADGES[1] : m.recoveryReadiness >= 90 ? HIGH_BADGES[2] : HIGH_BADGES[0];
    return {
      grade: "Doanh nghiệp sống sót xuất sắc.",
      message:
        "Dữ liệu được cứu. Bản sao dữ liệu vẫn an toàn. Khách hàng còn niềm tin. CEO thậm chí còn khen: 'Hôm nay không có meeting khẩn nào.'",
      tone: "excellent",
      ...badge,
    };
  }
  if (m.defenderScore >= 90 && m.encryptedData <= 40) {
    const badge = m.backupHealth >= 80 ? HIGH_BADGES[1] : MEDIUM_BADGES[0];
    return {
      grade: "Vẫn sống, nhưng phòng IT già đi vài tuổi.",
      message:
        "Doanh nghiệp phục hồi được, nhưng có vài pha khiến phòng IT muốn tắt thông báo điện thoại. Cần tăng cường bản sao dữ liệu và đừng tin vào câu 'tôi chỉ click một cái thôi'.",
      tone: "good",
      ...badge,
    };
  }
  if (m.defenderScore >= 60) {
    const badge = m.customerTrust >= 70 ? MEDIUM_BADGES[1] : MEDIUM_BADGES[2];
    return {
      grade: "Vẫn sống, nhưng phòng IT già đi vài tuổi.",
      message:
        "Doanh nghiệp phục hồi được, nhưng có vài pha khiến phòng IT muốn tắt thông báo điện thoại. Cần tăng cường bản sao dữ liệu và đừng tin vào câu 'tôi chỉ click một cái thôi'.",
      tone: "warn",
      ...badge,
    };
  }
  const badge = m.defenderScore < 30 ? LOW_BADGES[2] : LOW_BADGES[0];
  return {
    grade: "Công ty không sập hoàn toàn... chỉ suýt chút xíu.",
    message:
      "Dữ liệu bị khóa nhiều. Phản ứng chậm. Niềm tin khách hàng giảm. Lần sau nhớ chọn C nhiều hơn, vì chọn A hơi nhiều là công ty dễ bay màu.",
    tone: "fail",
    ...badge,
  };
}
