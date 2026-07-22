import { NextRequest } from "next/server";
import { jsonResponse } from "@/lib/json-response";
import { layerA } from "@/lib/layer-a";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { password, passwordHash, phone, ...rest } = body;

    const result = await layerA.post<{
      message: string;
      data: {
        accessToken: string;
        refreshToken: string;
        user: { userId: string; name: string; email: string; role: string };
      };
    }>("/auth/register", {
      ...rest,
      passwordHash: passwordHash || password,
      ...(phone ? { phone } : {}),
    });

    const { accessToken, user } = result.data;

    await prisma.shoppingCart.create({
      data: {
        userId: user.userId,
      },
    });

    return jsonResponse(({ token: accessToken, user }), { status: 201 });
  } catch (error) {
    return errorResponse(error, "Signup failed");
  }
}
