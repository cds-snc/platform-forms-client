import { cn } from "@lib/utils";
import { Footer } from "@serverComponents/globals/Footer";
import { SkipLink } from "@serverComponents/globals/SkipLink";
import { GcdsHeader } from "@serverComponents/globals/GcdsHeader/GcdsHeader";
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
    <div className="flex h-full flex-col">
      <SkipLink />
      <GcdsHeader pathname={pathname} language={locale as Language} />
      <div
        className={cn(
          "gc-formview",
          "container-xl mx-auto px-[var(--gcds-spacing-225)] tablet:px-[var(--gcds-spacing-600)] laptop:px-0"
        )}
      >
        <main id="content">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
