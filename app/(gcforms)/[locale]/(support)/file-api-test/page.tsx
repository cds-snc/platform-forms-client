import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { FileAPITestComponent } from "./FileAPITestComponent";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const { t } = await serverTranslation("support", { lang: locale });

  return {
    title: `${t("fileAPITest", "File API Test")} — GCForms`,
  };
}

export default async function FileAPITestPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const { locale } = params;

  return (
    <div className="max-w-4xl">
      <FileAPITestComponent locale={locale} />
    </div>
  );
}
