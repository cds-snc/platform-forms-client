import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { Edit } from "./components/Edit";
import { EditNavigation } from "./components/EditNavigation";
import { checkFlag } from "../actions";
import { EditWithGroups } from "./components/EditWithGroups";

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
  const conditionalLogic = await checkFlag("conditionalLogic");

  return (
    <>
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
