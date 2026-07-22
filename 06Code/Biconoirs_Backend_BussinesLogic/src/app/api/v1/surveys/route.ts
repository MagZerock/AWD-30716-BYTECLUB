import { NextRequest } from "next/server";
import { jsonResponse } from "@/lib/json-response";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    await authenticate(request);

    const responses = await prisma.surveyResponse.findMany({
      include: { user: true, survey: true },
      orderBy: { createdAt: "desc" },
    });

    const grouped = new Map<string, any>();

    for (const r of responses) {
      const key = `${r.surveyId}-${r.userId}-${r.createdAt.toISOString()}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          survey_id: r.surveyId,
          survey_title: r.survey?.title,
          customer: r.user,
          rating: 0,
          comments: "",
          submitted_at: r.createdAt,
        });
      }
      const entry = grouped.get(key);
      const num = Number(r.answer);
      if (!isNaN(num) && num >= 1 && num <= 5) {
        entry.rating = num;
      } else {
        entry.comments = entry.comments ? `${entry.comments}\n${r.answer}` : r.answer;
      }
    }

    return jsonResponse((Array.from(grouped.values())));
  } catch (error) {
    return errorResponse(error, "Failed to fetch surveys");
  }
}
