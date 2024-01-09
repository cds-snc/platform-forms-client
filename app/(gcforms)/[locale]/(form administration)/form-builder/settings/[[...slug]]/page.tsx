import { serverTranslation } from "@i18n";
import { FormRecord } from "@lib/types";
import { getAppSession } from "@api/auth/authConfig";
import { AccessControlError, createAbility } from "@lib/privileges";
import { getFullTemplateByID } from "@lib/templates";
import { redirect } from "next/navigation";
import { ResponseDelivery } from "@clientComponents/form-builder/app";
import { SettingsNavigation } from "@clientComponents/form-builder/app/navigation/SettingsNavigation";
import { FormBuilderInitializer } from "@clientComponents/globals/layouts/FormBuilderLayout";

import { Metadata } from "next";

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
  params: { locale, slug = [] },
}: {
  params: { locale: string; slug: string[] };
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
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return (
    <FormBuilderInitializer
      initialForm={FormbuilderParams.initialForm}
      locale={FormbuilderParams.locale}
    >
      <div className="max-w-4xl">
        <h1>{t("gcFormsSettings")}</h1>
        <p className="mb-5 inline-block bg-purple-200 p-3 text-sm font-bold">
          {t("settingsResponseDelivery.beforePublishMessage")}
        </p>
        <SettingsNavigation />
        <ResponseDelivery />
      </div>
    </FormBuilderInitializer>
  );
}
