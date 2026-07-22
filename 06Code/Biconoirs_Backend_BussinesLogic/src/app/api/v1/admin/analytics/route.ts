import { NextRequest } from "next/server";
import { jsonResponse } from "@/lib/json-response";
import { prisma } from "@/lib/prisma";
import { authenticateAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    await authenticateAdmin(request);

    const revenueAgg = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: "cancelled" } },
    });

    const totalRevenue = Number(revenueAgg._sum.totalAmount ?? 0);

    const topDishes = await prisma.orderItem.groupBy({
      by: ["itemId"],
      _sum: { quantity: true },
      _avg: { priceAtPurchase: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    });

    type TopDish = (typeof topDishes)[number];

    const dishIds = topDishes
      .filter((d: TopDish) => d.itemId !== null)
      .map((d: TopDish) => d.itemId as string);

    const dishes = dishIds.length
      ? await prisma.menuItem.findMany({
          where: { itemId: { in: dishIds } },
          select: { itemId: true, name: true },
        })
      : [];

    type Dish = (typeof dishes)[number];

    const dishMap = new Map<string, string>(
      dishes.map((d: Dish) => [d.itemId, d.name])
    );

    const topSellingDishes = topDishes.map((d: TopDish) => ({
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

    const orderCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: { orderId: true },
    });

    type OrderCount = (typeof orderCounts)[number];

    const ordersByStatus = Object.fromEntries(
      orderCounts.map((o: OrderCount) => [o.status, o._count.orderId]),
    );

    return jsonResponse(({
      total_revenue: totalRevenue,
      top_selling_dishes: topSellingDishes,
      orders_by_status: ordersByStatus,
      total_orders: orderCounts.reduce((sum: number, o: OrderCount) => sum + o._count.orderId, 0),
    }));
  } catch (error) {
    return errorResponse(error, "Failed to fetch analytics");
  }
}
