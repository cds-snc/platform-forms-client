import { getSession } from "next-auth/client";
import { GetServerSidePropsResult, GetServerSidePropsContext } from "next";
import { hasOwnProperty } from "./tsUtils";
import { ExtendedSession } from "./types";

export interface GetServerSidePropsAuthContext extends GetServerSidePropsContext {
  user?: Record<string, unknown>;
}
export function requireAuthentication(
  innerFunction: (
    ctx: GetServerSidePropsAuthContext
  ) => Promise<GetServerSidePropsResult<Record<string, unknown>>>
) {
  return async (
    context: GetServerSidePropsAuthContext
  ): Promise<GetServerSidePropsResult<Record<string, unknown>>> => {
    const session: ExtendedSession | null = await getSession(context);

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
          destination: `/${context.locale}/welcome-bienvenue/`,
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
