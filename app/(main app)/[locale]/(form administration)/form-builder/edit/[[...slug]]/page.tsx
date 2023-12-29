import { TemplateStoreProvider } from "@clientComponents/form-builder/store";
import { serverTranslation } from "@app/i18n";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAppSession } from "@app/api/auth/authConfig";
import { FormRecord } from "@lib/types";
import { AccessControlError, createAbility } from "@lib/privileges";
import { getFullTemplateByID } from "@lib/templates";
import { EditNavigation } from "@clientComponents/form-builder/app";
import { Edit } from "@clientComponents/form-builder/app/edit";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder");
  return {
    title: `${t("gcFormsEdit")} — ${t("gcForms")}`,
  };
}

export default async function Page({
  params: { slug = [], locale },
}: {
  params: { slug?: string[]; locale: string };
}) {
  const FormbuilderParams: { locale: string; initialForm: null | FormRecord } = {
    initialForm: null,
    locale,
  };

  const session = await getAppSession();

  const formID = slug[0] || null;

  if (session && formID) {
    try {
      const ability = createAbility(session);

      const initialForm = await getFullTemplateByID(ability, formID);

      if (initialForm === null) {
        redirect(`/${locale}/404`);
      }

      if (initialForm?.isPublished) {
        redirect(`/${locale}/form-builder/settings/${formID}`);
      }

      FormbuilderParams.initialForm = initialForm;
    } catch (e) {
      if (e instanceof AccessControlError) {
        redirect(`/${locale}/admin/unauthorized`);
      }
    }
  }

  return (
    <TemplateStoreProvider {...FormbuilderParams}>
      <EditNavigation />
      <Edit />
    </TemplateStoreProvider>
  );
}
