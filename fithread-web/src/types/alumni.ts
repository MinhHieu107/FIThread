export interface AlumniSummary {
  id: number;
  fullName: string;
  cohort: string | null;
  graduationYear: number;
  company: string | null;
  positionTitle: string | null;
  industry: string | null;
}

export interface AlumniPage {
  content: AlumniSummary[];
  page: number;
  totalPages: number;
  totalElements: number;
}

export interface AlumniDetail extends AlumniSummary {
  bio: string | null;
  contactVisible: boolean;
  linkedinUrl: string | null;
  email: string | null;
}

export interface MyProfile {
  id: number;
  fullName: string;
  email: string;
  cohort: string | null;
  graduationYear: number;
  company: string | null;
  positionTitle: string | null;
  industry: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  contactVisible: boolean;
}

export interface AlumniApplication {
  userId: number;
  fullName: string;
  email: string;
  cohort: string | null;
  graduationYear: number;
  appliedAt: string;
  hasPhoto: boolean;
}