import "dotenv/config";
import { describe, expect, it } from "vitest";
import { encrypt, decrypt } from "../src/services/encryption.service.js";

describe("Encryption Service", () => {
  it("should encrypt and decrypt data correctly", () => {
    const original = Buffer.from("Hello SecureVault!");
  
    const { encrypted, iv } = encrypt(original);
  
    expect(encrypted.equals(original)).toBe(false);
    expect(iv.length).toBe(16);
  
    const decrypted = decrypt(encrypted, iv);
  
    expect(original.equals(decrypted)).toBe(true);
  });
});