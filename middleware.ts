import { NextResponse, userAgent } from "next/server";
import acceptLanguage from "accept-language";
import { fallbackLng, languages } from "./app/i18n/settings";
import type { NextRequest } from "next/server";
import { generateCSP } from "@lib/cspScripts";
import { logMessage } from "@lib/logger";

acceptLanguage.languages(languages);

export function middleware(req: NextRequest) {
  const interalRoute = new RegExp("/(api|_next/static|_next/image|favicon.ico|img|static).*");
  const pathname = req.nextUrl.pathname;

  // Making sure we do not create an infinite ("redirect") loop when trying to load the logo on the unsupported browser page
  const imgPathRegEx = new RegExp(`/(img)/*`);
  if (imgPathRegEx.test(pathname)) {
    const { browser } = userAgent(req);
    if (browser.name?.toLocaleLowerCase() === "ie") {
      return NextResponse.rewrite(`${req.nextUrl.origin}/unsupported-browser.html`);
    }
  }

  if (!interalRoute.test(pathname)) {
    // Redirect to fallback language if lng in path is not present or supported
    if (pathname !== "/" && !languages.some((loc) => pathname.startsWith(`/${loc}`))) {
      logMessage.debug(`Middleware - Redirecting to fallback language: : ${pathname}`);
      return NextResponse.redirect(new URL(`/${fallbackLng}${pathname}`, req.url));
    }

    // Set the Content Security Policy (CSP) header
    const { csp, nonce } = generateCSP();

    const requestHeaders = new Headers(req.headers);

    // Set the CSP header on the request to the server
    requestHeaders.set("content-security-policy", csp);

    const response = NextResponse.next({
      headers: requestHeaders,
    });

    logMessage.info(`Added nonce: ${nonce} for path: ${req.nextUrl.pathname}`);

    // Set the CSP header on the response to the browser
    response.headers.set("content-security-policy", csp);

    return response;
  }

  return NextResponse.next();
}
