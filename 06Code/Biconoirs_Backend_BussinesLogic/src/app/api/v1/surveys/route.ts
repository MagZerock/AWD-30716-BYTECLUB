import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    await authenticate(request);

    const surveys = await prisma.survey.findMany({
      include: { responses: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(surveys);
  } catch (error) {
    return errorResponse(error, "Failed to fetch surveys");
  }
}
