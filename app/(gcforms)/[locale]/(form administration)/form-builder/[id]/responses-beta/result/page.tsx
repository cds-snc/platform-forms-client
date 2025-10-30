import { Metadata } from "next";
import { serverTranslation } from "@i18n";

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

export default async function Page() {
  return (
    <div>
      <p>Result</p>
    </div>
  );
}
