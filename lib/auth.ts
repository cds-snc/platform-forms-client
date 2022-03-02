import { getSession, GetSessionOptions } from "next-auth/client";
import { Session } from "next-auth";
import { GetServerSidePropsResult, GetServerSidePropsContext } from "next";
import { hasOwnProperty } from "./tsUtils";

export interface GetServerSidePropsAuthContext extends GetServerSidePropsContext {
  user?: Record<string, unknown>;
}

/**
 * Verifies if their is a session and redirects user as required.
 * @param innerFunction Next JS getServerSideProps resolver function
 * @returns Context with a 'user' object if there is a session detected
 */
export function requireAuthentication(
  innerFunction: (
    ctx: GetServerSidePropsAuthContext
  ) => Promise<GetServerSidePropsResult<Record<string, unknown>>>
) {
  return async (
    context: GetServerSidePropsAuthContext
  ): Promise<GetServerSidePropsResult<Record<string, unknown>>> => {
    const session = await getSession(context);

    if (!session) {
      // If no user, redirect to login
      return {
        redirect: {
          destination: `/${context.locale}/admin/login/`,
          permanent: false,
        },
      };
    }

    if (!session.user?.admin) {
      return {
        redirect: {
          destination: `/${context.locale}/admin/unauthorized/`,
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
 * Checks if session exists and if it belongs to a user with administrative priveleges
 * @param reqOrContext Request or Context Object
 * @returns session if exists otherwise null
 */
export const isAdmin = async (reqOrContext?: GetSessionOptions): Promise<Session | null> => {
  // If server side, 'req' must be passed to getSession
  const session = reqOrContext ? await getSession(reqOrContext) : await getSession();
  if (session && session.user?.admin) {
    return session;
  }
  return null;
};
