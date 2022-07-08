import { NextRequest, NextResponse } from "next/server";

const middleware = (req: NextRequest) => {
  const browser = req.ua?.browser.name;

  const url = req.nextUrl;

  if (browser == "Internet Explorer") {
    return NextResponse.rewrite(`${url.origin}/not-supported`);
  }
};
export default middleware;
