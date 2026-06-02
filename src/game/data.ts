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
    title: "Email hóa đơn 'thân thiện nhưng hơi đáng ngờ'",
    time: "08:30",
    stage: "Email",
    riskLevel: "Trung bình",
    scenario:
      "Nhân viên kế toán nhận email: 'Chị ơi hóa đơn này quá hạn rồi, mở gấp giúp em trong 5 phút nha!!!' File đính kèm: HoaDon_Thang6.pdf.exe. Email nhìn có vẻ lịch sự, nhưng cái đuôi .exe thì đang cười rất nham hiểm.",
    options: [
      { key: "A", text: "Mở file ngay vì người ta nói 'gấp'", good: false },
      { key: "B", text: "Chuyển tiếp cho cả phòng để 'ai rảnh mở thử'", good: false },
      { key: "C", text: "Báo IT/Security kiểm tra", good: true },
      { key: "D", text: "Tải lên cloud cá nhân cho tiện", good: false },
    ],
    bestAnswer: "C",
    goodConsequence:
      "Bạn đã báo IT/Security. Email bị chặn trước khi nó kịp biến phòng kế toán thành phòng karaoke buồn.",
    riskyConsequence:
      "Bạn mở file. Máy kế toán bị mã hóa. Tim nhân viên đập nhanh hơn tốc độ CPU, dữ liệu phòng tài chính bắt đầu bốc hơi.",
    lesson:
      "Email càng hối thúc, càng phải bình tĩnh. File .pdf.exe không phải PDF, nó là cái bẫy đội lốt hóa đơn.",
    goodImpact: "Bạn vừa cứu công ty khỏi một pha tự hủy.",
    riskyImpact: "Máy kế toán đã bay màu nhẹ.",
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
    title: "Máy tính có biểu hiện tự lập quá mức",
    time: "09:00",
    stage: "Infection",
    riskLevel: "Cao",
    scenario:
      "Máy nhân viên bắt đầu chạy chậm, quạt hú như máy bay chuẩn bị cất cánh. Một số file đổi tên thành .locked. Màn hình chưa hiện đòi tiền, nhưng không khí đã bắt đầu có mùi 'toang'.",
    options: [
      { key: "A", text: "Kệ, chắc máy tới tuổi nổi loạn", good: false },
      { key: "B", text: "Rút mạng/tắt Wi-Fi và báo IT ngay", good: true },
      { key: "C", text: "Cắm USB backup vào để copy dữ liệu gấp", good: false },
      { key: "D", text: "Tải tool 'fix-ransomware-free-100%-real.exe'", good: false },
    ],
    bestAnswer: "B",
    goodConsequence:
      "Bạn cô lập máy kịp thời. Ransomware bị nhốt lại như nhân viên bị giữ ở phòng họp sau giờ làm.",
    riskyConsequence:
      "Bạn cắm USB backup vào. Ransomware nhìn USB như nhìn buffet miễn phí.",
    lesson:
      "Khi nghi nhiễm ransomware: rút mạng, báo IT. Đừng cắm thêm USB, đừng tải tool lạ, đừng tự làm bác sĩ Google.",
    goodImpact: "Ransomware bị chặn trước cửa.",
    riskyImpact: "Ransomware vừa mở tour du lịch nội bộ.",
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
    title: "File Server bắt đầu đổi nghệ danh",
    time: "09:20",
    stage: "Spread",
    riskLevel: "Nghiêm trọng",
    scenario:
      "File Server xuất hiện hàng loạt file: hop_dong.docx.locked, bao_cao.xlsx.locked, ke_hoach_quy3.pptx.locked. Cả công ty nhận ra: file vẫn còn đó, nhưng quyền mở file đã đi du lịch.",
    options: [
      { key: "A", text: "Tắt đại toàn bộ hệ thống cho chắc", good: false },
      { key: "B", text: "Cô lập máy nghi nhiễm và xác định phạm vi ảnh hưởng", good: true },
      { key: "C", text: "Chờ thêm 30 phút xem có tự hết không", good: false },
      { key: "D", text: "Chia sẻ tài khoản admin cho mọi người xử lý nhanh", good: false },
    ],
    bestAnswer: "B",
    goodConsequence:
      "Đội IT/SOC khoanh vùng được sự cố. Ransomware bị chặn trước khi kịp đi tour toàn công ty.",
    riskyConsequence:
      "Tài khoản admin bị lạm dụng. Ransomware vừa được cấp quyền đi thẳng vào hệ thống lõi.",
    lesson:
      "Xử lý ransomware cần bình tĩnh: xác định phạm vi, cô lập, điều tra, rồi mới khôi phục. Làm loạn chỉ giúp hacker vui hơn.",
    goodImpact: "SOC đã vào trận.",
    riskyImpact: "File Server đổi nghề thành két sắt khóa trái.",
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
    title: "Backup: vị cứu tinh hay đồng nạn nhân?",
    time: "09:45",
    stage: "Backup Risk",
    riskLevel: "Nghiêm trọng",
    scenario:
      "Backup Server vẫn đang kết nối với hệ thống chính. Mọi người nói: 'Không sao đâu, mình có backup mà.' Hệ thống backup trực tuyến có nguy cơ bị lây nhiễm chéo. Phao cứu sinh cuối cùng của công ty đang bị đe dọa.",
    options: [
      { key: "A", text: "Kiểm tra và bảo vệ backup ngay", good: true },
      { key: "B", text: "Bỏ qua vì backup sinh ra là để bất tử", good: false },
      { key: "C", text: "Xóa bớt backup cũ cho nhẹ ổ cứng", good: false },
      { key: "D", text: "Cho tất cả nhân viên quyền truy cập backup cho tiện", good: false },
    ],
    bestAnswer: "A",
    goodConsequence:
      "Backup được bảo vệ kịp thời. Công ty còn đường lui. CEO thở ra nhẹ hơn 2kg áp lực.",
    riskyConsequence:
      "Backup cũng bị mã hóa. Câu 'có gì restore lại' chính thức được đưa vào viện bảo tàng những niềm tin ngây thơ.",
    lesson:
      "Backup phải tách biệt, có versioning/offline và phải test restore. Backup chưa từng khôi phục thử chỉ là niềm tin có giao diện.",
    goodImpact: "Backup vẫn sống. Hy vọng vẫn còn.",
    riskyImpact: "Phao cứu sinh cuối cùng của công ty đang bị đe dọa.",
    mcNote:
      "Backup là phao cứu sinh. Nhưng phao để trong kho, chưa từng bơm thử, thì lúc chìm cũng hơi khó nói.",
    goodChanges: { defenderScore: 20, recoveryReadiness: 15 },
    riskyChanges: { backupHealth: -35, businessImpact: 20, recoveryReadiness: -20 },
    goodNodes: { backup: "safe" },
    riskyNodes: { backup: "suspicious" },
    spreadFrom: "fileserver",
    spreadTo: ["backup"],
  },
  {
    index: 5,
    title: "Hacker đòi tiền, CEO bắt đầu nhìn phòng IT",
    time: "10:00",
    stage: "Leadership Decision",
    riskLevel: "Nghiêm trọng",
    scenario:
      "Hacker gửi thông báo: 'Trả tiền để lấy lại dữ liệu.' Hệ thống bán hàng đứng hình. Khách hàng gọi liên tục. CEO hỏi một câu rất nhẹ nhàng: 'Ai giải thích giúp tôi chuyện này trong 30 giây?'",
    options: [
      { key: "A", text: "Trả tiền ngay cho nhanh", good: false },
      { key: "B", text: "Kích hoạt quy trình ứng cứu sự cố và kiểm tra backup", good: true },
      { key: "C", text: "Im lặng, hy vọng hacker cũng nghỉ trưa", good: false },
      { key: "D", text: "Để nhân viên tự xử lý vì 'ai bấm thì người đó chịu'", good: false },
    ],
    bestAnswer: "B",
    goodConsequence:
      "Quy trình ứng cứu được kích hoạt. IT/SOC vào việc, lãnh đạo có thông tin, truyền thông chuẩn bị kịch bản. Công ty vẫn căng nhưng chưa vỡ trận.",
    riskyConsequence:
      "Bạn chọn im lặng. Tin đồn trong công ty lan nhanh hơn ransomware.",
    lesson:
      "Trả tiền không đảm bảo lấy lại dữ liệu. Quy trình ứng cứu, backup và ra quyết định nhanh mới cứu doanh nghiệp.",
    goodImpact: "CEO tạm thời chưa hỏi 'ai chịu trách nhiệm?'.",
    riskyImpact: "CEO đã bước vào phòng. Nhiệt độ giảm 5 độ.",
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
    title: "Khách hàng hỏi: Sao app không chạy?",
    time: "10:30",
    stage: "Communication",
    riskLevel: "Cao",
    scenario:
      "Dịch vụ bị gián đoạn. Khách hàng bắt đầu nhắn: 'Sao tôi không đăng nhập được?', 'Dữ liệu của tôi có sao không?', 'Bên bạn ổn không vậy?' Đội truyền thông mở laptop, hít một hơi thật sâu.",
    options: [
      { key: "A", text: "Không phản hồi gì cho đỡ sai", good: false },
      { key: "B", text: "Đổ lỗi cho 'sự cố kỹ thuật không xác định'", good: false },
      { key: "C", text: "Chuẩn bị thông báo minh bạch, ngắn gọn, có kiểm soát", good: true },
      { key: "D", text: "Đăng status: 'Hacker ghé chơi xíu, mọi người thông cảm'", good: false },
    ],
    bestAnswer: "C",
    goodConsequence:
      "Thông báo được kiểm soát. Khách hàng chưa vui, nhưng ít nhất họ thấy công ty đang xử lý nghiêm túc.",
    riskyConsequence:
      "Bạn đăng thông tin chưa xác minh. Khủng hoảng truyền thông mở thêm season 2.",
    lesson:
      "Ransomware không chỉ là sự cố IT. Nó là khủng hoảng niềm tin, vận hành và truyền thông.",
    goodImpact: "Khách hàng chưa vui, nhưng vẫn còn niềm tin.",
    riskyImpact: "Tin đồn lan nhanh hơn gói tin mạng.",
    goodChanges: { defenderScore: 10, customerTrust: 5, reputationDamage: -5 },
    riskyChanges: { customerTrust: -20, reputationDamage: 20, businessImpact: 10 },
    goodNodes: { customers: "suspicious" },
    riskyNodes: { customers: "down", ops: "down" },
  },
  {
    index: 7,
    title: "Khôi phục: không phải cứ bấm restore là xong",
    time: "11:30",
    stage: "Recovery",
    riskLevel: "Cao",
    scenario:
      "IT tìm thấy một bản backup sạch. Cả phòng vui như bắt được Wi-Fi mạnh ở sân bay. Nhưng câu hỏi quan trọng là: khôi phục như thế nào để ransomware không quay lại?",
    options: [
      { key: "A", text: "Restore ngay lên hệ thống đang nhiễm cho nhanh", good: false },
      { key: "B", text: "Làm sạch môi trường, xác minh backup, rồi khôi phục có kiểm soát", good: true },
      { key: "C", text: "Gửi file backup cho từng nhân viên tự xử", good: false },
      { key: "D", text: "Bỏ backup, nhập lại dữ liệu bằng niềm tin và Excel", good: false },
    ],
    bestAnswer: "B",
    goodConsequence:
      "Khôi phục có kiểm soát. File Server dần sống lại. Phòng kế toán bắt đầu tin vào ngày mai.",
    riskyConsequence:
      "Bạn restore lên môi trường chưa sạch. Ransomware kích hoạt lại từ môi trường chưa làm sạch. Lần này, tốc độ phá hoại còn nhanh hơn.",
    lesson:
      "Khôi phục phải có kiểm soát. Nếu môi trường còn nhiễm, ransomware có thể quay lại.",
    goodImpact: "File Server đang hồi sinh.",
    riskyImpact: "Phòng IT bắt đầu uống cà phê không đường.",
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
    title: "Sau sự cố: họp rút kinh nghiệm hay họp cho có?",
    time: "Ngày hôm sau",
    stage: "Lessons Learned",
    riskLevel: "Thấp",
    scenario:
      "Công ty hoạt động lại. Lãnh đạo hỏi: 'Làm sao để chuyện này không lặp lại?' Đây là lúc chọn giữa an toàn thật và slide PowerPoint rất đẹp nhưng không ai làm.",
    options: [
      { key: "A", text: "Đào tạo nhân viên, bật MFA, backup an toàn, EDR và quy trình ứng cứu", good: true },
      { key: "B", text: "Chỉ đổi hình nền máy tính thành 'Đừng click linh tinh'", good: false },
      { key: "C", text: "Chỉ đổi mật khẩu một lần rồi thôi", good: false },
      { key: "D", text: "Không làm gì, vì hôm nay hệ thống chạy lại rồi", good: false },
    ],
    bestAnswer: "A",
    goodConsequence:
      "Doanh nghiệp xây dựng phòng thủ nhiều lớp. Không ai bất tử trước ransomware, nhưng công ty đã bớt 'mong manh dễ vỡ'.",
    riskyConsequence:
      "Không cải thiện gì sau sự cố. Ransomware 2.0 đang đứng ngoài cửa, cầm hoa và lịch hẹn.",
    lesson:
      "Phòng chống ransomware cần kết hợp con người, quy trình và công nghệ. Không có một món đồ thần kỳ cứu được tất cả.",
    goodImpact: "Công ty sống sót qua ngày thứ Hai.",
    riskyImpact: "Ransomware 2.0 đang đặt lịch tái khám.",
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
  "Nghi nhiễm ransomware thì rút mạng, báo IT/Security. Đừng tự làm bác sĩ Google.",
  "Bật MFA để hacker có mật khẩu cũng chưa chắc vào được.",
  "Backup phải tách biệt, có versioning/offline và phải test restore.",
  "Ransomware không chỉ khóa dữ liệu. Nó khóa luôn doanh thu, vận hành, uy tín và niềm tin khách hàng.",
];

