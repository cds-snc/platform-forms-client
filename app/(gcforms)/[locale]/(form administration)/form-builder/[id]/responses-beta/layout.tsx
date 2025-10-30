import { authCheckAndThrow } from "@root/lib/actions";
import { FeatureFlags } from "@root/lib/cache/types";
import { featureFlagAllowedForUser } from "@root/lib/userFeatureFlags";
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

  const hasAccess =
    session !== null &&
    (await featureFlagAllowedForUser(session.user.id, FeatureFlags.responsesBeta));

  if (!hasAccess || session === null) {
    redirect(`/${locale}/form-builder/${id}/responses`);
  }

  return <section>{props.children}</section>;
}
