"use client";
import { SessionProvider } from "next-auth/react";
import { AccessControlProvider } from "@lib/hooks";
import { Session } from "next-auth";

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
      refetchOnWindowFocus={true}
    >
      <AccessControlProvider>{children}</AccessControlProvider>
    </SessionProvider>
  );
};
