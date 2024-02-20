import { serverTranslation } from "@i18n";
import { ClientSide } from "./clientSide";
import { Metadata } from "next";
import { FormRecord } from "@lib/types";
import { auth } from "@lib/auth";
import { AccessControlError, createAbility } from "@lib/privileges";
import { getFullTemplateByID } from "@lib/templates";
import { redirect } from "next/navigation";

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
  params: { locale, slug = [] },
}: {
  params: { locale: string; slug: string[] };
}) {
  const FormbuilderParams: { locale: string; initialForm: null | FormRecord } = {
    initialForm: null,
    locale,
  };

  const session = await auth();

  const formID = slug[0] || null;

  if (session && formID) {
    try {
      const ability = createAbility(session);

      const initialForm = await getFullTemplateByID(ability, formID);

      if (initialForm === null) redirect(`/${locale}/404`);

      FormbuilderParams.initialForm = initialForm;
    } catch (e) {
      if (e instanceof AccessControlError) redirect(`/${locale}/admin/unauthorized`);
    }
  }

  return <ClientSide />;
}
