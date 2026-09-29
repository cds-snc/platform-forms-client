import { auth } from "@lib/auth";
import { ClientContexts } from "@clientComponents/globals/ClientContexts";
import { ReactHydrationCheck } from "@clientComponents/globals";
import { checkAll } from "@lib/cache/flags";
import { FeatureFlags, Flags } from "@lib/cache/types";
import { FeatureFlagsContext } from "@lib/hooks/useFeatureFlags";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const featureFlags = await checkAll();
  const userFeatureFlags = session?.user?.featureFlags ?? [];
  const mergedFeatureFlags = userFeatureFlags.reduce<Flags>(
    (flags, flag) => {
      if (flag in FeatureFlags) flags[flag as keyof Flags] = true;
      return flags;
    },
    { ...featureFlags }
  );

  return (
    <>
      <ReactHydrationCheck />
      <FeatureFlagsContext value={{ flags: mergedFeatureFlags }}>
        <ClientContexts session={session}>{children}</ClientContexts>
      </FeatureFlagsContext>
    </>
  );
}
