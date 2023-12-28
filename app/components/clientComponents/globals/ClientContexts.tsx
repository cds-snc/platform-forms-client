"use client";
import { SessionProvider } from "next-auth/react";
import { AccessControlProvider } from "@lib/hooks";
import { Session } from "next-auth";

// Starting point tomorrow:

// Create context wrapper that can be used to wrap any high level old page component
// index.tsx for form-builder is not yet completed.  Missing FormID check and redirect.
// Worthwhile to revisit how we're moving pages across to the new structure.
// https://nextjs.org/docs/pages/building-your-application/upgrading/app-router-migration#step-4-migrating-pages

export const ClientContexts: React.FC<{ session?: Session | null; children: React.ReactNode }> = ({
  children,
  session,
}) => {
  return (
    <>
      <SessionProvider
        session={session}
        // Re-fetch session every 30 minutes if no user activity
        refetchInterval={30 * 60}
        // Re-fetches session when window is focused
        refetchOnWindowFocus={true}
      >
        <AccessControlProvider>{children}</AccessControlProvider>
      </SessionProvider>
    </>
  );
};
