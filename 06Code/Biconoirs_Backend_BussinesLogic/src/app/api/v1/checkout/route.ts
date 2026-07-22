import { NextRequest } from "next/server";
import { jsonResponse } from "@/lib/json-response";
import { createLayerA } from "@/lib/layer-a";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { errorResponse, ApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await authenticate(request);
    const body = await request.json();
    const layerA = createLayerA(request);

    const items = body.items && body.items.length ? body.items : [];
    
    if (!items.length) {
      throw new ApiError(400, "Cart is empty");
    }

    // 2. Validate stock availability if ingredients are tracked
    for (const item of items) {
      const cartItem = item as Record<string, unknown>;
      const itemId = (cartItem.item_id ?? cartItem.itemId) as string | undefined;
      if (!itemId) continue;

      const ingredientLinks = await prisma.menuItemIngredient.findMany({
        where: { itemId },
        include: {
          ingredient: {
            include: {
              inventoryRecords: true,
            },
          },
        },
      });

      for (const link of ingredientLinks) {
        const qty = (cartItem.quantity ?? 1) as number;
        const requiredQty =
          Number(link.quantityRequired) * qty;
        const available =
          link.ingredient.inventoryRecords.reduce(
            (sum: number, inv: { currentStock: unknown }) => sum + Number(inv.currentStock),
            0,
          );

        if (available < requiredQty) {
          throw new ApiError(
            400,
            `Insufficient stock for ingredient: ${link.ingredient.name}`,
          );
        }
      }
    }

    const order = await layerA.post<any>("/orders", {
      ...body,
      userId: userId,
      status: "pending",
      items,
    }, {
      headers: {
        Authorization: request.headers.get("authorization") || "",
      }
    });

    // 4. Clear the cart (if it exists on backend)
    try {
      await layerA.delete("/cart", { params: { user_id: userId } });
    } catch (e) {
      console.warn("Could not delete remote cart, continuing...");
    }

    return jsonResponse((order), { status: 201 });
  } catch (error) {
    return errorResponse(error, "Checkout failed");
  }
}
