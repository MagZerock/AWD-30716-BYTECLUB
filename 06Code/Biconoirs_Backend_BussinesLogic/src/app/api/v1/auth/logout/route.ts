import { NextRequest } from "next/server";
import { jsonResponse } from "@/lib/json-response";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await authenticate(request);

    // Invalidate all active sessions for the user
    await prisma.userSession.updateMany({
      where: {
        userId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });

    return jsonResponse({ message: "Logged out successfully" });
  } catch (error) {
    return errorResponse(error, "Logout failed");
  }
}
