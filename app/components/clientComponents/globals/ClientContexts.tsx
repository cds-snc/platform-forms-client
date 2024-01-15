"use client";
import { SessionProvider } from "next-auth/react";
import { AccessControlProvider } from "@lib/hooks";

export const ClientContexts: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SessionProvider
      // Re-fetch session every 30 minutes if no user activity
      refetchInterval={30 * 60}
      // Re-fetches session when window is focused
      refetchOnWindowFocus={true}
    >
      <AccessControlProvider>{children}</AccessControlProvider>
    </SessionProvider>
  );
};
