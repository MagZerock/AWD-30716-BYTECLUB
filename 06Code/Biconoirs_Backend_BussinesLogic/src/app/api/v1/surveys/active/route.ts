import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-error";

export async function GET(_request: NextRequest) {
  try {
    const activeSurveys = await prisma.survey.findMany({
      where: { isActive: true },
    });

    return NextResponse.json(activeSurveys);
  } catch (error) {
    return errorResponse(error, "Failed to fetch active surveys");
  }
}
