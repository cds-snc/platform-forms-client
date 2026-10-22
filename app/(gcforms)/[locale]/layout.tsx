import { auth } from "@lib/auth";
import { ClientContexts } from "@clientComponents/globals/ClientContexts";
import { ReactHydrationCheck } from "@clientComponents/globals";
import { checkAll } from "@lib/cache/flags";
import { FeatureFlags, Flags } from "@lib/cache/types";
import { FeatureFlagsContext } from "@lib/hooks/useFeatureFlags";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
