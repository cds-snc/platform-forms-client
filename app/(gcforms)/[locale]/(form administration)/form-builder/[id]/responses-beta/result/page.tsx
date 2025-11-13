import { Metadata } from "next";
import { serverTranslation } from "@i18n";
import { Confirmation } from "./Confirmation";
import { ApiClientGuard } from "../guards/ApiClientGuard";
import { LocationGuard } from "../guards/LocationGuard";
import { FormatGuard } from "../guards/FormatGuard";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder-responses", { lang: locale });
  return {
    title: `${t("responsesBeta.pageTitle")} — ${t("gcForms")}`,
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
            <Confirmation locale={locale} id={id} />
          </FormatGuard>
        </LocationGuard>
      </ApiClientGuard>
    </div>
  );
}
