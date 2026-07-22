import { NextRequest } from "next/server";
import { layerA } from "@/lib/layer-a";
import { errorResponse, ApiError } from "@/lib/api-error";
import { jsonResponse } from "@/lib/json-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ dishId: string }> },
) {
  try {
    const { dishId } = await params;

    const dish = await layerA.get<any>(`/menu/dishes/${dishId}`);

    return jsonResponse(dish);
  } catch (error) {
    if (error instanceof Error && (error.message.includes("404") || error.message.includes("not found"))) {
      return errorResponse(new ApiError(404, "Dish not found"), "Dish not found");
    }
    return errorResponse(error, "Failed to fetch dish");
  }
}
