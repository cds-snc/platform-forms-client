import { NextResponse } from "next/server";
import acceptLanguage from "accept-language";
import { fallbackLng, languages } from "./i18n/settings";
import type { NextRequest } from "next/server";
import { generateCSP } from "@lib/cspScripts";
import { logMessage } from "@lib/logger";
import { NextAuthRequest } from "next-auth/lib";
import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth, { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

acceptLanguage.languages(languages);
const localPathRegEx = new RegExp("^(?!((?:[a-z+]+:)?//))", "i");

/**
 * We need to instantiate the NextAuth middleware to decrypt to token on the header.
 * The normal @lib/auth `auth` function cannot be used because it invokes Prisma which is not Edge runtime compatible.
 */
const { auth } = NextAuth({
  providers: [
    CredentialsProvider({
      id: "middleware",
      name: "Middleware",
      credentials: {},
      async authorize() {
        return null;
      },
    }),
  ],
  secret: process.env.TOKEN_SECRET,
  debug: process.env.NODE_ENV !== "production",
  callbacks: {
    async session(params) {
      const { session, token } = params as { session: Session; token: JWT };
      // Add info like 'role' to session object
      session.user = {
        id: token.userId ?? "",
        lastLoginTime: token.lastLoginTime,
        acceptableUse: token.acceptableUse ?? false,
        name: token.name ?? null,
        email: token.email,
        privileges: [],
        ...(token.newlyRegistered && { newlyRegistered: token.newlyRegistered }),
        // Used client side to immidiately log out a user if they have been deactivated
        ...(token.deactivated && { deactivated: token.deactivated }),
        hasSecurityQuestions: token.hasSecurityQuestions ?? false,
      };
      return session;
    },
  },
});

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
        "/((?!_next/static|_next/image|favicon.ico|img|static|react_devtools|unsupported-browser|javascript-disabled|__nextjs_).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "next-action" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

const allowedOrigins = [process.env.NEXTAUTH_URL];

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const searchParams = req.nextUrl.searchParams.toString();

  // Layer 0 - Set CORS on API routes

  const layer0 = setCORS(req, pathname);
  if (layer0) return layer0;

  const pathLang = pathname.split("/")[1];
  const cookieLang = req.cookies.get("i18next")?.value;

  // Layer 1 - Redirect to language selector if app path is not provided

  const layer1 = languageSelectorRedirect(req, pathname, pathLang);
  if (layer1) return layer1;

  // Layer 2 - Redirect to url with locale if lng in path is not present or supported

  const layer2 = addLangToPath(req, pathname, cookieLang, searchParams);
  if (layer2) return layer2;

  // Layer 3 - Language Cookie Sync

  const cookieSyncRequired = needCookieSync(pathLang, cookieLang, pathname);

  // Layer 4 - Auth Users Redirect

  const layer4 = authUsersRedirect(req, pathname, pathLang);
  if (layer4) return layer4;

  // Final Layer - Set Content Security Policy

  return setCSP(req, pathname, cookieSyncRequired, pathLang);
});

const setCORS = (req: NextRequest, pathname: string) => {
  // Response
  if (pathname.startsWith("/api")) {
    const response = NextResponse.next();

    // Allowed origins check
    const origin = req.headers.get("origin") ?? "";
    if (allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    } else {
      response.headers.set(
        "Access-Control-Allow-Origin",
        process.env.NEXTAUTH_URL ?? "MISSING ORIGIN URL IN .env FILE!"
      );
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
};

const languageSelectorRedirect = (req: NextRequest, pathname: string, pathLang: string) => {
  if (languages.some((lang) => new RegExp(`^/${lang}/?$`).test(pathname))) {
    const redirect = NextResponse.redirect(new URL("/", req.url));
    // Set cookie on response back to browser so client can render correct language on client components
    redirect.cookies.set("i18next", pathLang);
    logMessage.debug(
      `Middleware - Redirecting to language selector: ${pathname} pathlang: ${pathLang} `
    );
    return redirect;
  }
};

const addLangToPath = (
  req: NextRequest,
  pathname: string,
  cookieLang: string | undefined,
  searchParams: string
) => {
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
};

const needCookieSync = (pathLang: string, cookieLang: string | undefined, pathname: string) => {
  if (pathLang && cookieLang !== pathLang) {
    logMessage.debug(
      `Middleware - Setting language cookie from ${cookieLang} to ${pathLang} for path: ${pathname}`
    );
    return true;
  }

  return false;
};

const setCSP = (
  req: NextRequest,
  pathname: string,
  cookieSyncRequired: boolean,
  pathLang: string
) => {
  // Set the Content Security Policy (CSP) header
  const { csp, nonce } = generateCSP();
  const requestHeaders = new Headers(req.headers);
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
};

const authUsersRedirect = (req: NextAuthRequest, pathname: string, pathLang: string) => {
  const path = pathname.replace(`/${pathLang}/`, "/");

  const onAuthFlow = path.startsWith("/auth/mfa") || path.startsWith("/auth/restricted-access");

  const onSupport =
    path.startsWith("/support") || path.startsWith("/sla") || path.startsWith("/terms-of-use");

  const session = req.auth;

  const origin = req.nextUrl.origin;

  // Ignore if user is in the auth flow of MfA
  if (session && !onAuthFlow) {
    if (
      !session.user.hasSecurityQuestions &&
      !path.startsWith("/auth/setup-security-questions") &&
      // Let them access support related pages if having issues with Security Questions
      !onSupport
    ) {
      logMessage.debug(
        "Root Layout: User has not setup security questions, redirecting to setup-security-questions"
      );
      // check if user has setup security questions setup

      const securityQuestionsPage = new URL(`/${pathLang}/auth/setup-security-questions`, origin);
      return NextResponse.redirect(securityQuestionsPage);
    }
    // Redirect to policy page only if users aren't on the policy, support, or security questions page
    if (
      session.user.hasSecurityQuestions &&
      !session.user.acceptableUse &&
      !onSupport &&
      !path.startsWith("/auth/policy") &&
      // If they don't want to accept let them log out
      !path.startsWith("/auth/logout")
    ) {
      logMessage.debug(
        "Root Layout: User has not accepted the Acceptable Use Policy, redirecting to policy"
      );
      // If they haven't agreed to Acceptable Use redirect to policy page for acceptance
      // Also check that the path is local and not an external URL

      const acceptableUsePage = new URL(
        `/${pathLang}/auth/policy?referer=/${pathLang}${
          localPathRegEx.test(path) ? path : "/forms"
        }`,
        origin
      );
      return NextResponse.redirect(acceptableUsePage);
    }
  }
};
