import { NextRequest } from "next/server";
import { ApiError } from "./api-error";
import * as crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "biconoirs-gourmet-class-operation-secret-key-123456";

interface AuthPayload {
  userId: string;
  role: string;
  sessionId?: number;
}

function verifyJwt(token: string): AuthPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decodedPayload as AuthPayload;
  } catch (error) {
    return null;
  }
}

export async function authenticate(request: NextRequest): Promise<AuthPayload> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing or invalid authorization header");
  }

  const token = authHeader.slice(7);
  const payload = verifyJwt(token);

  if (!payload) {
    throw new ApiError(401, "Invalid or expired token");
  }

  return payload;
}

export async function authenticateAdmin(request: NextRequest): Promise<AuthPayload> {
  const payload = await authenticate(request);

  if (payload.role !== "admin") {
    throw new ApiError(403, "Admin access required");
  }

  return payload;
}
