import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { errorResponse, ApiError } from "@/lib/api-error";
import { serialize } from "@/lib/serialize";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> },
) {
  try {
    const auth = await authenticate(request);
    const { reservationId } = await params;
    const body = await request.json();

    const existing = await prisma.reservation.findUnique({
      where: { reservationId },
    });

    if (!existing) {
      throw new ApiError(404, "Reservation not found");
    }

    if (auth.role !== "admin" && existing.userId !== auth.userId) {
      throw new ApiError(403, "Not authorized to modify this reservation");
    }

    const data: Record<string, unknown> = {};

    if (body.reservation_date) data.reservationDate = new Date(body.reservation_date);
    if (body.reservation_time) data.reservationTime = body.reservation_time;
    if (body.party_size) data.partySize = body.party_size;
    if (body.special_requests !== undefined) data.specialRequests = body.special_requests;
    if (body.status) data.status = body.status;

    const reservation = await prisma.reservation.update({
      where: { reservationId },
      data,
      include: { user: true },
    });

    return NextResponse.json(serialize(reservation));
  } catch (error) {
    return errorResponse(error, "Failed to update reservation");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> },
) {
  try {
    const auth = await authenticate(request);
    const { reservationId } = await params;
    const body = await request.json();

    const existing = await prisma.reservation.findUnique({
      where: { reservationId },
    });

    if (!existing) {
      throw new ApiError(404, "Reservation not found");
    }

    if (auth.role !== "admin" && existing.userId !== auth.userId) {
      throw new ApiError(403, "Not authorized to modify this reservation");
    }

    const data: Record<string, unknown> = {};

    if (body.reservation_date) data.reservationDate = new Date(body.reservation_date);
    if (body.reservation_time) data.reservationTime = body.reservation_time;
    if (body.party_size) data.partySize = body.party_size;
    if (body.special_requests !== undefined) data.specialRequests = body.special_requests;
    if (body.status) data.status = body.status;

    const reservation = await prisma.reservation.update({
      where: { reservationId },
      data,
      include: { user: true },
    });

    return NextResponse.json(serialize(reservation));
  } catch (error) {
    return errorResponse(error, "Failed to partially update reservation");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> },
) {
  try {
    const auth = await authenticate(request);
    const { reservationId } = await params;

    const existing = await prisma.reservation.findUnique({
      where: { reservationId },
    });

    if (!existing) {
      throw new ApiError(404, "Reservation not found");
    }

    if (auth.role !== "admin" && existing.userId !== auth.userId) {
      throw new ApiError(403, "Not authorized to cancel this reservation");
    }

    await prisma.reservation.update({
      where: { reservationId },
      data: { status: "cancelled" },
      include: { user: true },
    });

    const updated = await prisma.reservation.findUnique({
      where: { reservationId },
      include: { user: true },
    });

    return NextResponse.json(serialize(updated));
  } catch (error) {
    return errorResponse(error, "Failed to delete reservation");
  }
}
