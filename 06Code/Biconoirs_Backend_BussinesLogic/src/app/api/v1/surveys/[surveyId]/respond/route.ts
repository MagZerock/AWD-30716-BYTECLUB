import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { errorResponse, ApiError } from "@/lib/api-error";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string }> },
) {
  try {
    const { userId } = await authenticate(request);
    const { surveyId } = await params;
    const body = await request.json();

    const survey = await prisma.survey.findUnique({
      where: { surveyId },
    });

    if (!survey) {
      throw new ApiError(404, "Survey not found");
    }

    // body.responses is expected to be an array of { question_id, answer }
    const responses = body.responses ?? body;

    if (!Array.isArray(responses) || responses.length === 0) {
      throw new ApiError(400, "Responses array is required");
    }

    const created = await prisma.$transaction(
      responses.map((r: { question_id: string; answer: string }) =>
        prisma.surveyResponse.create({
          data: {
            surveyId,
            userId,
            questionId: r.question_id,
            answer: r.answer,
          },
        }),
      ),
    );

    return NextResponse.json({ count: created.length }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to submit survey responses");
  }
}
