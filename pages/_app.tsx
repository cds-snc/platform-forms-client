import "react-app-polyfill/stable";
import type { AppProps } from "next/app";
import React, { ReactElement, ReactNode } from "react";

import { appWithTranslation } from "next-i18next";
import type { NextPage } from "next";
import { SessionProvider } from "next-auth/react";
import { AccessControlProvider } from "@lib/hooks";
import BaseLayout from "@components/globals/layouts/BaseLayout";
import "../styles/app.scss";

/*
This component disables SSR when in testing mode.
This is because in Cypress we're manipulating and mocking the API response calls
and the SSR pages were not matching the React rendered pages (rendered with different props)
which generates a warning in the browser console.
*/

const SafeHydrate = ({ children }: { children: React.ReactNode }) => {
  const isTestEnv = Boolean(process.env.APP_ENV === "test");
  return (
    <div id="safeHydrate" suppressHydrationWarning={isTestEnv}>
      {/* in test mode avoid Next JS dialog overlay */}
      {isTestEnv && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
        window.addEventListener('error', event => {
          event.stopImmediatePropagation()
        })
      
        window.addEventListener('unhandledrejection', event => {
          event.stopImmediatePropagation()
        })
    `,
          }}
        />
      )}
      {typeof window === "undefined" ? null : children}
    </div>
  );
};

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
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
