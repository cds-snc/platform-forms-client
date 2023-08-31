import { dir } from "i18next";
import "../styles/app.scss";
import { Metadata } from "next";
import "react-app-polyfill/stable";
import { cookies } from "next/headers";
import { languages } from "@app/i18n/settings";

export const metadata: Metadata = {
  viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const locale = cookies().get("i18next")?.value ?? languages[0];
  return (
    <html lang={locale} dir={dir(locale)}>
      <head />
      <body>{children}</body>
    </html>
  );
}
