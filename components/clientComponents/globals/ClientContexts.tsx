"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { AccessControlProvider } from "@lib/hooks/useAccessControl";
import { RefsProvider } from "@formBuilder/[id]/edit/components/RefsContext";
import { FeatureFlagsProvider } from "@lib/hooks/useFeatureFlags";
import { AllAppSettings, Flags } from "@lib/cache/types";
import { AppSettingsProvider } from "@lib/hooks/useAppSettings";

export const ClientContexts: React.FC<{
  session: Session | null;
  children: React.ReactNode;
  featureFlags: Flags;
  appSettings: AllAppSettings;
}> = ({ session, children, featureFlags, appSettings }) => {
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
            <AppSettingsProvider appSettings={appSettings}>{children}</AppSettingsProvider>
          </FeatureFlagsProvider>
        </RefsProvider>
      </AccessControlProvider>
    </SessionProvider>
  );
};
