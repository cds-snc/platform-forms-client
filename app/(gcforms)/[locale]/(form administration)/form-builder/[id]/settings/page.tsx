import { serverTranslation } from "@i18n";
import { Metadata } from "next";

import { getAppSetting } from "@lib/appSettings";
import { ManageOwners } from "./components/manageFormOwners/ManageOwners";
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

export default async function Page(props: { params: Promise<{ id: string; locale: string }> }) {
  const hasBrandingRequestForm = Boolean(await getAppSetting("brandingRequestForm"));
  const params = await props.params;

  const { id } = params;

  return (
    <>
      <FormProfile hasBrandingRequestForm={hasBrandingRequestForm} />

      {/*--------------------------------------------*
       * Admin components - manage all forms
       *--------------------------------------------*/}
      <ManageOwners id={id} />
    </>
  );
}
