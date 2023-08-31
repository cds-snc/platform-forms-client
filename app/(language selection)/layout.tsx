import Footer from "@appComponents/globals/Footer";
import SkipLink from "@appComponents/globals/SkipLink";
import Fip from "@appComponents/globals/Fip";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <SkipLink />
      <header>
        <Fip showLanguageToggle={false} showLogin={false} />
      </header>
      {children}
      <Footer />
    </div>
  );
}
