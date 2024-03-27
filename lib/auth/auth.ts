import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import jwt from "jsonwebtoken";
import { TemporaryTokenPayload } from "../types";

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
