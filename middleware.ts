import { NextRequest, NextResponse, userAgent } from "next/server";

export function middleware(req: NextRequest) {
  // Making sure we do not create an infinite ("redirect") loop when trying to load the logo on the unsupported browser page
  if (!req.nextUrl.pathname.includes("/img")) {
    const { browser } = userAgent(req);
    if (browser.name?.toLocaleLowerCase() === "ie") {
      return NextResponse.rewrite(`${req.nextUrl.origin}/unsupported-browser.html`);
    }
  }

  return NextResponse.next();
}
