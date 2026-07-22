import { NextRequest } from "next/server"; import { jsonResponse } from "@/lib/json-response"; import { jsonResponse } from "@/lib/json-response";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-error";

export async function GET(_request: NextRequest) {
  try {
    const activeSurveys = await prisma.survey.findMany({
      where: { isActive: true },
    });

    return jsonResponse((activeSurveys));
  } catch (error) {
    return errorResponse(error, "Failed to fetch active surveys");
  }
}
