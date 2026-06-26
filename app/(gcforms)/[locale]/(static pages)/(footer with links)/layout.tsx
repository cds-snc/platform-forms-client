import { Footer } from "@root/components/serverComponents/globals/Footer/Footer";
import { GcdsHeader } from "@serverComponents/globals/GcdsHeader/GcdsHeader";
import { SkipLink } from "@clientComponents/globals/SkipLink";

import { type Language } from "@lib/types/form-builder-types";
import { headers } from "next/headers";

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const pathname = (await headers()).get("x-path") ?? "";
  const { locale } = params;
  const { children } = props;
  return (
    <div className="gcds-page flex h-full flex-col bg-white">
      <SkipLink />
      <GcdsHeader language={locale as Language} pathname={pathname} />
      <div className="container-xl tablet:px-[var(--gcds-spacing-600)] laptop:px-0 mx-auto px-[var(--gcds-spacing-225)]">
        <main id="content">{children}</main>
      </div>
      <Footer displayFormBuilderFooter={true} />
    </div>
  );
}
