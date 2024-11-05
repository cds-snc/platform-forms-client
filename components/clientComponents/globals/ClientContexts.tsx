"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { AccessControlProvider } from "@lib/hooks/useAccessControl";
import { LiveMessagePovider } from "@lib/hooks/useLiveMessage";
import { RefsProvider } from "@formBuilder/[id]/edit/components/RefsContext";
import { FeatureFlagsProvider } from "@lib/hooks/useFeatureFlags";
import { Flags } from "@lib/cache/types";
import { AppConfigProvider } from "@lib/hooks/useAppConfig";

export const ClientContexts: React.FC<{
  session: Session | null;
  children: React.ReactNode;
  featureFlags: Flags;
  appConfig: Record<string, any>;
}> = ({ session, children, featureFlags, appConfig }) => {
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
            <AppConfigProvider appConfig={appConfig}>
              <LiveMessagePovider>{children}</LiveMessagePovider>
            </AppConfigProvider>
          </FeatureFlagsProvider>
        </RefsProvider>
      </AccessControlProvider>
    </SessionProvider>
  );
};
