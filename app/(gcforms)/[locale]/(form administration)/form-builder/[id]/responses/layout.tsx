import { authCheckAndThrow } from "@lib/actions";
import { isResponsesPilotModeEnabled } from "./actions";
import { featureFlagAllowedForUser } from "@lib/userFeatureFlags";
import { FeatureFlags } from "@lib/cache/types";
import { getFullTemplateByID } from "@root/lib/templates";
import { redirect } from "next/navigation";

export default async function ResponsesLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;
  const { locale, id } = params;

  const { session } = await authCheckAndThrow().catch(() => ({
    session: null,
  }));

  // Early redirect check before rendering any children
  if (session) {
    const betaModeEnabled = await isResponsesPilotModeEnabled();
    if (betaModeEnabled) {
      const hasAccess = await featureFlagAllowedForUser(
        session.user.id,
        FeatureFlags.responsesPilot
      );
      if (hasAccess) {
        const template = await getFullTemplateByID(id);
        const isEmailDelivery = template?.deliveryOption?.emailAddress !== undefined;
        if (!isEmailDelivery) {
          redirect(`/${locale}/form-builder/${id}/responses-pilot`);
        }
      }
    }
  }

  return <>{props.children}</>;
}
