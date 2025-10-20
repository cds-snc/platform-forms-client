import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { FormProfile } from "./components/FormProfile";
import { getAppSetting } from "@root/lib/appSettings";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsSettings")} — ${t("gcForms")}`,
  };
}

export default async function Page() {
  const hasBrandingRequestForm = Boolean(await getAppSetting("brandingRequestForm"));

  return <FormProfile hasBrandingRequestForm={hasBrandingRequestForm} />;
}
