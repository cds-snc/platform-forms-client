"use client";

import { Flags } from "@lib/cache/types";
import { createContext, useContext, useMemo } from "react";
import { useSession } from "next-auth/react";

const FeatureFlagsContext = createContext({
  flags: {} as Flags,
});

export const FeatureFlagsProvider = ({
  children,
  featureFlags,
}: {
  children: React.ReactNode;
  featureFlags: Flags;
}) => {
  const { data: session } = useSession();

  // Merge user and global flags using useMemo
  const flags = useMemo(() => {
    const userFlags: string[] = session?.user?.featureFlags ?? [];
    // Loop through flags and set them to true if they are in the user's feature flags
    const userOverriddenFlags: Partial<Flags> = {};
    userFlags.forEach((flag) => {
      userOverriddenFlags[flag as keyof Flags] = true;
    });

    return { ...featureFlags, ...userOverriddenFlags };
  }, [session?.user?.featureFlags, featureFlags]);

  return <FeatureFlagsContext.Provider value={{ flags }}>{children}</FeatureFlagsContext.Provider>;
};

export const useFeatureFlags = () => {
  const { flags } = useContext(FeatureFlagsContext);
  return {
    getFlag: (key: string) => {
      return flags[key as keyof typeof flags];
    },
  };
};
