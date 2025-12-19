import { Metadata } from "next";
import { serverTranslation } from "@i18n";
import { ProcessingDownloads } from "./ProcessingDownloads";
import { ApiClientGuard } from "../guards/ApiClientGuard";
import { FormatGuard } from "../guards/FormatGuard";
import { LocationGuard } from "../guards/LocationGuard";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;

  const { t } = await serverTranslation("response-api", { lang: locale });
  return {
    title: `${t("section-title")} — ${t("processingPage.section-title")}`,
  };
}

export default async function Page(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;

  const { locale, id } = params;
  return (
    <div>
      <ApiClientGuard>
        <LocationGuard>
          <FormatGuard>
            <ProcessingDownloads locale={locale} id={id} />
          </FormatGuard>
        </LocationGuard>
      </ApiClientGuard>
    </div>
  );
}
