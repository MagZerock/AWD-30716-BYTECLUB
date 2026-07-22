import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorResponse(error: unknown, defaultMessage = "Internal server error") {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error("Unhandled error:", error);

  return NextResponse.json(
    { error: defaultMessage },
    { status: 500 },
  );
}

export function generateId(): string {
  return uuidv4();
}
