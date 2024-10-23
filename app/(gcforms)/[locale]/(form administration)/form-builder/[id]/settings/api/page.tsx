import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { ApiKey } from "./components/client/ApiKey";
import { authCheckAndRedirect } from "@lib/actions";
import { checkKeyExists } from "@lib/serviceAccount";
import { redirect } from "next/navigation";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { isProductionEnvironment } from "@lib/origin";
import { ApiKeyDialog } from "../../components/dialogs/APIKeyDialog/APIKeyDialog";

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

export default async function Page({
  params: { id, locale },
}: {
  params: { id: string; locale: string };
}) {
  const { ability } = await authCheckAndRedirect();

  // If this production environment, check to ensure user has Manage All Forms permission
  if (
    isProductionEnvironment() &&
    !checkPrivilegesAsBoolean(ability, [
      {
        action: "view",
        subject: "FormRecord",
      },
    ])
  ) {
    redirect(`/${locale}/form-builder/${id}/settings`);
  }

  const keyId = await checkKeyExists(id);

  return (
    <>
      <ApiKey keyId={keyId} />
      <ApiKeyDialog />
    </>
  );
}
