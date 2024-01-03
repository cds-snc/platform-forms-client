import { type NextRequest, NextResponse } from "next/server";
import { checkOne } from "@lib/cache/flags";
import { MiddlewareProps } from "@lib/types";

export const GET = async (req: NextRequest, props: MiddlewareProps): Promise<NextResponse> => {
  const key = props.context?.params?.key;

  if (Array.isArray(key) || !key) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const status = await checkOne(key);
  return NextResponse.json({ status });
};
