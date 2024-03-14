import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { serverTranslation } from "@i18n";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import jwt from "jsonwebtoken";
import { TemporaryTokenPayload } from "../types";
import { AccessControlError, createAbility } from "../privileges";
import { logMessage } from "@lib/logger";

// Helpful to check whether a referer is local vs. an external URL
// Note: a negated version of https://stackoverflow.com/questions/10687099/how-to-test-if-a-url-string-is-absolute-or-relative
export const localPathRegEx = new RegExp("^(?!((?:[a-z+]+:)?//))", "i");

/**
 * Enum used to record Logging action events
 */
export enum LoggingAction {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  LOCKED = "LOCKED",
}

/**
 * Verifies if their is a session and redirects user as required.
 * @returns Context with a 'user' object if there is a session detected
 */
export async function requireAuthentication() {
  const {
    i18n: { language: locale },
  } = await serverTranslation();
  try {
    const session = await auth();
    const headersList = headers();
    const currentPath = headersList.get("x-path")?.replace(`/${locale}`, "") ?? "";

    if (!session) {
      // If no user, redirect to login
      logMessage.debug("requireAuthentication: No session detected, redirecting to login");
      redirect(`/${locale}/auth/login`);
    }

    if (session.user.deactivated) {
      logMessage.debug(
        "requireAuthentication: User is deactivated, redirecting to account-deactivated"
      );
      redirect(`/${locale}/auth/account-deactivated`);
    }

    if (
      !session.user.hasSecurityQuestions &&
      !currentPath.startsWith("/auth/setup-security-questions") &&
      // Let them access the support page if having issues with Security Questions
      !currentPath.startsWith("/support")
    ) {
      // check if user has setup security questions setup
      logMessage.debug(
        "requireAuthentication: User has not setup security questions, redirecting to setup-security-questions"
      );
      redirect(`/${locale}/auth/setup-security-questions`);
    }
    // Redirect to policy page only if users aren't on the policy or security questions page
    if (
      session.user.hasSecurityQuestions &&
      !session.user.acceptableUse &&
      !currentPath.startsWith("/auth/policy") &&
      !currentPath.startsWith("/auth/setup-security-questions") &&
      // If they don't want to accept let them log out
      !currentPath.startsWith("/auth/logout")
    ) {
      logMessage.debug(
        "requireAuthentication: User has not accepted the Acceptable Use Policy, redirecting to policy"
      );
      // If they haven't agreed to Acceptable Use redirect to policy page for acceptance
      // If already on the policy page don't redirect, aka endless redirect loop.
      // Also check that the path is local and not an external URL
      redirect(
        `/${locale}/auth/policy?referer=${
          currentPath && localPathRegEx.test(currentPath) ? currentPath : "/forms"
        }`
      );
    }

    return { user: { ...session.user, ability: createAbility(session) } };
  } catch (e) {
    if (e instanceof AccessControlError) {
      redirect(`/${locale}/admin/unauthorized`);
    }
    throw e;
  }
}

/**
 * Verifies a temporary token against the database
 * @param token string of temporary token
 * @returns a user or null if token / user is inactive
 */
export const validateTemporaryToken = async (token: string) => {
  try {
    const { email, formID } = jwt.verify(
      token,
      process.env.TOKEN_SECRET || ""
    ) as TemporaryTokenPayload;

    const user = await prisma.apiUser
      .findUnique({
        where: {
          templateId_email: {
            email,
            templateId: formID,
          },
        },
        select: {
          id: true,
          templateId: true,
          email: true,
          active: true,
          temporaryToken: true,
        },
      })
      .catch((e) => prismaErrors(e, null));

    // The token could be valid but user has been made inactive since
    if (!user?.active) return null;
    // The user has reset the token rendering old tokens invalid
    if (user.temporaryToken !== token) return null;
    // The user and token are valid
    return user;
  } catch (error) {
    return null;
  }
};
