import { NextRequest } from "next/server";
import { jsonResponse } from "@/lib/json-response";
import { createLayerA } from "@/lib/layer-a";
import { authenticate } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await authenticate(request);
    const layerA = createLayerA(request);

    const cart = await layerA.get<any>("/cart", {
      params: { user_id: userId },
    });

    const items = cart.items ?? cart;
    const subtotal = Array.isArray(items)
      ? items.reduce(
          (sum: number, item: any) =>
            sum + Number(item.price ?? item.price_at_purchase ?? 0) * (item.quantity ?? 1),
          0,
        )
      : 0;

    const total = subtotal;

    return jsonResponse({
      items,
      subtotal: Number(subtotal.toFixed(2)),
      total: Number(total.toFixed(2)),
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch cart");
  }
}
