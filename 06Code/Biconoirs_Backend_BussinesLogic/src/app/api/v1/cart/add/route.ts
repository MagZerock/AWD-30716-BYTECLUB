import { NextRequest } from "next/server";
import { jsonResponse } from "@/lib/json-response";
import { createLayerA } from "@/lib/layer-a";
import { authenticate } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await authenticate(request);
    const body = await request.json();
    const layerA = createLayerA(request);

    const result = await layerA.post("/cart/items", {
      ...body,
      user_id: userId,
    });

    return jsonResponse(result, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to add item to cart");
  }
}
