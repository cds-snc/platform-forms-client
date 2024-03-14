import { redirect } from "next/navigation";
import { Metadata } from "next";

import { serverTranslation } from "@i18n";
import { auth } from "@lib/auth";
import { getAppSetting } from "@lib/appSettings";
import { Branding } from "./components";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("branding.heading")} — ${t("gcForms")}`,
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const session = await auth();

  if (session && !session.user.acceptableUse) {
    // If they haven't agreed to Acceptable Use redirect to policy page for acceptance
    redirect(`/${locale}/auth/policy`);
  }

  if (session && !session.user.hasSecurityQuestions) {
    // If they haven't setup security questions Use redirect to policy page for acceptance
    redirect(`/${locale}/auth/setup-security-questions`);
  }

  const hasBrandingRequestForm = Boolean(await getAppSetting("brandingRequestForm"));

  return <Branding hasBrandingRequestForm={hasBrandingRequestForm} />;
}
