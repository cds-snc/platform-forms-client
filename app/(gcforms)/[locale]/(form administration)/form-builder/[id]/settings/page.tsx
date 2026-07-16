import { serverTranslation } from "@i18n";
import { Metadata } from "next";

import { getAppSetting } from "@lib/appSettings";
import { FormProfile } from "./components/FormProfile";
import { getFormattedDownloadableTemplateVersions } from "@lib/templates/versioning/queries/getDownloadableTemplateVersions";
import { type DownloadableTemplateVersion } from "@lib/templates/types";

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

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const resolved = await params;
  const { id } = resolved;

  const hasBrandingRequestForm = Boolean(await getAppSetting("brandingRequestForm"));

  let versions: DownloadableTemplateVersion[] = [];
  if (id) {
    try {
      versions = await getFormattedDownloadableTemplateVersions(id);
    } catch (e) {
      versions = [];
    }
  }

  return (
    <>
      <FormProfile hasBrandingRequestForm={hasBrandingRequestForm} versions={versions} />
    </>
  );
}
