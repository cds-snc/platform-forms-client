"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { AccessControlProvider } from "@lib/hooks/useAccessControl";
import { LiveMessagePovider } from "@lib/hooks/useLiveMessage";
import { RefsProvider } from "@formBuilder/[id]/edit/components/RefsContext";
import { FeatureFlagsProvider } from "@lib/hooks/useFeatureFlags";
import { PickFlags } from "@lib/cache/flags";

export const ClientContexts: React.FC<{
  session: Session | null;
  children: React.ReactNode;
  featureFlags: PickFlags<
    ("experimentalBlocks" | "zitadelAuth" | "conditionalLogic" | "addressComplete")[]
  >;
}> = ({ session, children, featureFlags }) => {
  return (
    <SessionProvider
      // initial session
      session={session}
      // Re-fetch session every 30 minutes if no user activity
      refetchInterval={30 * 60}
      // Re-fetches session when window is focused
      refetchOnWindowFocus={false}
    >
      <AccessControlProvider>
        <RefsProvider>
          <FeatureFlagsProvider featureFlags={featureFlags}>
            <LiveMessagePovider>{children}</LiveMessagePovider>
          </FeatureFlagsProvider>
        </RefsProvider>
      </AccessControlProvider>
    </SessionProvider>
  );
};
