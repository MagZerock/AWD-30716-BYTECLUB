import { NextRequest } from "next/server"; import { jsonResponse } from "@/lib/json-response"; import { jsonResponse } from "@/lib/json-response";
import { layerA } from "@/lib/layer-a";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);

    const identity = await layerA.get<{
      user_id: string;
      name: string;
      email: string;
      role: string;
    }>("/auth/me", {
      headers: {
        Authorization: `Bearer ${request.headers.get("authorization")?.slice(7)}`,
      },
    });

    const user = await prisma.user.findUnique({
      where: { userId: auth.userId },
      select: {
        phone: true,
        preferences: true,
      },
    });

    return jsonResponse(({
      ...identity,
      phone: user?.phone ?? null,
      preferences: user?.preferences ?? {},
    }));
  } catch (error) {
    return errorResponse(error, "Failed to fetch profile");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await authenticate(request);
    const body = await request.json();

    const result = await layerA.put(`/customers/${userId}`, body);

    return jsonResponse((result));
  } catch (error) {
    return errorResponse(error, "Failed to update profile");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await authenticate(request);
    const body = await request.json();

    const user = await prisma.user.update({
      where: { userId },
      data: {
        preferences: body.preferences,
      },
      select: {
        preferences: true,
      },
    });

    return jsonResponse(({ preferences: user.preferences }));
  } catch (error) {
    return errorResponse(error, "Failed to update preferences");
  }
}
