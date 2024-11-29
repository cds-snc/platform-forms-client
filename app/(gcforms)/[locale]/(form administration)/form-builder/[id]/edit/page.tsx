import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { EditWithGroups } from "./components/EditWithGroups";
import { DynamicRowDialog } from "@formBuilder/components/dialogs/DynamicRowDialog/DynamicRowDialog";
import { MoreDialog } from "../components/dialogs/MoreDialog/MoreDialog";
import { RulesDialog } from "../components/dialogs/RulesDialog/RulesDialog";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsEdit")} — ${t("gcForms")}`,
  };
}

export default async function Page({
  params: { id, locale },
}: {
  params: { id: string; locale: string };
}) {
  return (
    <>
      <EditWithGroups id={id} locale={locale} />
      <DynamicRowDialog />
      <MoreDialog />
      <RulesDialog />
    </>
  );
}
