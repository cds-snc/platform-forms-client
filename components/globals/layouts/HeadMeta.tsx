import Head from "next/head";
import React from "react";

const css = `
    a:active {
        box-shadow: none !important;
    }
`;

export const HeadMeta = () => {
  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta charSet="utf-8" />
      <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
      <style>{css}</style>
    </Head>
  );
};