export const EVENT_MODE_NOTES = [
  "Trò chơi này không dạy hack. Trò chơi này dạy cách không biến mình thành người mở cửa mời hacker vào.",
  "Nếu thấy file .pdf.exe mà vẫn mở, thì hôm nay chúng ta không chơi game nữa, chúng ta chơi cảm giác mạnh.",
  "Backup là phao cứu sinh. Nhưng phao để trong kho, chưa từng bơm thử, thì lúc chìm cũng hơi khó nói.",
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
    badgeDescription: "Người hiểu rằng backup không test restore thì chỉ là niềm tin.",
  },
  {
    badge: "Crisis Leader",
    badgeDescription: "Bình tĩnh giữa bão ransomware, không đổ lỗi lung tung.",
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
    badge: "Almost Safe",
    badgeDescription: "Suýt nữa thì cả phòng đi uống cà phê bắt buộc.",
  },
  {
    badge: "Needs Improvement",
    badgeDescription: "Bạn sống sót, nhưng backup đang nhìn bạn với ánh mắt thất vọng.",
  },
];

const LOW_BADGES = [
  {
    badge: "Business Critical Failure",
    badgeDescription: "Công ty không sập vì thiếu may mắn. Công ty sập vì chọn A hơi nhiều.",
  },
  {
    badge: "High-Risk Recovery Case",
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
      grade: "Business Critical Failure",
      message:
        "Doanh nghiệp bị ảnh hưởng nghiêm trọng. Backup yếu. Phản ứng chậm. Khách hàng mất niềm tin. File Server đang nằm im như đang suy ngẫm về cuộc đời.",
      tone: "fail",
      ...badge,
    };
  }
  if (m.defenderScore >= 120 && m.encryptedData <= 20 && m.backupHealth >= 70) {
    const badge =
      m.backupHealth >= 90 ? HIGH_BADGES[1] : m.recoveryReadiness >= 90 ? HIGH_BADGES[2] : HIGH_BADGES[0];
    return {
      grade: "Excellent Defender",
      message:
        "Doanh nghiệp đã sống sót. Dữ liệu mất ít. Backup vẫn an toàn. Khách hàng còn niềm tin. CEO chưa cần mở cuộc họp lúc 7 giờ sáng.",
      tone: "excellent",
      ...badge,
    };
  }
  if (m.defenderScore >= 90 && m.encryptedData <= 40) {
    const badge = m.backupHealth >= 80 ? HIGH_BADGES[1] : MEDIUM_BADGES[0];
    return {
      grade: "Good Recovery",
      message:
        "Doanh nghiệp vẫn phục hồi được, nhưng có vài khoảnh khắc khiến phòng IT muốn tắt thông báo điện thoại. Cần cải thiện backup, MFA và quy trình ứng cứu.",
      tone: "good",
      ...badge,
    };
  }
  if (m.defenderScore >= 60) {
    const badge = m.customerTrust >= 70 ? MEDIUM_BADGES[1] : MEDIUM_BADGES[2];
    return {
      grade: "Needs Improvement",
      message:
        "Doanh nghiệp vẫn phục hồi được, nhưng có vài khoảnh khắc khiến phòng IT muốn tắt thông báo điện thoại. Cần cải thiện backup, MFA và quy trình ứng cứu.",
      tone: "warn",
      ...badge,
    };
  }
  const badge = m.defenderScore < 30 ? LOW_BADGES[2] : LOW_BADGES[0];
  return {
    grade: "Business Critical Failure",
    message:
      "Doanh nghiệp bị ảnh hưởng nghiêm trọng. Backup yếu. Phản ứng chậm. Khách hàng mất niềm tin. File Server đang nằm im như đang suy ngẫm về cuộc đời.",
    tone: "fail",
    ...badge,
  };
}
