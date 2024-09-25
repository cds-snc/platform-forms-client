import { authCheckAndThrow } from "@lib/actions";
import { ClientContexts } from "@clientComponents/globals/ClientContexts";
import { ReactHydrationCheck } from "@clientComponents/globals";
import { FeatureFlags, getSomeFlags } from "@lib/cache/flags";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { session } = await authCheckAndThrow().catch(() => ({ session: null }));
  const featureFlags = await getSomeFlags([
    FeatureFlags.experimentalBlocks,
    FeatureFlags.addressComplete,
    FeatureFlags.repeatingSets,
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
