import Footer from "@appComponents/globals/Footer";
import SkipLink from "@appComponents/globals/SkipLink";
import Fip from "@appComponents/globals/Fip";

export default async function Layout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <>
      <SkipLink locale={locale} />
      <header>
        <Fip locale={locale} showLanguageToggle={false} showLogin={false} />
      </header>
      {children}
      <Footer locale={locale} />
    </>
  );
}
