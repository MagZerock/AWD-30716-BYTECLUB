import { NextResponse } from "next/server";

function bigintReplacer(_key: string, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}

export function jsonResponse(data: unknown, init?: ResponseInit): NextResponse {
  const body = JSON.stringify(data, bigintReplacer);
  const response = new NextResponse(body, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  return response;
}
