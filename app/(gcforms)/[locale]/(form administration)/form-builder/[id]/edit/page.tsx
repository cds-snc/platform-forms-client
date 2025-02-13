import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { EditWithGroups } from "./components/EditWithGroups";
import { DynamicRowDialog } from "@formBuilder/components/dialogs/DynamicRowDialog/DynamicRowDialog";
import { MoreDialog } from "../components/dialogs/MoreDialog/MoreDialog";
import { RulesDialog } from "../components/dialogs/RulesDialog/RulesDialog";

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

  return (
    <>
      <EditWithGroups id={id} locale={locale} />
      <DynamicRowDialog />
      <MoreDialog />
      <RulesDialog />
    </>
  );
}
