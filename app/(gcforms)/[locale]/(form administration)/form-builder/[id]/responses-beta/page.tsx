import { Metadata } from "next";
import { redirect } from "next/navigation";
import { serverTranslation } from "@i18n";

import { authCheckAndThrow } from "@lib/actions";
import { featureFlagAllowedForUser } from "@lib/userFeatureFlags";
import { FeatureFlags } from "@root/lib/cache/types";
import { logMessage } from "@lib/logger";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsPublished")} — ${t("gcForms")}`,
  };
}

export default async function Page(props: { params: Promise<{ locale: string; id: string }> }) {
  const params = await props.params;

  const { locale, id } = params;

  const { session } = await authCheckAndThrow().catch(() => ({
    session: null,
  }));

  if (!session) {
    return null;
  }

  const hasAccess = await featureFlagAllowedForUser(session.user.id, FeatureFlags.responsesBeta);

  if (!hasAccess) {
    logMessage.info(
      `User ${session.user.id} attempted to access Responses Beta page without the feature flag enabled.`
    );

    redirect(`/${locale}/form-builder/${id}/responses`);
  }

  return (
    <div>
      <p>
        Responses Beta Page for form {id} in locale {locale}
      </p>
    </div>
  );
}
