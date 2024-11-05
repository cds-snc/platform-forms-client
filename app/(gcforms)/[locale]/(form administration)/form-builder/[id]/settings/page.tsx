import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { ResponseDelivery } from "./components/ResponseDelivery";
import { ApiKeyDialog } from "../components/dialogs/ApiKeyDialog/ApiKeyDialog";
import { DeleteApiKeyDialog } from "../components/dialogs/DeleteApiKeyDialog/DeleteApiKeyDialog";
import { checkKeyExists } from "@lib/serviceAccount";

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

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const keyId = await checkKeyExists(id);
  return (
    <>
      <ResponseDelivery keyId={keyId} />
      <ApiKeyDialog />
      <DeleteApiKeyDialog />
    </>
  );
}
