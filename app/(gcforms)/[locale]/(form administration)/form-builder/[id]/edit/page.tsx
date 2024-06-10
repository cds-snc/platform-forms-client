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

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const { t } = await serverTranslation("form-builder");
  const conditionalLogic = await allowGrouping();

  return (
    <>
      <h1 className="sr-only">{t("edit")}</h1>
      {conditionalLogic ? (
        <EditWithGroups />
      ) : (
        <>
          <EditNavigation id={id} />
          <Edit formId={id} />
        </>
      )}
    </>
  );
}
