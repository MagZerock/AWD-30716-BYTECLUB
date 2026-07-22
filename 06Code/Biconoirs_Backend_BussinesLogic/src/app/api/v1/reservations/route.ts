import { NextRequest } from "next/server"; import { jsonResponse } from "@/lib/json-response"; import { jsonResponse } from "@/lib/json-response";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { errorResponse, generateId } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await authenticate(request);
    const body = await request.json();

    const reservation = await prisma.reservation.create({
      data: {
        reservationId: generateId(),
        userId,
        reservationDate: new Date(body.reservation_date),
        reservationTime: body.reservation_time,
        partySize: body.party_size,
        specialRequests: body.special_requests ?? null,
        status: "pending",
      },
      include: { user: true },
    });

    return jsonResponse((reservation), { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to create reservation");
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);

    const where = auth.role === "admin" ? {} : { userId: auth.userId };

    const reservations = await prisma.reservation.findMany({
      where,
      include: { user: true },
      orderBy: { reservationDate: "desc" },
    });

    return jsonResponse((reservations));
  } catch (error) {
    return errorResponse(error, "Failed to fetch reservations");
  }
}
