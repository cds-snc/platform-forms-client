import React, { createContext, useState, useEffect, useContext } from "react";
import { createAbility } from "@lib/policyBuilder";
import { getSession } from "next-auth/react";
import { PureAbility, Abilities } from "@casl/ability";

interface AccessControlInterface {
  ability: PureAbility<Abilities, unknown> | null;
  refreshAbility: () => Promise<void>;
}
const AbilityContext = createContext<AccessControlInterface>({} as AccessControlInterface);

export const AccessControlProvider = ({ children }: { children: React.ReactNode }) => {
  // use a memo function here to set the default for abilitiy
  const [ability, setAbility] = useState<PureAbility<Abilities, unknown> | null>(null);

  const refreshAbility = async () => {
    const session = await getSession();
    if (session !== null && session.user.privelages) {
      const userAbility = createAbility(session.user.privelages);
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
