import { getSession } from "next-auth/client";
import { GetServerSidePropsResult, GetServerSidePropsContext } from "next";

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
    const session = await getSession(context);

    if (!session) {
      // If no user, redirect to login
      return {
        props: {},
        redirect: {
          destination: `/${context.locale}/admin/login/`,
          permanent: false,
        },
      };
    }

    context.user = { ...session.user };

    return innerFunction(context); // Continue on to call `getServerSideProps` logic
  };
}
