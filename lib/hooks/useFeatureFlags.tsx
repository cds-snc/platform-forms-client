"use client";

import { Flags } from "@lib/cache/types";
import { createContext, useContext } from "react";

export const FeatureFlagsContext = createContext({
  flags: {} as Flags,
});

export const useFeatureFlags = () => {
  const { flags } = useContext(FeatureFlagsContext);
  return {
    getFlag: (key: string) => {
      return flags[key as keyof typeof flags];
    },
  };
};
