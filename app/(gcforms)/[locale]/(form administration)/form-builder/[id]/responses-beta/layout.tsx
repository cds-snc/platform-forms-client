import { serverTranslation } from "@i18n";

import { authCheckAndThrow } from "@lib/actions";
import { FeatureFlags } from "@lib/cache/types";
import { featureFlagAllowedForUser } from "@lib/userFeatureFlags";
import { redirect } from "next/navigation";
import { ResponsesProvider } from "./context/ResponsesContext";
import { ContentWrapper } from "./ContentWrapper";
import { BetaBadge } from "@root/components/clientComponents/globals/BetaBadge";

export default async function ResponsesLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;
  const { t } = await serverTranslation("response-api", { lang: params.locale });

  const { locale, id } = params;

  const { session } = await authCheckAndThrow().catch(() => ({
    session: null,
  }));

  const hasAccess =
    session !== null &&
    (await featureFlagAllowedForUser(session.user.id, FeatureFlags.responsesBeta));

  if (!hasAccess || session === null) {
    redirect(`/${locale}/form-builder/${id}/responses`);
  }

  return (
    <ResponsesProvider>
      <h1>{t("section-title")}</h1>
      <BetaBadge className="mb-4" />
      <ContentWrapper>{props.children}</ContentWrapper>
    </ResponsesProvider>
  );
}
