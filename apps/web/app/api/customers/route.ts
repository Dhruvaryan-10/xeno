import type { NextRequest } from "next/server";
import { allCustomers } from "@/lib/server/customers";
import { handle } from "@/lib/server/http";

export function GET(request: NextRequest) {
  return handle(async () => {
    const take = Math.min(Math.max(Number(request.nextUrl.searchParams.get("take")) || 25, 1), 100);
    return allCustomers().slice(0, take);
  });
}
