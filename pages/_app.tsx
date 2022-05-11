import "react-app-polyfill/stable";
import type { AppProps } from "next/app";
import React from "react";

import { appWithTranslation } from "next-i18next";
import { SessionProvider } from "next-auth/react";
import Base from "../components/globals/Base";
import "../styles/app.scss";
import i18nextConfig from "../next-i18next.config";

/*
This component disables SSR when in testing mode.
This is because in Cypress we're manipulating and mocking the API response calls
and the SSR pages were not matching the React rendered pages (rendered with different props)
which generates a warning in the browser console.
*/

const SafeHydrate = ({ children }: { children: React.ReactNode }) => {
  return (
    <div suppressHydrationWarning={Boolean(process.env.ISOLATED_INSTANCE)}>
      {typeof window === "undefined" && process.env.ISOLATED_INSTANCE ? null : children}
    </div>
  );
};

const MyApp: React.FunctionComponent<AppProps> = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) => {
  return (
    <SessionProvider
      session={session}
      // Re-fetch session every 30 minutes
      refetchInterval={30 * 60}
      // Re-fetches session when window is focused
      refetchOnWindowFocus={true}
    >
      <SafeHydrate>
        <Base>
          <Component {...pageProps} />
        </Base>
      </SafeHydrate>
    </SessionProvider>
  );
};

export default appWithTranslation(MyApp, i18nextConfig);
