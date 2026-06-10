// src/types/auth.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "buyer" | "vendor";
  phone?: string;
  avatar?: string;
  createdAt: string;
  vendor?: {
    id: string;
    shopName: string;
    status: string;
    slug: string;
  } | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { field: string; message: string }[];
}
