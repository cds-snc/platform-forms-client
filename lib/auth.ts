import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
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
import { UserRole } from "./types/user-types";

export interface GetServerSidePropsAuthContext extends GetServerSidePropsContext {
  user?: Record<string, unknown>;
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
    ctx: GetServerSidePropsAuthContext
  ) => Promise<GetServerSidePropsResult<Record<string, unknown>>>,
  authRole: UserRole
) {
  return async (
    context: GetServerSidePropsAuthContext
  ): Promise<GetServerSidePropsResult<Record<string, unknown>>> => {
    const session = await getServerSession(context, authOptions);

    if (!session) {
      // If no user, redirect to login
      return {
        redirect: {
          destination: `/${context.locale}${loginUrl(authRole)}`,
          permanent: false,
        },
      };
    }

    if (session.user.role !== authRole) {
      // If improper credentials, redirect to unauthorized page
      return {
        redirect: {
          destination: `/${context.locale}${unauthorizedUrl(authRole)}`,
          permanent: false,
        },
      };
    }

    context.user = { ...session.user };

    const innerFunctionProps = await innerFunction(context); // Continue on to call `getServerSideProps` logic
    if (hasOwnProperty(innerFunctionProps, "props")) {
      return { props: { ...innerFunctionProps.props, user: { ...session.user } } };
    }

    return innerFunctionProps;
  };
}

/**
 * Checks if session exists server side and if it belongs to a user with administrative priveleges
 * @param reqOrContext Request and Response Object
 * @returns session if exists otherwise null
 */
export const isAdmin = async ({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}): Promise<Session | null> => {
  const session = await getServerSession({ req, res }, authOptions);
  return session?.user.role === UserRole.Administrator ? session : null;
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

    const user = await prisma.formUser.findUnique({
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
    });

    // The token could be valid but user has been made inactive since
    if (!user?.active) return null;
    // The user has reset the token rendering old tokens invalid
    if (user.temporaryToken !== token) return null;
    // The user and token are valid
    return user;
  } catch (error) {
    return prismaErrors(error, null);
  }
};

/**
 * Returns the URL for the page if the user is not logged in
 * @param authRole string of the authRole from the current session
 * @returns string for the url
 */
const loginUrl = (authRole: UserRole): string => {
  switch (authRole) {
    case UserRole.Administrator:
      return "/admin/login/";
    case UserRole.ProgramAdministrator:
    default:
      return "/auth/login/";
  }
};

/**
 * Returns the URL for the page if the user is unauthorized
 * @param authRole string of the authRole from the current session
 * @returns string for the url
 */
const unauthorizedUrl = (authRole: UserRole): string => {
  switch (authRole) {
    case UserRole.Administrator:
      return "/admin/unauthorized/";
    case UserRole.ProgramAdministrator:
    default:
      return "/auth/unauthorized/";
  }
};
