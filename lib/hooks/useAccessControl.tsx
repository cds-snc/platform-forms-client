"use client";
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";

import { useSession, signOut } from "next-auth/react";
import { PureAbility, createMongoAbility, MongoAbility } from "@casl/ability";
import { Abilities } from "@lib/types";
import { logMessage } from "@lib/logger";
import { useTranslation } from "@i18n/client";
import isEqual from "lodash.isequal";
import { Session } from "next-auth";

interface AccessControlInterface {
  ability: PureAbility<Abilities, unknown> | null;
}
const AbilityContext = createContext<AccessControlInterface>({} as AccessControlInterface);

export const AccessControlProvider = ({ children }: { children: React.ReactNode }) => {
  const [ability, setAbility] = useState<PureAbility<Abilities, unknown> | null>(null);
  const { data, status } = useSession();
  const [user, setUser] = useState<Session["user"] | undefined>(data?.user);
  const {
    i18n: { language },
  } = useTranslation();

  //Do a deep comparison check on 'user' to ensure that the session has actually changed for values
  useEffect(() => {
    if (!isEqual(user, data?.user)) {
      setUser(data?.user);
    }
  }, [data, user]);

  const refreshAbility = useCallback(async () => {
    // If the user is deactivated, sign them out automatically
    if (user?.deactivated) {
      await signOut({
        redirect: true,
        callbackUrl: `/${language}/auth/account-deactivated`,
      });
    }
    if (status === "authenticated" && user?.privileges) {
      logMessage.debug("Refreshing Ability - useAccessControl hook - Creating ability");
      const userAbility = createMongoAbility<MongoAbility<Abilities>>(user?.privileges);
      setAbility(userAbility);
    }
  }, [status, user, language]);

  // Ensures that the ability is refreshed when the session is updated
  useEffect(() => {
    refreshAbility();
    logMessage.debug("Refreshing Ability - useAccessControl hook - Session Updated");
  }, [refreshAbility]);

  return <AbilityContext.Provider value={{ ability }}>{children}</AbilityContext.Provider>;
};

/**
 * useAccessControl hook
 * @returns ability - The ability object for a User
 */
export const useAccessControl = () => {
  const { ability } = useContext(AbilityContext);
  return { ability };
};
