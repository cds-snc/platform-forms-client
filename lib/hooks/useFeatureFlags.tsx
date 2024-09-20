"use client";

import { Flags } from "@lib/cache/flags";
import { createContext, useContext, useState } from "react";

const featureFlagsContext = createContext({
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
    <featureFlagsContext.Provider value={{ flags, getFlag: () => {} }}>
      {children}
    </featureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const { flags } = useContext(featureFlagsContext);
  return {
    getFlag: (key: string) => {
      return flags[key as keyof typeof flags];
    },
  };
};
