import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { SupportForm } from "./components/client/SupportForm";
import { getAppSetting } from "@lib/appSettings";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: t("support.title"),
  };
}

export default async function Page() {
  const hCaptchaSiteKey = (await getAppSetting("hCaptchaSiteKey")) || "";

  return <SupportForm hCaptchaSiteKey={hCaptchaSiteKey} />;
}
