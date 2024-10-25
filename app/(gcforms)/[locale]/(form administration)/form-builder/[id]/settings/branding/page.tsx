import { redirect } from "next/navigation";
import { Metadata } from "next";

import { serverTranslation } from "@i18n";
import { authCheckAndThrow } from "@lib/actions";
import { getAppSetting } from "@lib/appSettings";
import { Branding } from "./components";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("branding.heading")} — ${t("gcForms")}`,
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const {
    locale
  } = params;

  const { session } = await authCheckAndThrow().catch(() => ({ session: null }));

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
