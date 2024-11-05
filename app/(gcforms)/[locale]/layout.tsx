import { authCheckAndThrow } from "@lib/actions";
import { ClientContexts } from "@clientComponents/globals/ClientContexts";
import { ReactHydrationCheck } from "@clientComponents/globals";
import { getSomeFlags } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { session } = await authCheckAndThrow().catch(() => ({ session: null }));
  const featureFlags = await getSomeFlags([
    FeatureFlags.addressComplete,
    FeatureFlags.repeatingSets,
    FeatureFlags.scheduleClosingDate,
    FeatureFlags.apiAccess,
  ]);

  //
  // TEMP
  //
  const appConfig = {
    apiKey: "1234"
  };

  return (
    <>
      <ReactHydrationCheck />
      <ClientContexts session={session} featureFlags={featureFlags} appConfig={appConfig}>
        {children}
      </ClientContexts>
    </>
  );
}
