import { Metadata } from "next";
import { serverTranslation } from "@i18n";

import { checkIfClosed } from "@lib/templates";
import { authorization } from "@lib/privileges";
import { AuthenticatedPage } from "@lib/pages/auth";
import { SetClosingDate } from "./components/close/SetClosingDate";
import { Notifications } from "./components/notifications/Notifications";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });

  return {
    title: `${t("settings.formManagement")} — ${t("gcForms")}`,
  };
}

export default AuthenticatedPage(async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;

  const { id } = params;

  let closedDetails;

  const canSetClosingDate =
    id !== "0000" ||
    (await authorization
      .canEditForm(id)
      .then(() => true)
      .catch(() => false));

  if (canSetClosingDate) {
    const closedData = await checkIfClosed(id);
    closedDetails = closedData?.closedDetails;
  }

  return (
    <>
      {canSetClosingDate && <SetClosingDate formId={id} closedDetails={closedDetails} />}
      <Notifications formId={id} />
    </>
  );
});
