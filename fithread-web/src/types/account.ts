export interface UserRow {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  cohort: string | null;
  createdAt: string;
  backupEmail: string | null;
  backupEmailVerified: boolean;
  convertedFromStudent: boolean;
}

export interface UserPage {
  content: UserRow[];
  page: number;
  totalPages: number;
  totalElements: number;
}

export interface BackupEmailStatus {
  email: string | null;
  verified: boolean;
  required: boolean;
}

export interface GraduationRequestView {
  id: number;
  graduationYear: number;
  status: string;
  reason: string | null;
  createdAt: string;
}

export interface GraduationRequestRow {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  cohort: string | null;
  graduationYear: number;
  backupEmail: string;
  createdAt: string;
}

export interface CohortCount {
  cohort: string;
  count: number;
}

export interface StudentRow {
  id: number;
  fullName: string;
  email: string;
}

export interface BatchRow {
  id: number;
  cohort: string;
  graduationYear: number;
  studentCount: number;
  remaining: number;
  filled: number;
  createdAt: string;
  createdByName: string;
  reverted: boolean;
  revertedAt: string | null;
}