"use client";

import { Flags } from "@lib/cache/flags";
import { createContext, useContext, useState } from "react";

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
  const [flags] = useState(featureFlags);
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
