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
        <Fip lang={lang} showLanguageToggle={false} showLogin={false} />
      </header>
      {children}
      <Footer lang={lang} />
    </>
  );
}
