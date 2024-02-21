import { serverTranslation } from "@i18n";
import { Metadata } from "next";

import { cn } from "@lib/utils";
import { Header } from "@clientComponents/globals";
import { SkipLink, Footer } from "@serverComponents/globals";
import { FormBuilderProviders } from "@clientComponents/form-builder/providers";
import { redirect } from "next/navigation";
import Link from "next/link";

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
  async function start() {
    "use server";
    redirect(`/${locale}/form-builder/0000/edit`);
  }
  return (
    <FormBuilderProviders locale={locale}>
      <div className="flex h-full flex-col">
        <SkipLink />
        <Header className="mb-0" />
        <div className="shrink-0 grow basis-auto">
          <div>
            <div className="flex flex-row gap-10 pr-12">
              <main id="content" className={cn("w-full form-builder mt-5 mb-10")}>
                <form>
                  <button formAction={start}>start</button>
                  <Link href={`/${locale}/form-builder/0000/edit`}> edit</Link>
                </form>
              </main>
            </div>
          </div>
        </div>

        <Footer displayFormBuilderFooter className="mt-0 lg:mt-0" />
      </div>
    </FormBuilderProviders>
  );
}
