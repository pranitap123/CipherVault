import type { SecureVaultApi } from "./client";
import type {
  ApiError,
  ApiResult,
  Session,
  StorageStats,
  User,
  VaultFile,
} from "../types";

// In-memory mock backend. Simulates latency and a few failure modes so the UI's
// loading/error states are exercised for real, not just in theory.

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rid = () => Math.random().toString(36).slice(2, 10);

const ok = <T>(data: T): ApiResult<T> => ({ ok: true, data });
const fail = (
  code: string,
  message: string,
  status = 400
): ApiResult<never> => ({ ok: false, error: { code, message, status } as ApiError });

const now = () => new Date().toISOString();

// --- seed state ---
let user: User = {
  id: "u_" + rid(),
  email: "demo@securevault.app",
  name: "Demo User",
  emailVerified: true,
  createdAt: "2025-01-04T10:00:00.000Z",
};

const QUOTA = 5 * 1024 * 1024 * 1024; // 5 GB

let files: VaultFile[] = [
  seedFile("Q4-financials.pdf", "application/pdf", 2_400_000, true),
  seedFile("passport-scan.png", "image/png", 1_120_000, true),
  seedFile("recovery-codes.txt", "text/plain", 2_100, false),
  seedFile("architecture-notes.md", "text/markdown", 8_800, false),
  seedFile("team-photo.jpg", "image/jpeg", 3_650_000, false),
];

function seedFile(
  name: string,
  mimeType: string,
  sizeBytes: number,
  favorite: boolean
): VaultFile {
  return {
    id: "f_" + rid(),
    ownerId: user.id,
    name,
    mimeType,
    sizeBytes,
    status: "ready",
    encrypted: true,
    favorite,
    createdAt: now(),
    updatedAt: now(),
  };
}

function session(): Session {
  return { user, tokens: { accessToken: "mock." + rid() } };
}

export const mockClient: SecureVaultApi = {
  async login(email, password) {
    await delay(600);
    if (!email.includes("@")) return fail("invalid_email", "Enter a valid email address.", 422);
    if (password.length < 6)
      return fail("invalid_credentials", "That email and password don't match.", 401);
    user = { ...user, email };
    return ok(session());
  },

  async register(name, email, password) {
    await delay(700);
    if (password.length < 8)
      return fail("weak_password", "Use at least 8 characters.", 422);
    user = {
      id: "u_" + rid(),
      email,
      name,
      emailVerified: false,
      createdAt: now(),
    };
    return ok(session());
  },

  async requestPasswordReset(email) {
    await delay(500);
    if (!email.includes("@")) return fail("invalid_email", "Enter a valid email address.", 422);
    return ok(null); // always 200 to avoid leaking which emails exist
  },

  async resetPassword(token, newPassword) {
    await delay(500);
    if (!token) return fail("invalid_token", "This reset link is invalid or expired.", 400);
    if (newPassword.length < 8) return fail("weak_password", "Use at least 8 characters.", 422);
    return ok(null);
  },

  async verifyEmail(token) {
    await delay(500);
    if (!token) return fail("invalid_token", "This verification link is invalid or expired.", 400);
    user = { ...user, emailVerified: true };
    return ok(null);
  },

  async refresh() {
    await delay(200);
    return ok({ accessToken: "mock." + rid() });
  },

  async logout() {
    await delay(150);
    return ok(null);
  },

  async me() {
    await delay(200);
    return ok(user);
  },

  async listFiles(query) {
    await delay(300);
    let out = [...files];
    if (query?.favoritesOnly) out = out.filter((f) => f.favorite);
    if (query?.search) {
      const q = query.search.toLowerCase();
      out = out.filter((f) => f.name.toLowerCase().includes(q));
    }
    out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return ok(out);
  },

  async getFile(id) {
    await delay(200);
    const f = files.find((x) => x.id === id);
    return f ? ok(f) : fail("not_found", "That file no longer exists.", 404);
  },

  async uploadFile(file, onProgress) {
    // simulate chunked progress
    for (let p = 0; p <= 1; p += 0.1) {
      await delay(120);
      onProgress?.(Math.min(p, 1));
    }
    if (file.name.toLowerCase().includes("fail")) {
      return fail("upload_failed", "Upload failed. Check your connection and retry.", 500);
    }
    const vf: VaultFile = {
      id: "f_" + rid(),
      ownerId: user.id,
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      status: "ready",
      encrypted: true,
      favorite: false,
      createdAt: now(),
      updatedAt: now(),
    };
    files = [vf, ...files];
    return ok(vf);
  },

  async deleteFile(id) {
    await delay(300);
    const existed = files.some((f) => f.id === id);
    files = files.filter((f) => f.id !== id);
    return existed ? ok(null) : fail("not_found", "That file no longer exists.", 404);
  },

  async toggleFavorite(id) {
    await delay(150);
    const f = files.find((x) => x.id === id);
    if (!f) return fail("not_found", "That file no longer exists.", 404);
    f.favorite = !f.favorite;
    f.updatedAt = now();
    return ok({ ...f });
  },

  async getDownloadUrl(id) {
    await delay(200);
    const f = files.find((x) => x.id === id);
    if (!f) return fail("not_found", "That file no longer exists.", 404);
    return ok(`https://mock.securevault.app/download/${f.id}`);
  },

  async storageStats() {
    await delay(250);
    const usedBytes = files.reduce((s, f) => s + f.sizeBytes, 0);
    return ok<StorageStats>({ usedBytes, quotaBytes: QUOTA, fileCount: files.length });
  },

  async updateProfile(patch) {
    await delay(300);
    user = { ...user, ...patch };
    return ok(user);
  },

  async changePassword(current, next) {
    await delay(400);
    if (current.length < 6) return fail("invalid_credentials", "Your current password is incorrect.", 401);
    if (next.length < 8) return fail("weak_password", "Use at least 8 characters.", 422);
    return ok(null);
  },
};
