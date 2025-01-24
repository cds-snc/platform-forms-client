"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { AccessControlProvider } from "@lib/hooks/useAccessControl";
import { RefsProvider } from "@formBuilder/[id]/edit/components/RefsContext";
import { FeatureFlagsProvider } from "@lib/hooks/useFeatureFlags";
import { Flags } from "@lib/cache/types";

export const ClientContexts: React.FC<{
  session: Session | null;
  children: React.ReactNode;
  featureFlags: Flags;
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
          <FeatureFlagsProvider featureFlags={featureFlags}>{children}</FeatureFlagsProvider>
        </RefsProvider>
      </AccessControlProvider>
    </SessionProvider>
  );
};
