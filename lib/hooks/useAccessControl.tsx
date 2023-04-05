import React, { createContext, useState, useEffect, useContext, useCallback } from "react";

import { useSession } from "next-auth/react";
import { PureAbility, createMongoAbility, MongoAbility } from "@casl/ability";
import { Abilities } from "@lib/types";
import { logMessage } from "@lib/logger";

interface AccessControlInterface {
  ability: PureAbility<Abilities, unknown> | null;
  forceSessionUpdate: () => Promise<void>;
}
const AbilityContext = createContext<AccessControlInterface>({} as AccessControlInterface);

export const AccessControlProvider = ({ children }: { children: React.ReactNode }) => {
  const [ability, setAbility] = useState<PureAbility<Abilities, unknown> | null>(null);
  const { data: session, status, update } = useSession();

  const refreshAbility = useCallback(async () => {
    if (status === "authenticated" && session.user.privileges) {
      const userAbility = createMongoAbility<MongoAbility<Abilities>>(session.user.privileges);
      setAbility(userAbility);
    }
  }, [status, session]);

  // Ensures that the ability is refreshed when the session is updated
  useEffect(() => {
    refreshAbility();
  }, [refreshAbility]);

  /*
   * Use this function to force a session update. This is useful if you need to ensure
   * the session is in sync with the server. For example, if you perform an action and
   * a user's privileges has changed, you can call this function to ensure the session is updated.
   */
  const forceSessionUpdate = useCallback(async () => {
    logMessage.debug(
      "Refreshing Ability - useAccessControl hook - Calling server for Updated Session"
    );
    await update();
  }, [update]);

  return (
    <AbilityContext.Provider value={{ ability, forceSessionUpdate }}>
      {children}
    </AbilityContext.Provider>
  );
};

/**
 * useAccessControl hook
 * @returns ability - The ability object for a User
 * @returns forceSessionUpdate - A function to force a session update.  Use this only if you need to ensure the session is in sync with the server.
 */
export const useAccessControl = () => {
  const { ability, forceSessionUpdate } = useContext(AbilityContext);
  return { ability, forceSessionUpdate };
};
