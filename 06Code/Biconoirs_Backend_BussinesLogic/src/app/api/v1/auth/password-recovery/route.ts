import { NextRequest } from "next/server";
import { jsonResponse } from "@/lib/json-response";
import { layerA } from "@/lib/layer-a";
import { errorResponse } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await layerA.post("/auth/password/forgot", body);

    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error, "Password recovery failed");
  }
}
