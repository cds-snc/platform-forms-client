"use client";

import { Flags } from "@lib/cache/types";
import { createContext, useContext, useState } from "react";
import { useSession } from "next-auth/react";

const FeatureFlagsContext = createContext({
  flags: {} as Flags,
  getFlag: () => {},
});

export const FeatureFlagsProvider = ({
  children,
  featureFlags,
}: {
  children: React.ReactNode;
  featureFlags: Flags;
}) => {
  const { data: session } = useSession();
  const [flags] = useState(featureFlags);

  const userFlags: string[] = session?.user?.featureFlags ?? [];
  // Loop through flags and set them to true if they are in the user's feature flags
  Object.keys(flags).forEach((key) => {
    if (userFlags.includes(key)) {
      flags[key as keyof typeof flags] = true;
    }
  });

  return (
    <FeatureFlagsContext.Provider value={{ flags, getFlag: () => {} }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const { flags } = useContext(FeatureFlagsContext);
  return {
    getFlag: (key: string) => {
      return flags[key as keyof typeof flags];
    },
  };
};
