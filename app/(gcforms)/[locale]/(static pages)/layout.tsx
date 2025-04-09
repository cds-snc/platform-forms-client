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
      <div id="page-container" className="content-wrapper">
        <main id="content" className="container mx-auto xl:px-0 sm:px-600 px-225">
          {children}
        </main>
      </div>
      <Footer displayFormBuilderFooter={true} />
    </div>
  );
}
