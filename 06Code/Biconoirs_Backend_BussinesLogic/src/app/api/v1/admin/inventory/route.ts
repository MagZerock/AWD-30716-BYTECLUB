import { NextRequest, NextResponse } from "next/server";
import { layerA } from "@/lib/layer-a";
import { authenticateAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    await authenticateAdmin(request);

    const inventory = await layerA.get<any[]>("/inventory");

    return NextResponse.json(inventory);
  } catch (error) {
    return errorResponse(error, "Failed to fetch inventory");
  }
}

export async function POST(request: NextRequest) {
  try {
    await authenticateAdmin(request);
    const body = await request.json();

    const result = await layerA.post("/inventory", body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to create inventory item");
  }
}

export async function PUT(request: NextRequest) {
  try {
    await authenticateAdmin(request);
    const body = await request.json();
    const inventoryId = body.inventory_id ?? body.inventoryId;

    if (!inventoryId) {
      return NextResponse.json(
        { error: "inventory_id is required" },
        { status: 400 },
      );
    }

    const result = await layerA.put(`/inventory/${inventoryId}`, body);

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error, "Failed to update inventory");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await authenticateAdmin(request);
    const body = await request.json();
    const inventoryId = body.inventory_id ?? body.inventoryId;

    if (!inventoryId) {
      return NextResponse.json(
        { error: "inventory_id is required" },
        { status: 400 },
      );
    }

    const result = await layerA.patch(`/inventory/${inventoryId}`, body);

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error, "Failed to partially update inventory");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await authenticateAdmin(request);
    const body = await request.json();
    const inventoryId = body.inventory_id ?? body.inventoryId;

    if (!inventoryId) {
      return NextResponse.json(
        { error: "inventory_id is required" },
        { status: 400 },
      );
    }

    await layerA.delete(`/inventory/${inventoryId}`);

    return NextResponse.json({ message: "Inventory item deleted" });
  } catch (error) {
    return errorResponse(error, "Failed to delete inventory");
  }
}
