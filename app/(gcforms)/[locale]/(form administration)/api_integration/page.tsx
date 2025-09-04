import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { Header } from "@clientComponents/globals/Header/Header";
import { APIIntegration } from "./components/API_Integration";
import { SkipLink } from "@serverComponents/globals/SkipLink";
import { Footer } from "@serverComponents/globals/Footer";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation(["common", "api-integration"], {
    lang: locale,
  });
  return {
    title: `${t("title")}`,
  };
}

export default async function ApiIntegration() {
  return (
    <div className="flex h-full flex-col bg-gray-soft">
      <SkipLink />
      <Header className="mb-0" />
      <div className="shrink-0 grow basis-auto">
        <div className="flex flex-row gap-10">
          <main id="content">
            <APIIntegration />
          </main>
        </div>
      </div>
      <Footer className="mt-0 lg:mt-0" />
    </div>
  );
}
