import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { EditNavigation } from "../components/EditNavigation";
import { Translate } from "./components";
import { checkFlag } from "@formBuilder/[id]/actions";

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
  const showNavigation = !(await checkFlag("conditionalLogic"));

  return (
    <>
      {showNavigation && <EditNavigation id={id} />}
      <Translate />
    </>
  );
}
