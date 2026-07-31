import { httpClient } from "./httpClient";
import type { SecureVaultApi } from "./client";

export const api: SecureVaultApi = httpClient;