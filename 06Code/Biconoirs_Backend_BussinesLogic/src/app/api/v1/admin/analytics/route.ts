import { NextRequest } from "next/server"; import { jsonResponse } from "@/lib/json-response"; import { jsonResponse } from "@/lib/json-response";
import { prisma } from "@/lib/prisma";
import { authenticateAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    await authenticateAdmin(request);

    // Total revenue from all orders (excluding cancelled)
    const revenueAgg = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: "cancelled" } },
    });

    const totalRevenue = Number(revenueAgg._sum.totalAmount ?? 0);

    // Top-selling dishes using price_at_purchase
    const topDishes = await prisma.orderItem.groupBy({
      by: ["itemId"],
      _sum: { quantity: true },
      _avg: { priceAtPurchase: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    });

    const dishIds = topDishes
      .filter((d) => d.itemId)
      .map((d) => d.itemId!);

    const dishes = dishIds.length
      ? await prisma.menuItem.findMany({
          where: { itemId: { in: dishIds } },
          select: { itemId: true, name: true },
        })
      : [];

    const dishMap = new Map(dishes.map((d) => [d.itemId, d.name]));

    const topSellingDishes = topDishes.map((d) => ({
      item_id: d.itemId,
      name: d.itemId ? dishMap.get(d.itemId) ?? "Unknown" : "Unknown",
      total_quantity_sold: Number(d._sum.quantity ?? 0),
      avg_price: Number(Number(d._avg.priceAtPurchase ?? 0).toFixed(2)),
      revenue: Number(
        (
          Number(d._sum.quantity ?? 0) * Number(d._avg.priceAtPurchase ?? 0)
        ).toFixed(2),
      ),
    }));

    // Order counts by status
    const orderCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: { orderId: true },
    });

    const ordersByStatus = Object.fromEntries(
      orderCounts.map((o) => [o.status, o._count.orderId]),
    );

    return jsonResponse(({
      total_revenue: totalRevenue,
      top_selling_dishes: topSellingDishes,
      orders_by_status: ordersByStatus,
      total_orders: orderCounts.reduce((sum, o) => sum + o._count.orderId, 0),
    }));
  } catch (error) {
    return errorResponse(error, "Failed to fetch analytics");
  }
}
