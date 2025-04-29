import { cn } from "@lib/utils";
import { Footer } from "@serverComponents/globals/Footer";
import { SkipLink } from "@serverComponents/globals/SkipLink";
import { GcdsHeader } from "@serverComponents/globals/GcdsHeader/GcdsHeader";
import { type Language } from "@lib/types/form-builder-types";

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const { children } = props;
  return (
    <div className="flex h-full flex-col">
      <SkipLink />
      <GcdsHeader language={locale as Language} />
      <div
        className={cn(
          "gc-formview",
          "shrink-0 grow basis-auto px-[2rem] tablet:px-24 py-0 laptop:px-32"
        )}
      >
        <main id="content">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
