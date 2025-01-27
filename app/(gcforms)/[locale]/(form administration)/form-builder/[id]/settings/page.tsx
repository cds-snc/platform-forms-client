import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { ResponseDelivery } from "./components/ResponseDelivery";
import { authorization } from "@lib/privileges";
import { ApiKeyDialog } from "../components/dialogs/ApiKeyDialog/ApiKeyDialog";
import { DeleteApiKeyDialog } from "../components/dialogs/DeleteApiKeyDialog/DeleteApiKeyDialog";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsSettings")} — ${t("gcForms")}`,
  };
}

export default async function Page() {
  const isFormsAdmin = await authorization
    .canManageAllForms()
    .then(() => true)
    .catch(() => false);

  return (
    <>
      <ResponseDelivery isFormsAdmin={isFormsAdmin} />
      <ApiKeyDialog />
      <DeleteApiKeyDialog />
    </>
  );
}
