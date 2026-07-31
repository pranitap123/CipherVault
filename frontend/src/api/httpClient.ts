import axios from "axios";
import type { SecureVaultApi } from "./client";
import type {
  ApiError,
  ApiResult,
  Session,
  User,
} from "../types";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request Interceptor
http.interceptors.request.use((config) => {
    const raw = localStorage.getItem("sv_session");
  
    if (raw) {
      try {
        const session = JSON.parse(raw) as Session;
  
        config.headers.Authorization = `Bearer ${session.tokens.accessToken}`;
      } catch {
        localStorage.removeItem("sv_session");
      }
    }
  
    return config;
  });
  
  // ✅ Response Interceptor
  http.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("sv_session");
      }
  
      return Promise.reject(error);
    }
  );

const ok = <T>(data: T): ApiResult<T> => ({
  ok: true,
  data,
});

const fail = (error: unknown): ApiResult<never> => {
  if (axios.isAxiosError(error)) {
    return {
      ok: false,
      error: {
        code: "api_error",
        message:
          error.response?.data?.message ??
          "Something went wrong",
        status: error.response?.status ?? 500,
      } satisfies ApiError,
    };
  }

  return {
    ok: false,
    error: {
      code: "unknown_error",
      message: "Unexpected error",
      status: 500,
    },
  };
};

export const httpClient: SecureVaultApi = {
  async login(email, password) {
    try {
      const response = await http.post("/auth/login", {
        email,
        password,
      });

      return ok(response.data as Session);
    } catch (error) {
      return fail(error);
    }
  },

  async register(name, email, password) {
    try {
      const response = await http.post("/auth/register", {
        email,
        password,
      });

      return ok(response.data as Session);
    } catch (error) {
      return fail(error);
    }
  },

  async logout() {
    return ok(null);
  },

  async requestPasswordReset() {
    throw new Error("Not implemented");
  },

  async resetPassword() {
    throw new Error("Not implemented");
  },

  async verifyEmail() {
    throw new Error("Not implemented");
  },

  async refresh() {
    throw new Error("Not implemented");
  },

  async me() {
    throw new Error("Not implemented");
  },

  async listFiles() {
    throw new Error("Not implemented");
  },

  async getFile() {
    throw new Error("Not implemented");
  },

  async uploadFile() {
    throw new Error("Not implemented");
  },

  async deleteFile() {
    throw new Error("Not implemented");
  },

  async toggleFavorite() {
    throw new Error("Not implemented");
  },

  async getDownloadUrl() {
    throw new Error("Not implemented");
  },

  async storageStats() {
    throw new Error("Not implemented");
  },

  async updateProfile() {
    throw new Error("Not implemented");
  },

  async changePassword() {
    throw new Error("Not implemented");
  },
};