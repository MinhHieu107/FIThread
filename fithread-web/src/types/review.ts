export interface RubricCriterion {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

export interface ScoreView {
  criterionId: number;
  criterionName: string;
  score: number;
}

export interface Review {
  id: number;
  offeringId: number;
  lecturerName: string;
  semester: string;
  comment: string;
  createdAt: string;
  scores: ScoreView[];
  average: number;
  mine: boolean;
  status: string;
}

export interface ReviewPage {
  content: Review[];
  page: number;
  totalPages: number;
  totalElements: number;
}

export interface CriterionStat {
  criterionId: number;
  name: string;
  average: number;
}

export interface CourseStats {
  reviewCount: number;
  minRequired: number;
  hidden: boolean;
  overallAverage: number | null;
  criteria: CriterionStat[];
}

export interface ModerationReview {
  id: number;
  courseCode: string;
  courseName: string;
  lecturerName: string;
  semester: string;
  comment: string;
  status: string;
  createdAt: string;
  reportCount: number;
  reasons: string[];
}