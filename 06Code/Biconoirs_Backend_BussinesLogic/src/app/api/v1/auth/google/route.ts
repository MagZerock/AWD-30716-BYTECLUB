import { NextRequest } from "next/server";
import { layerA } from "@/lib/layer-a";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-error";
import { jsonResponse } from "@/lib/json-response";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return errorResponse({ statusCode: 400, message: "Google token is required" }, "Google token is required");
    }

    const result = await layerA.post<{
      message: string;
      data: {
        accessToken: string;
        refreshToken: string;
        user: { userId: string; name: string; email: string; role: string };
      };
    }>("/auth/google", { token });

    const { accessToken, user } = result.data;

    await prisma.userSession.create({
      data: {
        userId: user.userId,
        refreshToken: accessToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return jsonResponse({ token: accessToken, user });
  } catch (error) {
    return errorResponse(error, "Google login failed");
  }
}
