import { auth } from "@lib/auth";
import { ClientContexts } from "@clientComponents/globals/ClientContexts";
import { ReactHydrationCheck } from "@clientComponents/globals";
import { getSomeFlags } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const featureFlags = await getSomeFlags([
    FeatureFlags.addressComplete,
    FeatureFlags.apiAccess,
    FeatureFlags.saveAndResume,
    FeatureFlags.formTimer,
    FeatureFlags.hCaptcha,
    FeatureFlags.caretakerPeriod,
  ]);

  return (
    <>
      <ReactHydrationCheck />
      <ClientContexts session={session} featureFlags={featureFlags}>
        {children}
      </ClientContexts>
    </>
  );
}
