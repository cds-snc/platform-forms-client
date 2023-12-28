import { Footer, SkipLink } from "@serverComponents/globals";
import { Fip } from "@clientComponents/globals";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <SkipLink />
      <header>
        <Fip />
      </header>
      <div id="page-container">
        <main id="content">{children}</main>
      </div>
      <Footer displayFormBuilderFooter={true} />
    </div>
  );
}
