import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { EditNavigation } from "../components/EditNavigation";
import { Translate } from "./components";
import { TranslateWithGroups } from "./components/TranslateWithGroups";
import { allowGrouping } from "@formBuilder/components/shared/right-panel/treeview/util/allowGrouping";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsEdit")} — ${t("gcForms")}`,
  };
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const {
    id
  } = params;

  const conditionalLogic = allowGrouping();

  return (
    <>
      {!conditionalLogic && <EditNavigation id={id} />}
      {conditionalLogic ? <TranslateWithGroups /> : <Translate />}
    </>
  );
}
