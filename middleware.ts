import { NextResponse, userAgent } from "next/server";
import acceptLanguage from "accept-language";
import { fallbackLng, languages } from "./app/i18n/settings";
import type { NextRequest } from "next/server";
import { generateCSP } from "@lib/cspScripts";
import { logMessage } from "@lib/logger";

acceptLanguage.languages(languages);

export function middleware(req: NextRequest) {
  // Content Security Policy needs to be first as it creates the NextResponse

  const requestHeaders = new Headers(req.headers);
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (process.env.NODE_ENV === "production") {
    const { csp, nonce } = generateCSP();

    // Set the CSP header so that `app-render` can read it and generate tags with the nonce
    requestHeaders.set("content-security-policy", csp);

    // Set the nonce on the request header so that /pages can access
    requestHeaders.set("x-nonce", nonce);

    response.headers.set("content-security-policy", csp);
  }

  /************************
   * Redirects
   ***********************/

  const pathname = req.nextUrl.pathname;

  // Making sure we do not create an infinite ("redirect") loop when trying to load the logo on the unsupported browser page
  const imgPathRegEx = new RegExp(`/(img)/*`);
  if (imgPathRegEx.test(pathname)) {
    const { browser } = userAgent(req);
    if (browser.name?.toLocaleLowerCase() === "ie") {
      return NextResponse.rewrite(`${req.nextUrl.origin}/unsupported-browser.html`);
    }
  }

  // Reroute to internationalize page is no language is set in the path

  const interalRoute = new RegExp("/(api|_next/static|_next/image|favicon.ico|img|static).*");

  if (!interalRoute.test(pathname) && pathname !== "/") {
    // Redirect to fallback language if lng in path is not present or supported
    if (!languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`))) {
      logMessage.debug(`Middleware - Redirecting to fallback language: : ${pathname}`);
      return NextResponse.redirect(new URL(`/${fallbackLng}${req.nextUrl.pathname}`, req.url));
    }
  }

  return response;
}
