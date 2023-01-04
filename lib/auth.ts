import { unstable_getServerSession } from "next-auth/next";
import { Session, User } from "next-auth";
import {
  GetServerSidePropsResult,
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import jwt from "jsonwebtoken";
import { hasOwnProperty } from "./tsUtils";
import { TemporaryTokenPayload } from "./types";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { AccessControlError, createAbility } from "./privileges";
import { MongoAbility } from "@casl/ability";
import { localPathRegEx } from "@lib/validation";

interface ServerSidePropsAuthContext extends GetServerSidePropsContext {
  user: AuthContextUser;
}
interface AuthContextUser extends User {
  ability: MongoAbility;
}

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
 * @param innerFunction Next JS getServerSideProps resolver function
 * @returns Context with a 'user' object if there is a session detected
 */
export function requireAuthentication(
  innerFunction: (
    ctx: ServerSidePropsAuthContext
  ) => Promise<GetServerSidePropsResult<Record<string, unknown>>>
) {
  return async (
    context: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<Record<string, unknown>>> => {
    try {
      const session = await unstable_getServerSession(context.req, context.res, authOptions);

      if (!session) {
        // If no user, redirect to login
        return {
          redirect: {
            destination: `/${context.locale}/auth/login`,
            permanent: false,
          },
        };
      }

      if (!session.user.acceptableUse && !context.resolvedUrl?.startsWith("/auth/policy")) {
        // If they haven't agreed to Acceptable Use redirect to policy page for acceptance
        // If already on the policy page don't redirect, aka endless redirect loop.
        // Also check that the path is local and not an external URL
        return {
          redirect: {
            destination: `/${context.locale}/auth/policy?referer=${
              localPathRegEx.test(context.resolvedUrl || "") ? context.resolvedUrl : "/myforms"
            }`,
            permanent: false,
          },
        };
      }

      const innerFunctionProps = await innerFunction({
        user: { ...session.user, ability: createAbility(session.user.privileges) },
        ...context,
      }); // Continue on to call `getServerSideProps` logic
      if (hasOwnProperty(innerFunctionProps, "props")) {
        return {
          props: {
            ...(innerFunctionProps.props as Record<string, unknown>),
            user: { ...session.user },
          },
        };
      }

      return innerFunctionProps;
    } catch (e) {
      if (e instanceof AccessControlError) {
        return {
          redirect: {
            destination: `/${context.locale}/admin/unauthorized`,
            permanent: false,
          },
        };
      }
      throw e;
    }
  };
}

/**
 * Checks if session exists server side and if it belongs to a user
 * @param reqOrContext Request and Response Object
 * @returns session if exists otherwise null
 */
export const isAuthenticated = async ({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}): Promise<Session | null> => {
  const session = await unstable_getServerSession(req, res, authOptions);
  return session;
};

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
