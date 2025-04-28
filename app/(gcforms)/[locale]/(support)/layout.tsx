// import { Fip } from "@clientComponents/globals";
// import LanguageToggle from "@clientComponents/globals/Header/LanguageToggle";
import { cn } from "@lib/utils";
import { Footer } from "@serverComponents/globals/Footer";
import { SkipLink } from "@serverComponents/globals/SkipLink";
import { GCHeader } from "@serverComponents/globals/Header/GCHeader";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <SkipLink />
      <GCHeader language="en" />
      <div className={cn("gc-formview", "shrink-0 grow basis-auto px-[4rem] py-0 laptop:px-32")}>
        <main id="content">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
