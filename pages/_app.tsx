import "react-app-polyfill/stable";
import type { AppProps } from "next/app";
import React, { ReactElement, ReactNode } from "react";

import { appWithTranslation } from "next-i18next";
import type { NextPage } from "next";
import { SessionProvider } from "next-auth/react";
import { AccessControlProvider } from "@lib/hooks";
import DefaultLayout, { Layout } from "@components/globals/layouts/DefaultLayout";
import "../styles/app.scss";
import { AnyObject } from "@lib/types";
import { Session } from "next-auth";
import { ErrorBoundary, ErrorPanel } from "@components/globals";
import { Noto_Sans, Lato } from "next/font/google";

const notoSans = Noto_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

const lato = Lato({
  weight: ["400", "700"],
  variable: "--font-lato",
  subsets: ["latin"],
});

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
    <>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx global>{`
        html {
          font-family: ${notoSans.style.fontFamily};
        }
      `}</style>
      <SessionProvider
        session={session}
        // Re-fetch session every 30 minutes if no user activity
        refetchInterval={30 * 60}
        // Re-fetches session when window is focused
        refetchOnWindowFocus={true}
      >
        <div className={`${notoSans.variable} ${lato.variable} h-full`}>
          <ErrorBoundary
            fallback={
              <div className="h-full">
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
                <DefaultLayout showLanguageToggle={true}>
                  <ErrorBoundary>
                    <Component {...pageProps} />
                  </ErrorBoundary>
                </DefaultLayout>
              )}
            </AccessControlProvider>
          </ErrorBoundary>
        </div>
      </SessionProvider>
    </>
  );
};

export default appWithTranslation(MyApp);
