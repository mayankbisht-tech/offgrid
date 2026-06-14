import type { UserRole } from '../constants/roles.constants.js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  username?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  username?: string;
  bizName?: string;
  city?: string;
  gst?: string;
  portfolio?: string;
}

export interface AuthResponse {
  user: AuthUser;
}
