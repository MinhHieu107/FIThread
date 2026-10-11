export interface SentimentCounts {
  positive: number;
  neutral: number;
  negative: number;
}

export interface ThemeStat {
  theme: string;
  count: number;
  positive: number;
  negative: number;
}

export interface CourseRow {
  courseId: number;
  code: string;
  name: string;
  reviewCount: number;
  avgRating: number | null;
  analyzedCount: number;
  positive: number;
  neutral: number;
  negative: number;
  negativeShare: number;
  enoughData: boolean;
}

export interface DashboardOverview {
  totalReviews: number;
  analyzedReviews: number;
  pendingModeration: number;
  minRequired: number;
  sentiment: SentimentCounts;
  topThemes: ThemeStat[];
  attentionCourses: CourseRow[];
  courses: CourseRow[];
}

export interface DashboardCriterion {
  criterionId: number;
  name: string;
  average: number;
}

export interface SummaryView {
  overview: string;
  strengths: string[];
  improvements: string[];
  reviewsCovered: number;
  generatedAt: string;
}

export interface DashboardCourse {
  courseId: number;
  code: string;
  name: string;
  credits: number;
  specialization: string | null;
  reviewCount: number;
  analyzedCount: number;
  minRequired: number;
  enoughData: boolean;
  avgRating: number | null;
  criteria: DashboardCriterion[];
  sentiment: SentimentCounts;
  avgSentimentScore: number | null;
  themes: ThemeStat[];
  summary: SummaryView | null;
}