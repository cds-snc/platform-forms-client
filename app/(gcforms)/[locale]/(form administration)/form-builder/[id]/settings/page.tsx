import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { ResponseDelivery } from "./components/ResponseDelivery";
import { ApiKeyDialog } from "../components/dialogs/ApiKeyDialog/ApiKeyDialog";
import { DeleteApiKeyDialog } from "../components/dialogs/DeleteApiKeyDialog/DeleteApiKeyDialog";
import { authCheckAndRedirect } from "@lib/actions";
import { checkPrivilegesAsBoolean } from "@lib/privileges";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsSettings")} — ${t("gcForms")}`,
  };
}

export default async function Page() {

  const { ability } = await authCheckAndRedirect();

  const isFormsAdmin = checkPrivilegesAsBoolean(ability, [
    {
      action: "view",
      subject: "FormRecord",
    },
  ]);
  
  return (
    <>
      <ResponseDelivery isFormsAdmin={isFormsAdmin} />
      <ApiKeyDialog />
      <DeleteApiKeyDialog />
    </>
  );
}
