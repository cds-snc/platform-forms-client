import Footer from "@components/globals/Footer";
import SkipLink from "@components/globals/SkipLink";
import Fip from "@components/globals/Fip";

export default async function Layout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return (
    <>
      <SkipLink lang={lang} />
      <header>
        <Fip lang={lang} showLanguageToggle={true} />
      </header>
      <div id="page-container">
        <main id="content">{children}</main>
      </div>
      <Footer lang={lang} displayFormBuilderFooter={true} />
    </>
  );
}
