import { type NextRequest, NextResponse } from "next/server";
import { checkOne } from "@lib/cache/flags";

export const GET = async (
  req: NextRequest,
  { params }: { params: Record<string, string> }
): Promise<NextResponse> => {
  const key = params.key;

  if (Array.isArray(key) || !key) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const status = await checkOne(key);
  return NextResponse.json({ status });
};
