import { authCheckAndThrow } from "@lib/actions";
import { ClientContexts } from "@clientComponents/globals/ClientContexts";
import { ReactHydrationCheck } from "@clientComponents/globals";
import { NotifyCatcher } from "@lib/notifyCatcher/NotifyCatcher";
import { getSomeFlags } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { session } = await authCheckAndThrow().catch(() => ({ session: null }));
  const featureFlags = await getSomeFlags([
    FeatureFlags.addressComplete,
    FeatureFlags.repeatingSets,
  ]);
  return (
    <>
      <ReactHydrationCheck />
      <ClientContexts session={session} featureFlags={featureFlags}>
        {children}
      </ClientContexts>
      {process.env.APP_ENV === "local" && <NotifyCatcher />}
    </>
  );
}
