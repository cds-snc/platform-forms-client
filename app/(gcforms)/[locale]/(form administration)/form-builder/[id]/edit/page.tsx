import { serverTranslation } from "@i18n/server";
import { Metadata } from "next";
import { EditWithGroups } from "./components/EditWithGroups";
import { DynamicRowDialog } from "@formBuilder/components/dialogs/DynamicRowDialog/DynamicRowDialog";
import { MoreDialog } from "../components/dialogs/MoreDialog/MoreDialog";
import { RulesDialog } from "../components/dialogs/RulesDialog/RulesDialog";
import { getTemplateVersionState } from "@lib/templates/versioning/queries/getTemplateVersionState";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsEdit")} — ${t("gcForms")}`,
  };
}

export default async function Page(props: { params: Promise<{ id: string; locale: string }> }) {
  const params = await props.params;

  const { id, locale } = params;

  const templateVersionState = await getTemplateVersionState(id);

  return (
    <>
      <EditWithGroups
        id={id}
        hasDraft={!!templateVersionState?.currentDraftVersionId}
        locale={locale}
      />
      <DynamicRowDialog />
      <MoreDialog />
      <RulesDialog />
    </>
  );
}
