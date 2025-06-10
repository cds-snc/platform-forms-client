import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { ApiKeyDialog } from "../components/dialogs/ApiKeyDialog/ApiKeyDialog";
import { DeleteApiKeyDialog } from "../components/dialogs/DeleteApiKeyDialog/DeleteApiKeyDialog";
import { ResponseDelivery } from "./components/ResponseDelivery";

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
  return (
    <>
      <ResponseDelivery />
      <ApiKeyDialog />
      <DeleteApiKeyDialog />
    </>
  );
}
