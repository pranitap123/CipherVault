// Domain types for SecureVault. These mirror what the backend will return.
// Keep this file as the single source of truth for API shapes so that when the
// real backend replaces the mock layer, only src/api/* changes — not the UI.

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: string; // ISO
}

export type FileStatus = "ready" | "uploading" | "encrypting" | "error";

export interface VaultFile {
  id: string;
  ownerId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  status: FileStatus;
  encrypted: boolean; // encrypted at rest server-side
  favorite: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface StorageStats {
  usedBytes: number;
  quotaBytes: number;
  fileCount: number;
}

// A tagged result type so the UI can handle failure without try/catch everywhere.
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

export interface ApiError {
  code: string; // machine-readable, e.g. "invalid_credentials"
  message: string; // human-readable, safe to show
  status: number;
}

export interface AuthTokens {
  accessToken: string;
  // refreshToken lives in an httpOnly cookie in the real backend; not exposed here.
}

export interface Session {
  user: User;
  tokens: AuthTokens;
}
