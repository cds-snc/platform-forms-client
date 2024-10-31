import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { checkKeyExists } from "@lib/serviceAccount";
import { EditWithGroups } from "./components/EditWithGroups";
import { DynamicRowDialog } from "@formBuilder/components/dialogs/DynamicRowDialog/DynamicRowDialog";
import { MoreDialog } from "../components/dialogs/MoreDialog/MoreDialog";

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

export default async function Page({
  params: { id, locale },
}: {
  params: { id: string; locale: string };
}) {
  let keyId: string | false = false;

  if (process.env.APP_ENV !== "test") {
    try {
      if (id && id !== "0000") {
        keyId = await checkKeyExists(id);
      }
    } catch (e) {
      // no-op
    }
  }

  return (
    <>
      <EditWithGroups id={id} locale={locale} keyId={keyId} />
      <DynamicRowDialog />
      <MoreDialog />
    </>
  );
}
