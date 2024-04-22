import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { allowGrouping } from "@formBuilder/components/shared/right-panel/treeview/util/allowGrouping";
import { FlowWithProvider } from "./components/flow/FlowWithProvider";

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
  const allowGroups = await allowGrouping();

  if (!allowGroups) {
    return null;
  }

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return (
    <div id={id}>
      <h1 className="mb-0 mt-8 border-0">{t("logic.heading")}</h1>
      <FlowWithProvider />
    </div>
  );
}
