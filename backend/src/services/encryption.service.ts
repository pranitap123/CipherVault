import crypto from "crypto";
import { env } from "../config/env.js";

const ALGORITHM = "aes-256-cbc";

const KEY = Buffer.from(env.encryptionKey, "hex");
    
if (KEY.length !== 32) {
    throw new Error(
      "Invalid encryption key. AES-256 requires a 32-byte key."
    );
  }

export function encrypt(data: Buffer): { encrypted : Buffer, iv : Buffer }{

    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

    return { encrypted, iv };
}

export function decrypt( encrypted : Buffer, iv : Buffer ) : Buffer {
    
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);

    return decrypted; 
}
