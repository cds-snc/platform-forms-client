import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { authCheckAndThrow } from "@lib/actions";
import { notFound } from "next/navigation";
import { Preview } from "./Preview";
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
  const { session } = await authCheckAndThrow().catch(() => ({
    session: null,
    ability: null,
  }));
  const disableSubmit = id === "0000" || !session?.user;

  const isAllowGrouping = await allowGrouping();

  const formID = id;

  if (!session?.user && formID !== "0000") {
    return notFound();
  }

  return <Preview disableSubmit={disableSubmit} allowGrouping={isAllowGrouping} />;
}
