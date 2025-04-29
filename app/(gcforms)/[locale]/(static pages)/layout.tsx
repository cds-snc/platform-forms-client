import { Footer } from "@serverComponents/globals/Footer";
import { GcdsHeader } from "@serverComponents/globals/GcdsHeader/GcdsHeader";
import { SkipLink } from "@serverComponents/globals/SkipLink";

import { type Language } from "@lib/types/form-builder-types";
import { headers } from "next/headers";

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;
  const pathname = (await headers()).get("x-path") ?? "";
  const { locale } = params;
  const { children } = props;
  return (
    <div className="flex h-full flex-col bg-white">
      <SkipLink />
      <GcdsHeader language={locale as Language} pathname={pathname} />
      <div id="page-container">
        <main id="content" className="gc-formview">
          {children}
        </main>
      </div>
      <Footer displayFormBuilderFooter={true} />
    </div>
  );
}
