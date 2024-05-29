import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { EditNavigation } from "../components/EditNavigation";
import { Translate } from "./components";
import { TranslateWithGroups } from "./components/TranslateWithGroups";
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
  const conditionalLogic = await allowGrouping();

  return (
    <>
      {conditionalLogic && <EditNavigation id={id} />}
      {conditionalLogic ? <TranslateWithGroups /> : <Translate />}
    </>
  );
}
