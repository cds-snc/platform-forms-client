import Footer from "@components/globals/Footer";
import SkipLink from "@components/globals/SkipLink";
import Fip from "@components/globals/Fip";

export default async function Layout({
  children,
  params: { lang: locale },
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return (
    <>
      <SkipLink locale={locale} />
      <header>
        <Fip locale={locale} showLanguageToggle={true} />
      </header>
      <div id="page-container">
        <main id="content">{children}</main>
      </div>
      <Footer locale={locale} displayFormBuilderFooter={true} />
    </>
  );
}
