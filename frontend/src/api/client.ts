import type {
  ApiResult,
  AuthTokens,
  Session,
  StorageStats,
  User,
  VaultFile,
} from "../types";

// This interface is the contract between the frontend and your backend.
// The mock implementation (mockClient.ts) satisfies it today. Tomorrow you write
// httpClient.ts that satisfies the SAME interface by calling your Express API.
// The UI depends only on this interface, so swapping is a one-line change in index.ts.
export interface SecureVaultApi {
  // --- auth ---
  login(email: string, password: string): Promise<ApiResult<Session>>;
  register(
    name: string,
    email: string,
    password: string
  ): Promise<ApiResult<Session>>;
  requestPasswordReset(email: string): Promise<ApiResult<null>>;
  resetPassword(token: string, newPassword: string): Promise<ApiResult<null>>;
  verifyEmail(token: string): Promise<ApiResult<null>>;
  refresh(): Promise<ApiResult<AuthTokens>>;
  logout(): Promise<ApiResult<null>>;
  me(): Promise<ApiResult<User>>;

  // --- files ---
  listFiles(query?: {
    search?: string;
    favoritesOnly?: boolean;
  }): Promise<ApiResult<VaultFile[]>>;
  getFile(id: string): Promise<ApiResult<VaultFile>>;
  uploadFile(
    file: File,
    onProgress?: (fraction: number) => void
  ): Promise<ApiResult<VaultFile>>;
  deleteFile(id: string): Promise<ApiResult<null>>;
  toggleFavorite(id: string): Promise<ApiResult<VaultFile>>;
  getDownloadUrl(id: string): Promise<ApiResult<string>>;

  // --- account ---
  storageStats(): Promise<ApiResult<StorageStats>>;
  updateProfile(patch: {
    name?: string;
  }): Promise<ApiResult<User>>;
  changePassword(
    current: string,
    next: string
  ): Promise<ApiResult<null>>;
}
