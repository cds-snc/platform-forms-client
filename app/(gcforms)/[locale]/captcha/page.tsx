import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { CaptchaFail } from "./components/client/CaptchaFail";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("captcha", { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page() {
  return <CaptchaFail />;
}
