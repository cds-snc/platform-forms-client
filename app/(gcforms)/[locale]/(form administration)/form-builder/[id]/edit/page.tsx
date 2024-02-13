import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { EditNavigation } from "@clientComponents/form-builder/app";
import { Edit } from "@clientComponents/form-builder/app/edit";
import { FormRecord } from "@lib/types";
import { auth } from "@lib/auth";
import { AccessControlError, createAbility } from "@lib/privileges";
import { getFullTemplateByID } from "@lib/templates";
import { redirect } from "next/navigation";
import { FormBuilderInitializer } from "@clientComponents/globals/layouts/FormBuilderLayout";

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
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const FormbuilderParams: { locale: string; initialForm: null | FormRecord } = {
    initialForm: null,
    locale,
  };

  const session = await auth();

  const formID = id || null;

  if (session && formID) {
    try {
      const ability = createAbility(session);

      const initialForm = await getFullTemplateByID(ability, formID);

      if (initialForm === null) {
        redirect(`/${locale}/404`);
      }

      if (initialForm.isPublished) {
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
    <FormBuilderInitializer
      initialForm={FormbuilderParams.initialForm}
      locale={FormbuilderParams.locale}
    >
      <EditNavigation />
      <Edit />
    </FormBuilderInitializer>
  );
}
