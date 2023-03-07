import "react-app-polyfill/stable";
import type { AppProps } from "next/app";
import React, { ReactElement, ReactNode } from "react";

import { appWithTranslation } from "next-i18next";
import type { NextPage } from "next";
import { SessionProvider } from "next-auth/react";
import { AccessControlProvider } from "@lib/hooks";
import BaseLayout from "@components/globals/layouts/BaseLayout";
import "../styles/app.scss";
import { AnyObject } from "@lib/types";
import { Session } from "next-auth";

/*
This component disables SSR when in testing mode.
This is because in Cypress we're manipulating and mocking the API response calls
and the SSR pages were not matching the React rendered pages (rendered with different props)
which generates a warning in the browser console.
*/

const SafeHydrate = ({ children }: { children: React.ReactNode }) => {
  return (
    <div id="safeHydrate" suppressHydrationWarning={Boolean(process.env.APP_ENV === "test")}>
      {typeof window === "undefined" && process.env.APP_ENV === "test" ? null : children}
    </div>
  );
};

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps<AnyObject & { session?: Session }> & {
  Component: NextPageWithLayout;
};

const MyApp: React.FC<AppPropsWithLayout> = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  return (
    <SessionProvider
      session={session}
      // Re-fetch session every 30 minutes if no user activity
      refetchInterval={30 * 60}
      // Re-fetches session when window is focused
      refetchOnWindowFocus={true}
    >
      <AccessControlProvider>
        <SafeHydrate>
          {Component.getLayout ? (
            Component.getLayout(<Component {...pageProps} />)
          ) : (
            <BaseLayout>
              <Component {...pageProps} />
            </BaseLayout>
          )}
        </SafeHydrate>
      </AccessControlProvider>
    </SessionProvider>
  );
};

export default appWithTranslation(MyApp);
