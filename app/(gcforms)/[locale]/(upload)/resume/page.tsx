import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { Upload } from "./components/Upload";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("contactus.title")}`,
  };
}

export default async function Page() {
  return (
    <div>
      <Upload />
    </div>
  );
}
