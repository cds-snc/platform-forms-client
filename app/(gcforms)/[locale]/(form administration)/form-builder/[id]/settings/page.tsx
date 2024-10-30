import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { ResponseDelivery } from "./components/ResponseDelivery";
import { ApiKeyDialog } from "../components/dialogs/ApiKeyDialog/ApiKeyDialog";
import { checkKeyExists } from "@lib/serviceAccount";

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

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const keyId = await checkKeyExists(id);
  return (
    <>
      <ResponseDelivery keyId={keyId} />
      <ApiKeyDialog />
    </>
  );
}
