import { Footer, SkipLink } from "@serverComponents/globals";
import { Fip } from "@clientComponents/globals";
import LanguageToggle from "@clientComponents/globals/LanguageToggle";
import { cn } from "@lib/utils";
export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <SkipLink />
      <header>
        <Fip className={"mb-20 mt-0 border-b-4 border-blue-dark py-9"}>
          <LanguageToggle />
        </Fip>
      </header>
      <div className={cn("gc-formview", "shrink-0 grow basis-auto px-[4rem] py-0 laptop:px-32")}>
        <main id="content">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
