"use client";

import "../styles/app.scss";
import "react-app-polyfill/stable";
import { Noto_Sans, Lato } from "next/font/google";
import { logMessage } from "@lib/logger";
import { useEffect } from "react";

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

// In the very unlikely event, this should catch errors thrown from the root layout.tsx
// Other cases: router error
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logMessage.error(`Global Error Handler Reached: ${(error as Error).message}`);
  }, [error]);

  // TODO: localization, design and testing

  return (
    <html lang="en" dir="ltr" className={`${notoSans.variable} ${lato.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <title>Something went wrong!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
      </head>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
