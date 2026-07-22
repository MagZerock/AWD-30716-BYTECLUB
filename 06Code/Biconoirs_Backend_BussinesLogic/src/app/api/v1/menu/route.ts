import { NextRequest } from "next/server";
import { jsonResponse } from "@/lib/json-response";
import { layerA } from "@/lib/layer-a";
import { errorResponse } from "@/lib/api-error";

export async function GET(_request: NextRequest) {
  try {
    const [dishes, categories] = await Promise.all([
      layerA.get<any[]>("/menu/dishes"),
      layerA.get<any[]>("/menu/categories"),
    ]);

    const categoryMap = new Map(
      categories.map((cat: any) => [
        cat.category_id ?? cat.categoryId,
        {
          id: cat.category_id ?? cat.categoryId,
          name: cat.name,
          description: cat.description,
          sort_order: cat.sort_order ?? cat.sortOrder,
        },
      ]),
    );

    const categorizedMenu = Array.from(categoryMap.values()).map((cat) => ({
      ...cat,
      items: dishes
        .filter(
          (d: any) =>
            (d.category_id ?? d.categoryId) === cat.id,
        )
        .map((d: any) => ({
          id: d.item_id ?? d.itemId,
          name: d.name,
          description: d.description,
          price: d.price,
          image_url: d.image_url ?? d.imageUrl,
          is_available: d.is_available ?? d.isAvailable,
        })),
    }));

    return jsonResponse({
      categories: categorizedMenu,
      total_dishes: dishes.length,
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch menu");
  }
}
