import { NextResponse } from "next/server";
import acceptLanguage from "accept-language";
import { fallbackLng, languages } from "./i18n/settings";
import type { NextRequest } from "next/server";
import { generateCSP } from "@lib/cspScripts";
import { logMessage } from "@lib/logger";

acceptLanguage.languages(languages);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - img (public image files)
     * - static (public static files)
     * - react_devtools (React DevTools)
     */
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|img|static|react_devtools|unsupported-browser|javascript-disabled).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

const allowedOrigins = [process.env.NEXTAUTH_URL];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const searchParams = req.nextUrl.searchParams.toString();

  // Layer 0 - Set CORS on API routes
  if (pathname.startsWith("/api")) {
    // Response
    const response = NextResponse.next();

    // Allowed origins check
    const origin = req.headers.get("origin") ?? "";
    if (allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }

    // Set default CORS headers
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version"
    );
    response.headers.set("Access-Control-Max-Age", "86400"); // 60 * 60 * 24 = 24 hours;

    return response;
  }

  const pathLang = pathname.split("/")[1];
  const cookieLang = req.cookies.get("i18next")?.value;

  const requestHeaders = new Headers(req.headers);

  // Layer 1 - Redirect to language selector if app path is not provided

  if (languages.some((lang) => new RegExp(`^/${lang}/?$`).test(pathname))) {
    const redirect = NextResponse.redirect(new URL("/", req.url));
    // Set cookie on response back to browser so client can render correct language on client components
    redirect.cookies.set("i18next", pathLang);
    logMessage.debug(
      `Middleware - Redirecting to language selector: ${pathname} pathlang: ${pathLang} `
    );
    return redirect;
  }

  // Layer 2 - Redirect to url with locale if lng in path is not present or supported

  if (pathname !== "/" && !languages.some((loc) => new RegExp(`^/${loc}/.+$`).test(pathname))) {
    // Check to see if language cookie is present
    if (languages.some((lang) => lang === cookieLang)) {
      // Cookies language is already supported, redirect to that language
      logMessage.debug(
        `Middleware - Redirecting to cookie language: ${cookieLang}, pathname: ${pathname}`
      );

      return NextResponse.redirect(
        new URL(`/${cookieLang}${pathname}${searchParams && "?" + searchParams}`, req.url)
      );
    } else {
      // Redirect to fallback language
      logMessage.debug(`Middleware - Redirecting to fallback language: : ${pathname}`);
      return NextResponse.redirect(new URL(`/${fallbackLng}${pathname}`, req.url));
    }
  }

  // Layer 3 - Language Cookie Sync

  let cookieSyncRequired = false;
  if (pathLang && cookieLang !== pathLang) {
    logMessage.debug(`Middleware - Setting language cookie: ${cookieLang} for path: ${pathname}`);
    cookieSyncRequired = true;
  }

  // Layer 4 - Set Content Security Policy

  // Set the Content Security Policy (CSP) header
  const { csp, nonce } = generateCSP();
  if (process.env.NODE_ENV !== "development") {
    // Set the CSP header on the request to the server
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("content-security-policy", csp);
  }
  // Set path on request headers so we can access it in the app router
  requestHeaders.set("x-path", pathname);

  // Create base Next Response with CSP header and i18n cookie
  const response = NextResponse.next({
    headers: requestHeaders,
  });

  // Set the CSP header on the response to the browser on the built version of the app only
  if (process.env.NODE_ENV !== "development") response.headers.set("content-security-policy", csp);

  // From layer 3
  // Set cookie on response back to browser so client can render correct language on client components
  if (cookieSyncRequired) response.cookies.set("i18next", pathLang);

  return response;
}
