import { dir } from "i18next";
import "../styles/app.scss";
import { Metadata } from "next";
import "react-app-polyfill/stable";
import { cookies } from "next/headers";
import { languages } from "@app/i18n/settings";
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

export const metadata: Metadata = {
  viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const locale = cookies().get("i18next")?.value ?? languages[0];
  return (
    <html lang={locale} dir={dir(locale)} className={`${notoSans.variable} ${lato.variable}`}>
      <head />
      <body>{children}</body>
    </html>
  );
}
