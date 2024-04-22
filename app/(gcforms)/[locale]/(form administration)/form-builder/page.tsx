import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { cn } from "@lib/utils";
import { Header } from "@clientComponents/globals/Header/Header";
import { Start } from "./Start";
import { SaveTemplateProvider } from "@lib/hooks/form-builder/useTemplateContext";
import { SkipLink } from "@serverComponents/globals/SkipLink";
import { Footer } from "@serverComponents/globals/Footer";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";
import { allowGrouping } from "./components/shared/right-panel/treeview/util/allowGrouping";

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

export default async function StartPage({ params: { locale } }: { params: { locale: string } }) {
  const allowGroupsFlag = await allowGrouping();
  return (
    <TemplateStoreProvider {...{ locale, allowGroupsFlag }}>
      <SaveTemplateProvider>
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
      </SaveTemplateProvider>
    </TemplateStoreProvider>
  );
}
