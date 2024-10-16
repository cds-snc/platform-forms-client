import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { authCheckAndThrow } from "@lib/actions";
import { notFound } from "next/navigation";
import { Preview } from "./Preview";
import { allowGrouping } from "@formBuilder/components/shared/right-panel/treeview/util/allowGrouping";
import { ClientContainer } from "./ClientContainer";
import { checkIfClosed } from "@lib/actions/checkIfClosed";
import { ClosedDetails } from "@lib/types";
import { PreviewClosed } from "./PreviewClosed";

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

  const isAllowGrouping = allowGrouping();

  const formID = id;

  if (!session?.user && formID !== "0000") {
    return notFound();
  }

  const closedDetails = await checkIfClosed(id);

  if (closedDetails && closedDetails.isPastClosingDate) {
    return <PreviewClosed closedDetails={closedDetails.closedDetails as ClosedDetails} />;
  }

  return (
    <ClientContainer>
      <Preview disableSubmit={disableSubmit} allowGrouping={isAllowGrouping} />
    </ClientContainer>
  );
}
