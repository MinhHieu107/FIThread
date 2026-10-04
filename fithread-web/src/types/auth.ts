export interface RegisterPayload {
  email: string;
  fullName: string;
  password: string;
  cohort?: string;
}

export interface VerifyPayload {
  email: string;
  otp: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenPairResponse {
  accessToken: string;
  refreshToken: string;
  fullName: string;
  role: string;
}

export interface ApiMessageResponse {
  message: string;
}