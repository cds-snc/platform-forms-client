import Footer from "@appComponents/globals/Footer";
import SkipLink from "@appComponents/globals/SkipLink";
import Fip from "@appComponents/globals/Fip";
import { logMessage } from "@lib/logger";

export default async function Layout({
  children,
  params: { lang: locale },
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  logMessage.debug(`Static Page Layout lang: ${locale}`);
  return (
    <>
      <SkipLink locale={locale} />
      <header>
        <Fip showLanguageToggle={true} />
      </header>
      <div id="page-container">
        <main id="content">{children}</main>
      </div>
      <Footer locale={locale} displayFormBuilderFooter={true} />
    </>
  );
}
