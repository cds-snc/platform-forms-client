import { auth } from "@lib/auth";
import { ClientContexts } from "@clientComponents/globals/ClientContexts";
import { ReactHydrationCheck } from "@clientComponents/globals";
import { getSomeFlags } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";
import { getAllAppSettings } from "@lib/appSettings";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const featureFlags = await getSomeFlags([
    FeatureFlags.addressComplete,
    FeatureFlags.repeatingSets,
    FeatureFlags.scheduleClosingDate,
    FeatureFlags.apiAccess,
    FeatureFlags.saveAndResume,
    FeatureFlags.formTimer,
    FeatureFlags.hCaptcha,
  ]);

  const appSettings = await getAllAppSettings();

  return (
    <>
      <ReactHydrationCheck />
      <ClientContexts session={session} featureFlags={featureFlags} appSettings={appSettings}>
        {children}
      </ClientContexts>
    </>
  );
}
