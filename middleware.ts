import { NextRequest, NextResponse } from "next/server";
// only to test
export function middleware(req: NextRequest) {
  if (
    req.nextUrl.pathname.match(
      /^\/(?:en|fr)?\/?(?:(admin|id|api|auth|signup|myforms|not-supported|terms-avis|index|404|js-disabled|form-builder|sla|unlock-publishing|changelog|static|_next|img)(?:\/[\w-]+)*)?(?:\/.*)?$/
    )
  ) {
    return NextResponse.next();
  } else {
    // should display 404 page
    return NextResponse.rewrite(`${req.nextUrl.origin}/invalid`);
  }
}
