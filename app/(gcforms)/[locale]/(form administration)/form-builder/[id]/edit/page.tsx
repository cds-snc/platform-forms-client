import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { Edit } from "./components/Edit";
import { EditNavigation } from "./components/EditNavigation";
import { EditWithGroups } from "./components/EditWithGroups";
import { allowGrouping } from "@formBuilder/components/shared/right-panel/treeview/util/allowGrouping";

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
  const conditionalLogic = allowGrouping();

  return (
    <>
      {conditionalLogic ? (
        <EditWithGroups id={id} locale={locale} />
      ) : (
        <>
          <EditNavigation id={id} />
          <Edit formId={id} />
        </>
      )}
    </>
  );
}
