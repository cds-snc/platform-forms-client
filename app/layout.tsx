import { dir } from "i18next";
import { languages } from "./i18n/settings";
import "react-app-polyfill/stable";
import "../../styles/app.scss";
import { Metadata } from "next";
import { logMessage } from "@lib/logger";

export async function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
};

export default async function Layout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  logMessage.debug("Layout", { lang });
  return (
    <html lang={lang} dir={dir(lang)}>
      <head />
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
