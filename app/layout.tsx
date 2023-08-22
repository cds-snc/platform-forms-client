import React from "react";
import { Metadata } from "next";

import "../styles/app.scss";

export const metadata: Metadata = {
  icons: [
    {
      rel: "shortcut icon",
      type: "image/x-icon",
      sizes: "32x32",
      url: "/favicon.ico",
    },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function Layout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-full flex-col">
          <div id="skip-link-container">
            <a href="#content" id="skip-link">
              Skip to main content
            </a>
          </div>

          <header>
            <div data-testid="fip" className="gc-fip">
              <div className="canada-flag">
                <a href="/" aria-label="">
                  <picture>
                    <img src={"/img/sig-blk-en.svg"} alt={""} className="max-h-[40px]" />
                  </picture>
                </a>
              </div>
            </div>
          </header>
          <div id="page-container">
            <main id="content">{children}</main>
          </div>

          <footer className="mt-16 flex-none border-0 bg-gray-100 lg:mt-10" data-testid="footer">
            <div className="flex flex-row items-center justify-between pb-5 pt-10 lg:flex-col lg:items-start lg:gap-4">
              <div></div>
              <div>
                <picture>
                  <img
                    className="h-10 lg:h-8"
                    alt="Symbol of the Government of Canada"
                    src="/img/wmms-blk.svg"
                  />
                </picture>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
