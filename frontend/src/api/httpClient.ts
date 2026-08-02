import axios from "axios";
import type { SecureVaultApi } from "./client";
import type {
  ApiError,
  ApiResult,
  Session,
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

  async register(_name, email, password) {
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
    try {
      const response = await http.get("/files");
  
      const files = response.data.files.map(
        (file: {
          id: string;
          filename: string;
          originalFilename: string;
          mimeType: string;
          sizeBytes: string;
          createdAt: string;
          updatedAt?: string;
        }) => ({
          id: file.id,
          ownerId: "",
          name: file.filename,
          originalFilename: file.originalFilename,
          mimeType: file.mimeType,
          sizeBytes: Number(file.sizeBytes),
          status: "ready" as const,
          encrypted: true,
          favorite: false,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt ?? file.createdAt,
        })
      );
  
      return ok(files);
    } catch (error) {
      return fail(error);
    }
  },

  async getFile(id) {
    try {
      const response = await http.get(`/files/${id}`);
  
      const file = response.data.file;
  
      return ok({
        id: file.id,
        ownerId: "",
        name: file.filename,
        originalFilename: file.originalFilename,
        mimeType: file.mimeType,
        sizeBytes: Number(file.sizeBytes),
        status: "ready" as const,
        encrypted: true,
        favorite: false,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt ?? file.createdAt,
      });
    } catch (error) {
      return fail(error);
    }
  },


  async uploadFile(file, onProgress) {
    try {
        const formData = new FormData();

        formData.append("file", file);

        const response = await http.post(
            "/files",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },

                onUploadProgress(progressEvent) {
                    if (
                        progressEvent.total &&
                        onProgress
                    ) {
                        onProgress(
                            progressEvent.loaded /
                                progressEvent.total
                        );
                    }
                },
            }
        );

        const uploaded = response.data.file;

        return ok({
            id: uploaded.id,
            ownerId: "",
            name: uploaded.filename,
             originalFilename: uploaded.originalFilename,
            mimeType: uploaded.mimeType,
            sizeBytes: Number(uploaded.sizeBytes),
            status: "ready",
            encrypted: true,
            favorite: false,
            createdAt: uploaded.createdAt,
            updatedAt: uploaded.updatedAt,
        });

    } catch (error) {
        return fail(error);
    }
},

async deleteFile(id) {
  try {
    await http.delete(`/files/${id}`);

    return ok(null);
  } catch (error) {
    return fail(error);
  }
},

  async toggleFavorite() {
    throw new Error("Not implemented");
  },

  async getDownloadUrl(id) {
    try {
      const response = await http.get(`/files/${id}`, {
        responseType: "blob",
      });
  
      const blob = response.data;
  
      const url = window.URL.createObjectURL(blob);
  
      return ok(url);
    } catch (error) {
      return fail(error);
    }
  },

  async storageStats() {
    try {
      const response = await http.get("/files/stats");
  
      return ok({
        usedBytes: response.data.usedBytes,
        quotaBytes: response.data.quotaBytes,
        fileCount: response.data.fileCount,
      });
  
    } catch (error) {
      return fail(error);
    }
  },

  async updateProfile() {
    throw new Error("Not implemented");
  },

  async changePassword() {
    throw new Error("Not implemented");
  },
};