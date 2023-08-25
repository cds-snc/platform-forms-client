import Footer from "@appComponents/globals/Footer";
import SkipLink from "@appComponents/globals/SkipLink";
import Fip from "@appComponents/globals/Fip";
import { dir } from "i18next";
import "../../styles/app.scss";
import { Metadata } from "next";
import "react-app-polyfill/stable";

export const metadata: Metadata = {
  viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={"en"} dir={dir("en")}>
      <head />
      <body suppressHydrationWarning={true}>
        <SkipLink locale="en" />
        <header>
          <Fip showLanguageToggle={false} showLogin={false} />
        </header>
        {children}
        <Footer locale="en" />
      </body>
    </html>
  );
}
