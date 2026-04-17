import type { RoleValue } from "./role";

export interface AuthUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: RoleValue;
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: RoleValue;
  iat: number;
  exp: number;
}

export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<AuthUser, "password">;
  expiresAt: string;
}
