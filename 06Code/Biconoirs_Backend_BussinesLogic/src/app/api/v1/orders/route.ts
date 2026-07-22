import { NextRequest } from "next/server";
import { jsonResponse } from "@/lib/json-response";
import { createLayerA } from "@/lib/layer-a";
import { authenticate } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await authenticate(request);
    const layerA = createLayerA(request);

    const orders = await layerA.get<any[]>("/orders");

    const userOrders = (Array.isArray(orders) ? orders : []).filter(
      (o: any) =>
        (o.user_id ?? o.userId) === userId,
    );

    return jsonResponse(userOrders);
  } catch (error) {
    return errorResponse(error, "Failed to fetch orders");
  }
}
