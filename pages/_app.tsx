import "react-app-polyfill/stable";
import type { AppProps } from "next/app";
import "../wdyr";
import React, { ReactElement, ReactNode } from "react";

import { appWithTranslation } from "next-i18next";
import type { NextPage } from "next";
import { SessionProvider } from "next-auth/react";
import { AccessControlProvider } from "@lib/hooks";
import BaseLayout, { Layout } from "@components/globals/layouts/BaseLayout";
import "../styles/app.scss";
import { AnyObject } from "@lib/types";
import { Session } from "next-auth";
import { ErrorBoundary, ErrorPanel } from "@components/globals";

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
  whyDidYouRender?: boolean;
};

type AppPropsWithLayout = AppProps<AnyObject & { session?: Session }> & {
  Component: NextPageWithLayout;
};

const MyApp: React.FC<AppPropsWithLayout> = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  Component.whyDidYouRender = true;
  return (
    <SessionProvider
      session={session}
      // Re-fetch session every 30 minutes if no user activity
      refetchInterval={30 * 60}
      // Re-fetches session when window is focused
      refetchOnWindowFocus={true}
    >
      <ErrorBoundary
        fallback={
          <div className="flex flex-col h-full">
            <Layout className="flex flex-col items-center justify-center">
              <ErrorPanel />
            </Layout>
          </div>
        }
      >
        <AccessControlProvider>
          {Component.getLayout ? (
            <ErrorBoundary>{Component.getLayout(<Component {...pageProps} />)}</ErrorBoundary>
          ) : (
            <BaseLayout>
              <ErrorBoundary>
                <Component {...pageProps} />
              </ErrorBoundary>
            </BaseLayout>
          )}
        </AccessControlProvider>
      </ErrorBoundary>
    </SessionProvider>
  );
};

MyApp.whyDidYouRender = true;

export default appWithTranslation(MyApp);
