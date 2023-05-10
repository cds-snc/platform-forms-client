import { NextRequest, NextResponse, userAgent } from "next/server";

export function middleware(req: NextRequest) {
  const browserNameList = ["internet explorer 11", "ie11", "ie"];
  if (req.nextUrl.pathname.match(/\/(id.+)/)) {
    const { browser } = userAgent(req);
    if (browser.name && browserNameList.includes(browser.name.toLowerCase())) {
      return NextResponse.redirect(
        `${req.nextUrl.origin}/not-supported?referer=${req.nextUrl.origin}${req.nextUrl.pathname}`
      );
    }
  }
  return NextResponse.next();
}
