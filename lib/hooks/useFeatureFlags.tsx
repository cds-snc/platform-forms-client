"use client";

import { Flags } from "@lib/cache/flags";
import { createContext, useContext, useState } from "react";

const featureFlagsContext = createContext({
  flags: {} as Flags,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setFlags: (flags: Flags) => {},
  getFlag: () => {},
});

export const FeatureFlagsProvider = ({
  children,
  featureFlags,
}: {
  children: React.ReactNode;
  featureFlags: Flags;
}) => {
  const [flags, setFlags] = useState(featureFlags);
  return (
    <featureFlagsContext.Provider value={{ flags, setFlags, getFlag: () => {} }}>
      {children}
    </featureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const { flags, setFlags } = useContext(featureFlagsContext);
  return {
    getFlag: (key: string) => {
      return flags[key as keyof typeof flags];
    },
    setFlag: (key: string, value: boolean) => {
      setFlags({ ...flags, [key]: value });
    },
  };
};
