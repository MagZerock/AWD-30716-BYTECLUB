import { NextRequest, NextResponse } from "next/server";
import { layerA } from "@/lib/layer-a";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { errorResponse, ApiError } from "@/lib/api-error";
import { serialize } from "@/lib/serialize";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await authenticate(request);
    const body = await request.json();

    // 1. Fetch the user's current cart
    const cart = await layerA.get<{
      items?: Array<Record<string, unknown>>;
    }>("/cart", {
      params: { user_id: userId },
    });

    const items = cart.items ?? [];
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
            (sum, inv) => sum + Number(inv.currentStock),
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

    // 3. Create the order via Layer A
    const order = await layerA.post<any>("/orders", {
      ...body,
      user_id: userId,
      status: "pending",
      items,
    });

    // 4. Clear the cart
    await layerA.delete("/cart");

    return NextResponse.json(serialize(order), { status: 201 });
  } catch (error) {
    return errorResponse(error, "Checkout failed");
  }
}
