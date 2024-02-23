import { serverTranslation } from "@i18n";
import { Metadata } from "next";

import { cn } from "@lib/utils";
import { Header } from "@clientComponents/globals";
import { SkipLink, Footer } from "@serverComponents/globals";
import { FormBuilderProviders } from "@clientComponents/form-builder/providers";
import { Start } from "./Start";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation(["common", "form-builder", "form-closed"], {
    lang: locale,
  });
  return {
    title: `${t("gcFormsStart")} — ${t("gcForms")}`,
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <FormBuilderProviders locale={locale}>
      <div className="flex h-full flex-col bg-gray-soft">
        <SkipLink />
        <Header className="mb-0" />
        <div className="shrink-0 grow basis-auto">
          <div className="flex flex-row gap-10">
            <main id="content" className={cn("w-full form-builder mt-5 mb-10")}>
              <Start />
            </main>
          </div>
        </div>
        <Footer displayFormBuilderFooter className="mt-0 lg:mt-0" />
      </div>
    </FormBuilderProviders>
  );
}
