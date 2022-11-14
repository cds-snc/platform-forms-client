import React, { createContext, useState, useEffect, useContext } from "react";

import { getSession } from "next-auth/react";
import { PureAbility, createMongoAbility, MongoAbility } from "@casl/ability";
import { Abilities } from "@lib/types";

interface AccessControlInterface {
  ability: PureAbility<Abilities, unknown> | null;
  refreshAbility: () => Promise<void>;
}
const AbilityContext = createContext<AccessControlInterface>({} as AccessControlInterface);

export const AccessControlProvider = ({ children }: { children: React.ReactNode }) => {
  const [ability, setAbility] = useState<PureAbility<Abilities, unknown> | null>(null);

  const refreshAbility = async () => {
    const session = await getSession();
    if (session !== null && session.user.privileges) {
      const userAbility = createMongoAbility<MongoAbility<Abilities>>(session.user.privileges);
      setAbility(userAbility);
    }
  };

  useEffect(() => {
    refreshAbility();
  }, []);

  return (
    <AbilityContext.Provider value={{ ability, refreshAbility }}>
      {children}
    </AbilityContext.Provider>
  );
};

export const useAccessControl = () => {
  const { ability, refreshAbility } = useContext(AbilityContext);
  return { ability, refreshAbility };
};
