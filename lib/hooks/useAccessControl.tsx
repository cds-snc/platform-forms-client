import React, { createContext, useState, useEffect, useContext, useCallback } from "react";

import { useSession, signOut } from "next-auth/react";
import { PureAbility, createMongoAbility, MongoAbility } from "@casl/ability";
import { Abilities } from "@lib/types";
import { logMessage } from "@lib/logger";
import Router from "next/router";

interface AccessControlInterface {
  ability: PureAbility<Abilities, unknown> | null;
  forceSessionUpdate: () => Promise<void>;
}
const AbilityContext = createContext<AccessControlInterface>({} as AccessControlInterface);

export const AccessControlProvider = ({ children }: { children: React.ReactNode }) => {
  const [ability, setAbility] = useState<PureAbility<Abilities, unknown> | null>(null);
  const { data: session, status, update } = useSession();

  const refreshAbility = useCallback(async () => {
    // If the user is deactivated, sign them out automatically
    if (session?.user.deactivated) {
      const deactivated = await signOut({
        redirect: false,
        callbackUrl: "/auth/account-deactivated",
      });
      // Not using useRouter() hook because it will cause unnecessary rerendering
      Router.push(deactivated.url);
    }
    if (status === "authenticated" && session.user.privileges) {
      logMessage.debug("Refreshing Ability - useAccessControl hook - Creating ability");
      const userAbility = createMongoAbility<MongoAbility<Abilities>>(session.user.privileges);
      setAbility(userAbility);
    }
  }, [status, session]);

  // Ensures that the ability is refreshed when the session is updated
  useEffect(() => {
    refreshAbility();
    logMessage.debug("Refreshing Ability - useAccessControl hook - Session Updated");
  }, [refreshAbility]);

  /*
   * Use this function to force a session update. This is useful if you need to ensure
   * the session is in sync with the server. For example, if you perform an action and
   * a user's privileges has changed, you can call this function to ensure the session is updated.
   */
  const forceSessionUpdate = useCallback(async () => {
    logMessage.debug(
      "Refreshing Ability - useAccessControl hook - Forcing call to Server to updated session"
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
