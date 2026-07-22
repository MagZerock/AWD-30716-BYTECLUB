import { NextRequest } from "next/server";
import { ApiError } from "./api-error";
import { prisma } from "./prisma";

interface AuthPayload {
  userId: string;
  role: string;
}

export async function authenticate(request: NextRequest): Promise<AuthPayload> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing or invalid authorization header");
  }

  const token = authHeader.slice(7);

  // Verify the token against the user_sessions table
  const session = await prisma.userSession.findFirst({
    where: {
      refreshToken: token,
      isRevoked: false,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    throw new ApiError(401, "Invalid or expired token");
  }

  return {
    userId: session.user.userId,
    role: session.user.role,
  };
}

export async function authenticateAdmin(request: NextRequest): Promise<AuthPayload> {
  const payload = await authenticate(request);

  if (payload.role !== "admin") {
    throw new ApiError(403, "Admin access required");
  }

  return payload;
}
