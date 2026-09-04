import crypto from "crypto";
import { env } from "../config/env.js";

const FILE_ALGORITHM = "aes-256-gcm";
const KEY_WRAP_ALGORITHM = "aes-256-gcm";
// 96 bits — the IV length NIST SP 800-38D specifies for GCM. This is
// deliberately different from the 16-byte IV the old CBC code used; reusing
// a CBC-sized IV with GCM doesn't break anything mechanically, but 12 bytes
// is what the algorithm is actually designed and analyzed for.
const GCM_IV_LENGTH = 12;

const MASTER_KEY = Buffer.from(env.masterKey, "hex");
if (MASTER_KEY.length !== 32) {
    throw new Error(
        "Invalid MASTER_KEY. AES-256 requires a 32-byte (64 hex char) key."
    );
}

// ---------------------------------------------------------------------------
// v1 (legacy): AES-256-CBC, one global key encrypts every file directly.
// Decrypt-only — kept so files uploaded before this migration still open.
// Every new upload goes through v2 below. CBC has no authentication tag: a
// tampered ciphertext decrypts "successfully" into garbage instead of
// throwing, which is exactly the gap v2 closes.
// ---------------------------------------------------------------------------
const LEGACY_ALGORITHM = "aes-256-cbc";

export function decryptLegacyV1(encrypted: Buffer, iv: Buffer): Buffer {
    const decipher = crypto.createDecipheriv(LEGACY_ALGORITHM, MASTER_KEY, iv);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

// ---------------------------------------------------------------------------
// v2 (current): envelope encryption with AES-256-GCM.
//
// Every file gets its own random Data Encryption Key (DEK). The file is
// encrypted with the DEK. The DEK itself (32 bytes) is then encrypted
// ("wrapped") under the MASTER_KEY and stored alongside the file's metadata.
// The master key never touches file bytes directly — only ever a handful of
// small key blobs. That's what makes master-key rotation cheap: rotating
// means unwrapping+rewrapping N small DEKs (see scripts/rotateMasterKey.ts),
// never re-encrypting the files themselves.
// ---------------------------------------------------------------------------

/** Generates a fresh random 32-byte Data Encryption Key for one file. */
export function generateDataKey(): Buffer {
    return crypto.randomBytes(32);
}

/**
 * Encrypts file bytes with a per-file DEK.
 * Returns ciphertext + IV + the GCM authentication tag. The tag is the
 * concrete thing CBC never gave us: decryptWithKey THROWS if even one bit of
 * the ciphertext (or the tag itself) was altered, instead of silently
 * returning corrupted plaintext as CBC would.
 */
export function encryptWithKey(
    data: Buffer,
    key: Buffer
): { encrypted: Buffer; iv: Buffer; authTag: Buffer } {
    const iv = crypto.randomBytes(GCM_IV_LENGTH);
    const cipher = crypto.createCipheriv(FILE_ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return { encrypted, iv, authTag };
}

/**
 * Decrypts file bytes with the per-file DEK. Throws (does not return garbage)
 * if the auth tag doesn't match the ciphertext — a tampered or corrupted
 * file is rejected outright.
 */
export function decryptWithKey(
    encrypted: Buffer,
    key: Buffer,
    iv: Buffer,
    authTag: Buffer
): Buffer {
    const decipher = crypto.createDecipheriv(FILE_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * Wraps (encrypts) a DEK under a given master key. Exposed separately from
 * wrapKey() below so the rotation script can wrap under an explicit NEW key
 * without needing a second MASTER_KEY constant loaded from a different env.
 */
export function wrapKeyWithMaster(
    dataKey: Buffer,
    masterKey: Buffer
): { wrappedKey: Buffer; keyIv: Buffer; keyAuthTag: Buffer } {
    const keyIv = crypto.randomBytes(GCM_IV_LENGTH);
    const cipher = crypto.createCipheriv(KEY_WRAP_ALGORITHM, masterKey, keyIv);
    const wrappedKey = Buffer.concat([cipher.update(dataKey), cipher.final()]);
    const keyAuthTag = cipher.getAuthTag();
    return { wrappedKey, keyIv, keyAuthTag };
}

/** Wraps a DEK under this process's current MASTER_KEY. */
export function wrapKey(dataKey: Buffer) {
    return wrapKeyWithMaster(dataKey, MASTER_KEY);
}

/**
 * Unwraps (decrypts) a DEK. Defaults to the current MASTER_KEY; the rotation
 * script passes an explicit OLD key so it can unwrap files wrapped before a
 * rotation, then re-wrap them under the new one.
 */
export function unwrapKey(
    wrappedKey: Buffer,
    keyIv: Buffer,
    keyAuthTag: Buffer,
    masterKeyOverride?: Buffer
): Buffer {
    const key = masterKeyOverride ?? MASTER_KEY;
    const decipher = crypto.createDecipheriv(KEY_WRAP_ALGORITHM, key, keyIv);
    decipher.setAuthTag(keyAuthTag);
    return Buffer.concat([decipher.update(wrappedKey), decipher.final()]);
}
