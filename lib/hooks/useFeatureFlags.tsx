"use client";

import { Flags } from "@lib/cache/types";
import { createContext, useContext, useState, useEffect } from "react";
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
  // Do initial merge of user and global flags
  const [flags, setFlags] = useState(() => {
    const userFlags: string[] = session?.user?.featureFlags ?? [];
    // Loop through flags and set them to true if they are in the user's feature flags
    const userOverriddenFlags: Partial<Flags> = {};
    userFlags.forEach((flag) => {
      userOverriddenFlags[flag as keyof typeof flags] = true;
    });

    return { ...featureFlags, ...userOverriddenFlags };
  });

  // If flags are changed on the session then ensure they are synced with state
  useEffect(() => {
    setFlags((prevFlags) => {
      const userFlags: string[] = session?.user?.featureFlags ?? [];
      // Loop through flags and set them to true if they are in the user's feature flags
      const userOverriddenFlags: Partial<Flags> = {};
      userFlags.forEach((flag) => {
        userOverriddenFlags[flag as keyof typeof flags] = true;
      });

      return { ...prevFlags, ...userOverriddenFlags };
    });
  }, [session]);

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
