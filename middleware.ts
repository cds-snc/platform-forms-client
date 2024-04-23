import { NextResponse } from "next/server";
import { fallbackLng, languages } from "./i18n/settings";
import type { NextRequest } from "next/server";
import { generateCSP } from "@lib/cspScripts";
import { logMessage } from "@lib/logger";
import { NextAuthRequest } from "next-auth/lib";
import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth, { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

const localPathRegEx = new RegExp("^(?!((?:[a-z+]+:)?//))", "i");

const verboseDebug = false;

const debugLogger = async (message: string) => {
  if (verboseDebug) {
    logMessage.debug(message);
  }
};

/**
 * We need to instantiate the NextAuth middleware to decrypt the token on the header.
 * The normal @lib/auth `auth` function can not be used because it invokes Prisma which is not Edge runtime compatible.
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
  // When building the app use a random UUID as the token secret
  secret: process.env.TOKEN_SECRET ?? crypto.randomUUID(),
  debug: process.env.NODE_ENV !== "production",
  trustHost: process.env.AUTH_URL ? false : true,
  callbacks: {
    async session(params) {
      const { session, token } = params as { session: Session; token: JWT };

      // Copy token contents into session for middleware
      session.user = {
        id: token.userId ?? "",
        lastLoginTime: token.lastLoginTime,
        acceptableUse: token.acceptableUse ?? false,
        name: token.name ?? null,
        email: token.email,
        privileges: [],
        ...(token.newlyRegistered && { newlyRegistered: token.newlyRegistered }),
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

  // Layer 3 - Pages with Required Auth
  const layer3 = pageRequiresAuth(req, pathname, pathLang);
  if (layer3) return layer3;

  // Layer 4 - Auth Users Redirect

  const layer4 = authFlowRedirect(req, pathname, pathLang, cookieLang);
  if (layer4) return layer4;

  // Final Layer - Set Content Security Policy

  return setCSP(req, pathname, cookieLang, pathLang);
});

/**
 *************************
 * LAYERS                *
 *************************
 */

/**
 * Set the CORS headers on API routes
 */

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

    debugLogger(`Middleware Action: Setting CORS on API route: ${pathname}`);

    return response;
  }
};

/**
 * Redirect to the language selection page if `/en` or /fr` is the page path
 */
const languageSelectorRedirect = (req: NextRequest, pathname: string, pathLang: string) => {
  if (languages.some((lang) => new RegExp(`^/${lang}/?$`).test(pathname))) {
    const redirect = NextResponse.redirect(new URL("/", req.url));
    // Set cookie on response back to browser so client can render correct language on client components
    redirect.cookies.set("i18next", pathLang);
    debugLogger(
      `Middleware Action: Redirecting to language selector: ${pathname} pathlang: ${pathLang} `
    );
    return redirect;
  }
};

/**
 * Ensure the the language param is always in the path.
 * Set the language param using the cookie language if param is missing or not supported.
 */
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
        `Middleware Action: Adding language to path: ${cookieLang}, pathname: ${pathname}`
      );

      return NextResponse.redirect(
        new URL(`/${cookieLang}${pathname}${searchParams && "?" + searchParams}`, req.url)
      );
    } else {
      // Redirect to fallback language
      debugLogger(`Middleware Action: Adding default language to path:  ${pathname}`);
      return NextResponse.redirect(new URL(`/${fallbackLng}${pathname}`, req.url));
    }
  }
};

/**
 * Set the Content Security Policy
 */
const setCSP = (
  req: NextRequest,
  pathname: string,
  cookieLang: string | undefined,
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

  // Set cookie on response back to browser so client can render correct language on client components
  if (pathLang && cookieLang !== pathLang) response.cookies.set("i18next", pathLang);

  return response;
};

/**
 * Handles the redirection of users in the authentication flow
 */
const authFlowRedirect = (
  req: NextAuthRequest,
  pathname: string,
  pathLang: string | undefined,
  cookieLang: string | undefined
) => {
  const path = pathname.replace(`/${pathLang}/`, "/");

  const lang = pathLang || cookieLang || fallbackLng;

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
        "Middlware Action: User has not setup security questions, redirecting to setup-security-questions"
      );
      // check if user has setup security questions setup

      const securityQuestionsPage = new URL(`/${lang}/auth/setup-security-questions`, origin);
      debugLogger(`Middleware: Redirecting to ${securityQuestionsPage}`);
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
      debugLogger(
        "Middleware Action: User has not accepted the Acceptable Use Policy, redirecting to policy"
      );
      // If they haven't agreed to Acceptable Use redirect to policy page for acceptance
      // Also check that the path is local and not an external URL

      const acceptableUsePage = new URL(
        `/${lang}/auth/policy?referer=/${lang}${localPathRegEx.test(path) ? path : "/forms"}`,
        origin
      );
      return NextResponse.redirect(acceptableUsePage);
    }
  }
};

/**
 * Ensures that a user visiting a page that requires authentication
 * is redirected to the login page if they are not authenticated
 */
const pageRequiresAuth = (req: NextAuthRequest, pathname: string, pathLang: string) => {
  const path = pathname.replace(`/${pathLang}/`, "/");
  const session = req.auth;

  const pathsRequiringAuth = [
    "/admin",
    "/forms",
    "/unlock-publishing",
    "/profile",
    "/auth/setup-security-questions",
    "/auth/policy",
    "/auth/account-created",
  ];

  const onProtectedPath = pathsRequiringAuth.find((protectedPath) => {
    // If the path is the same as the protected path or it starts with the protected path
    if (path === protectedPath) return true;
    return path.startsWith(protectedPath);
  });

  if (!session && onProtectedPath) {
    debugLogger(`Middleware Action: Redirecting unauthenticated user to login page from ${path}`);
    const login = new URL(`/${pathLang}/auth/login`, req.nextUrl.origin);
    return NextResponse.redirect(login);
  }
};
