"use client";

import { Flags } from "@lib/cache/types";
import { createContext, useContext, useState } from "react";
import { useSession } from "next-auth/react";

// Uses the checkAll as a server action
import { checkAll } from "../cache/flags";

const FeatureFlagsContext = createContext({
  flags: {} as Flags,
  update: async () => {},
});

export const FeatureFlagsProvider = ({
  children,
  featureFlags,
}: {
  children: React.ReactNode;
  featureFlags: Flags;
}) => {
  const { data: session } = useSession();
  const [flags, setFlags] = useState(featureFlags);

  const userFlags: string[] = session?.user?.featureFlags ?? [];
  // Loop through flags and set them to true if they are in the user's feature flags
  Object.keys(flags).forEach((key) => {
    if (userFlags.includes(key)) {
      flags[key as keyof typeof flags] = true;
    }
  });

  const update = async () => {
    await checkAll().then((flags) => setFlags(flags));
  };

  return (
    <FeatureFlagsContext.Provider value={{ flags, update }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const { flags, update } = useContext(FeatureFlagsContext);
  return {
    getFlag: (key: string) => {
      return flags[key as keyof typeof flags];
    },
    update,
  };
};
