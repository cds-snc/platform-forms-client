import { Fip } from "@clientComponents/globals";
import LanguageToggle from "@clientComponents/globals/Header/LanguageToggle";
import { Footer } from "@serverComponents/globals/Footer";
import { SkipLink } from "@serverComponents/globals/SkipLink";
export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <SkipLink />
      <header>
        <Fip className="mb-20 mt-0 border-b-4 border-blue-dark py-9">
          <LanguageToggle />
        </Fip>
      </header>
      <div id="page-container">
        <main id="content">{children}</main>
      </div>
      <Footer displayFormBuilderFooter={true} />
    </div>
  );
}
