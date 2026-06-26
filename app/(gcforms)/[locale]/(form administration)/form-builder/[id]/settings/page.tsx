import { serverTranslation } from "@i18n/server";
import { Metadata } from "next";

import { getAppSetting } from "@lib/appSettings";
import { FormProfile } from "./components/FormProfile";

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

  return (
    <>
      <FormProfile hasBrandingRequestForm={hasBrandingRequestForm} />
    </>
  );
}
