import * as crypto from "crypto";
import { promisify } from "util";

const JWT_SECRET = process.env.JWT_SECRET || "biconoirs-gourmet-class-operation-secret-key-123456";

export function signJwt(payload: any, expiresInSeconds: number = 3600): string {
  const header = { alg: "HS256", typ: "JWT" };
  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");

  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };
  const base64Payload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest("base64url");

  return `${base64Header}.${base64Payload}.${signature}`;
}

export function verifyJwt(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload
    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    // Check expiration
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decodedPayload;
  } catch (error) {
    return null;
  }
}

const scryptAsync = promisify(crypto.scrypt) as (
  password: string | Buffer, salt: string | Buffer, keylen: number
) => Promise<Buffer>;
const KEYLEN = 64;

// BLOCKING: run on the main thread of the event loop
export function hashPasswordBlockingSync(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = crypto.scryptSync(password, salt, KEYLEN); // <- blocking
  return `${salt}:${key.toString("hex")}`;
}

export function comparePasswordBlockingSync(password: string, stored: string): boolean {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const key = crypto.scryptSync(password, salt, KEYLEN); // <- blocking
  const stored_ = Buffer.from(hashHex, "hex");
  return key.length === stored_.length && crypto.timingSafeEqual(key, stored_);
}

// NON-BLOCKING: is delegated to the libuv thread pool, frees the event loop
export async function hashPasswordNonBlocking(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = await scryptAsync(password, salt, KEYLEN); // <- no blocking
  return `${salt}:${key.toString("hex")}`;
}

export async function comparePasswordNonBlocking(password: string, stored: string): Promise<boolean> {
  if (!stored.includes(":")) {
    // Compatibility with older hashes (unsalted SHA-256)
    const legacyHash = crypto.createHash("sha256").update(password).digest("hex");
    const a = Buffer.from(legacyHash, "hex");
    const b = Buffer.from(stored, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const key = await scryptAsync(password, salt, KEYLEN);
  const stored_ = Buffer.from(hashHex, "hex");
  return key.length === stored_.length && crypto.timingSafeEqual(key, stored_);
}