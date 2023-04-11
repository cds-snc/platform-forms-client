import { NextRequest, NextResponse, userAgent } from "next/server";

export function middleware(req: NextRequest) {
  const browserNameList = ["internet explorer 11", "ie11", "ie"];
  if (req.nextUrl.pathname.match(/\/(id.+)/)) {
    const { browser } = userAgent(req);
    if (browser.name && browserNameList.includes(browser.name.toLowerCase())) {
      return NextResponse.rewrite(`${req.nextUrl.origin}/not-supported`);
    }
  }
  return NextResponse.next();
}
