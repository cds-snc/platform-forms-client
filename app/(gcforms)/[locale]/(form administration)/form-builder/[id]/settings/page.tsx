import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { ResponseDelivery } from "./components/ResponseDelivery";
import { ApiKeyDialog } from "../components/dialogs/ApiKeyDialog/ApiKeyDialog";
import { checkKeyExists } from "@lib/serviceAccount";
import { getSomeFlags } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";

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

const featureFlags = await getSomeFlags([FeatureFlags.apiAccess]);

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const keyId = await checkKeyExists(id);
  return (
    <>
      <ResponseDelivery featureFlags={featureFlags} keyId={keyId} />
      <ApiKeyDialog />
    </>
  );
}
