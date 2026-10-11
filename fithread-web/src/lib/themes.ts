export const THEME_LABELS: Record<string, string> = {
  CONTENT: "Nội dung môn học",
  TEACHING: "Phương pháp giảng dạy",
  MATERIALS: "Tài liệu học tập",
  PRACTICE: "Bài tập & thực hành",
  ASSESSMENT: "Kiểm tra & đánh giá",
  SUPPORT: "Hỗ trợ từ giảng viên",
  WORKLOAD: "Khối lượng học tập",
  DIFFICULTY: "Độ khó",
  OTHER: "Khác",
};

export function themeLabel(code: string) {
  return THEME_LABELS[code] ?? code;
}