export interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  specialization: string | null;
  required: boolean;
  description: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // trang hien tai (0-indexed)
  size: number;
}

export interface Lecturer {
  id: number;
  fullName: string;
  department: string | null;
}

export interface OfferingResponse {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  lecturerId: number;
  lecturerName: string;
  semester: string;
}