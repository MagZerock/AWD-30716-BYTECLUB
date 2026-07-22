import { NextRequest } from "next/server";
import { jsonResponse } from "@/lib/json-response";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-error";

export async function GET(_request: NextRequest) {
  try {
    const [revenueAgg, pendingCount, totalCustomers, totalOrders] =
      await Promise.all([
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: { not: "cancelled" } },
        }),
        prisma.order.count({ where: { status: "pending" } }),
        prisma.user.count(),
        prisma.order.count(),
      ]);

    return jsonResponse(({
      totalOrders,
      totalRevenue: Number(revenueAgg._sum.totalAmount ?? 0),
      pendingOrders: pendingCount,
      totalCustomers,
    }));
  } catch (error) {
    return errorResponse(error, "Failed to fetch stats");
  }
}
