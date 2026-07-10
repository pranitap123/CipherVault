import { mockClient } from "./mockClient";
import type { SecureVaultApi } from "./client";

// Swap this single line tomorrow: `export const api = httpClient;`
// once you build httpClient.ts against your Express backend. Nothing else changes.
export const api: SecureVaultApi = mockClient;
