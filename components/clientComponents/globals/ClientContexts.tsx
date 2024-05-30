"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { AccessControlProvider } from "@lib/hooks/useAccessControl";

export const ClientContexts: React.FC<{ session: Session | null; children: React.ReactNode }> = ({
  session,
  children,
}) => {
  return (
    <SessionProvider
      // initial session
      session={session}
      // Re-fetch session every 30 minutes if no user activity
      refetchInterval={30 * 60}
      // Re-fetches session when window is focused
      refetchOnWindowFocus={false}
    >
      <AccessControlProvider>{children}</AccessControlProvider>
    </SessionProvider>
  );
};
