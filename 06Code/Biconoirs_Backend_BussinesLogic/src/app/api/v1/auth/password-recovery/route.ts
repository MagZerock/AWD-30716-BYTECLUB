import { NextRequest, NextResponse } from "next/server";
import { layerA } from "@/lib/layer-a";
import { errorResponse } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await layerA.post("/auth/password/forgot", body);

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error, "Password recovery failed");
  }
}
