import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { ResponseDelivery } from "./components/ResponseDelivery";
import { ApiKeyDialog } from "../components/dialogs/ApiKeyDialog/ApiKeyDialog";
import { DeleteApiKeyDialog } from "../components/dialogs/DeleteApiKeyDialog/DeleteApiKeyDialog";
import { getSomeFlags } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";

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
  const { emailDelivery } = await getSomeFlags([FeatureFlags.emailDelivery]);
  return (
    <>
      <h1>emailDelivery = ${emailDelivery}</h1>
      <ResponseDelivery />
      <ApiKeyDialog />
      <DeleteApiKeyDialog />
    </>
  );
}
