import { serverTranslation } from "@i18n";

import { authCheckAndThrow } from "@lib/actions";
import { FeatureFlags } from "@lib/cache/types";
import { featureFlagAllowedForUser } from "@lib/userFeatureFlags";
import { redirect } from "next/navigation";
import { ResponsesProvider } from "./context/ResponsesContext";
import { ResponsesAppProvider } from "./context/ResponsesAppProvider";
import { isProductionEnvironment } from "@root/lib/origin";
import { ContentWrapper } from "./ContentWrapper";
import { PilotBadge } from "@clientComponents/globals/PilotBadge";
import { CompatibilityGuard } from "./guards/CompatibilityGuard";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";
import { getFullTemplateByID } from "@root/lib/templates";

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

  if (!session) {
    return (
      <div className="max-w-4xl">
        <LoggedOutTab tabName={LoggedOutTabName.RESPONSES} />
      </div>
    );
  }

  const hasAccess = await featureFlagAllowedForUser(session.user.id, FeatureFlags.responsesPilot);

  const template = await getFullTemplateByID(id);
  const isEmailDelivery = template?.deliveryOption?.emailAddress !== undefined;

  if (!hasAccess || isEmailDelivery) {
    // Clear the cookie to prevent redirect loop
    redirect(`/${locale}/form-builder/${id}/responses`);
  }

  return (
    <ResponsesAppProvider
      _locale={locale}
      isProductionEnvironment={await isProductionEnvironment()}
    >
      <ResponsesProvider locale={locale} formId={id}>
        <CompatibilityGuard>
          <h1 className="mb-4">{t("section-title")}</h1>
          <PilotBadge className="mb-8" />
          <ContentWrapper>{props.children}</ContentWrapper>
        </CompatibilityGuard>
      </ResponsesProvider>
    </ResponsesAppProvider>
  );
}
