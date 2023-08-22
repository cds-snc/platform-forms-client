import { NextResponse, userAgent } from "next/server";
import acceptLanguage from "accept-language";
import { fallbackLng, languages } from "./app/i18n/settings";
import type { NextRequest } from "next/server";
import { generateCSP } from "@lib/cspScripts";
import { logMessage } from "@lib/logger";

acceptLanguage.languages(languages);

const cookieName = "i18next";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Content Security Policy needs to be first as it creates the NextResponse
  //const { csp } = generateCSP();
  const requestHeaders = new Headers(req.headers);
  // Set the CSP header so that `app-render` can read it and generate tags with the nonce
  //requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  //response.headers.set("content-security-policy", csp);

  /************************
   * Redirects
   ***********************/

  // Making sure we do not create an infinite ("redirect") loop when trying to load the logo on the unsupported browser page
  const imgPathRegEx = new RegExp(`/(img)/*`);
  if (imgPathRegEx.test(pathname)) {
    const { browser } = userAgent(req);
    if (browser.name?.toLocaleLowerCase() === "ie") {
      return NextResponse.rewrite(`${req.nextUrl.origin}/unsupported-browser.html`);
    }
  }

  // Internationalized Pages

  const interalRoute = new RegExp("/(api|_next/static|_next/image|favicon.ico|img|static).*");
  logMessage.debug(` Path: ${pathname} is I18N Internal Route = ${interalRoute.test(pathname)}`);

  if (!interalRoute.test(pathname) && pathname !== "/") {
    const locale = req.nextUrl.locale;
    logMessage.debug(
      `Middleware - i18n supported page detected: : pathname = ${pathname} , detected locale = ${locale}`
    );
    // Temporary check until we completely remove next-i18next with the /pages directory
    if (req.nextUrl.locale === "default") {
      const cookieLocale = req.cookies.get(cookieName)?.value;
      logMessage.debug(`Default locale detected - rewriting to ${cookieLocale}`);
      return NextResponse.redirect(
        new URL(`/${cookieLocale}${req.nextUrl.pathname}${req.nextUrl.search}`, req.url)
      );
    }

    let lng;
    if (req.cookies.has(cookieName)) lng = acceptLanguage.get(req.cookies.get(cookieName)?.value);
    if (!lng) lng = acceptLanguage.get(req.headers.get("Accept-Language"));
    if (!lng) lng = fallbackLng;

    // Redirect to fallback language if lng in path is not present or supported
    if (
      !languages.some((loc) => loc === locale) &&
      !languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`))
    ) {
      logMessage.debug(`Middleware - Redirecting to fallback language: : ${pathname}`);
      return NextResponse.redirect(new URL(`/${lng}${req.nextUrl.pathname}`, req.url));
    }
  }

  return response;
}
