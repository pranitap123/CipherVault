import "dotenv/config";
import { describe, expect, it } from "vitest";
import {
  generateDataKey,
  encryptWithKey,
  decryptWithKey,
  wrapKey,
  wrapKeyWithMaster,
  unwrapKey,
  decryptLegacyV1,
} from "../src/services/encryption.service.js";
import crypto from "crypto";

describe("v2: per-file envelope encryption (AES-256-GCM)", () => {
  it("encrypts and decrypts a file round-trip with its own data key", () => {
    const original = Buffer.from("Hello CipherVault!");
    const dataKey = generateDataKey();

    const { encrypted, iv, authTag } = encryptWithKey(original, dataKey);
    expect(encrypted.equals(original)).toBe(false);
    expect(iv.length).toBe(12); // GCM's recommended IV length, not CBC's 16
    expect(authTag.length).toBe(16);

    const decrypted = decryptWithKey(encrypted, dataKey, iv, authTag);
    expect(original.equals(decrypted)).toBe(true);
  });

  it("generates a different data key for every file", () => {
    const a = generateDataKey();
    const b = generateDataKey();
    expect(a.equals(b)).toBe(false);
  });

  it("REJECTS a tampered ciphertext instead of silently returning garbage", () => {
    // This is the concrete difference from the old CBC scheme: CBC would
    // decrypt a flipped-bit ciphertext into corrupted-but-returned plaintext.
    // GCM throws.
    const dataKey = generateDataKey();
    const { encrypted, iv, authTag } = encryptWithKey(
      Buffer.from("sensitive contents"),
      dataKey
    );

    const tampered = Buffer.from(encrypted);
    tampered[0] = tampered[0] ^ 0xff; // flip a single bit

    expect(() => decryptWithKey(tampered, dataKey, iv, authTag)).toThrow();
  });

  it("REJECTS decryption with the wrong data key", () => {
    const dataKey = generateDataKey();
    const wrongKey = generateDataKey();
    const { encrypted, iv, authTag } = encryptWithKey(Buffer.from("secret"), dataKey);

    expect(() => decryptWithKey(encrypted, wrongKey, iv, authTag)).toThrow();
  });
});

describe("v2: key wrapping (envelope encryption's whole point)", () => {
  it("wraps and unwraps a data key under the master key", () => {
    const dataKey = generateDataKey();
    const { wrappedKey, keyIv, keyAuthTag } = wrapKey(dataKey);

    expect(wrappedKey.equals(dataKey)).toBe(false);

    const unwrapped = unwrapKey(wrappedKey, keyIv, keyAuthTag);
    expect(unwrapped.equals(dataKey)).toBe(true);
  });

  it("rotation: re-wrapping under a new master key preserves the SAME data key", () => {
    // This is the actual claim under test: rotating the master key changes
    // only the wrapper around the data key, never the data key (and
    // therefore never the file content) itself.
    const dataKey = generateDataKey();
    const oldMaster = crypto.randomBytes(32);
    const newMaster = crypto.randomBytes(32);

    const wrappedOld = wrapKeyWithMaster(dataKey, oldMaster);
    const recoveredKey = unwrapKey(
      wrappedOld.wrappedKey,
      wrappedOld.keyIv,
      wrappedOld.keyAuthTag,
      oldMaster
    );
    expect(recoveredKey.equals(dataKey)).toBe(true);

    const wrappedNew = wrapKeyWithMaster(recoveredKey, newMaster);
    const recoveredAgain = unwrapKey(
      wrappedNew.wrappedKey,
      wrappedNew.keyIv,
      wrappedNew.keyAuthTag,
      newMaster
    );
    expect(recoveredAgain.equals(dataKey)).toBe(true);

    // The old wrapping must NOT be openable with the new master key —
    // proves rotation actually invalidates the old key material.
    expect(() =>
      unwrapKey(wrappedOld.wrappedKey, wrappedOld.keyIv, wrappedOld.keyAuthTag, newMaster)
    ).toThrow();
  });
});

describe("v1: legacy decrypt-only path", () => {
  it("still opens a file encrypted the old way (AES-256-CBC, single global key)", () => {
    // Simulates a file uploaded before this migration existed — encrypted
    // directly against MASTER_KEY with no envelope and no auth tag.
    const masterKeyHex = process.env.MASTER_KEY!;
    const masterKey = Buffer.from(masterKeyHex, "hex");
    const iv = crypto.randomBytes(16); // CBC's IV length, not GCM's
    const original = Buffer.from("a file from before the migration");

    const cipher = crypto.createCipheriv("aes-256-cbc", masterKey, iv);
    const encrypted = Buffer.concat([cipher.update(original), cipher.final()]);

    const decrypted = decryptLegacyV1(encrypted, iv);
    expect(decrypted.equals(original)).toBe(true);
  });
});
