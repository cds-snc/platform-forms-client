import { Prisma } from "@prisma/client";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import {
  privilegeCheck,
  privilegePut,
  privilegeDelete,
  flushValues,
} from "@lib/cache/privilegeCache";
import {
  createMongoAbility,
  MongoAbility,
  MongoQuery,
  subject as setSubjectType,
} from "@casl/ability";
import {
  Abilities,
  Privilege,
  Action,
  Subject,
  ForcedSubjectType,
  AnyObject,
  UserAbility,
} from "@lib/types/privileges-types";

import { Session } from "next-auth";

import get from "lodash/get";

import { logMessage } from "./logger";
import { logEvent } from "./auditLogs";

/*
This file contains references to server side only modules.
Any attempt to import these functions into a browser will cause compilation failures
 */

export const createAbility = (session: Session): UserAbility => {
  const ability = createMongoAbility<MongoAbility<Abilities>>(
    session.user.privileges
  ) as UserAbility;
  ability.userID = session.user.id;
  return ability;
};

// Creates a new custom Error Class
export class AccessControlError extends Error {}

export function interpolatePermissionCondition(
  condition: MongoQuery<AnyObject>,
  values: AnyObject
): MongoQuery<AnyObject> {
  const placeHolderRegex = /\$\{[^}]*\}/g;
  const objectPathRegex = /([a-zA-Z]+(\.*[a-zA-Z]+)+)/;

  const conditionAsString = JSON.stringify(condition);
  const placeHolder = conditionAsString.matchAll(placeHolderRegex);

  const interpolatedString = Array.from(placeHolder).reduce((acc, current) => {
    const objectPath = current[0].match(objectPathRegex);

    if (objectPath) {
      const value = get(values, objectPath[0]);

      if (value !== undefined) {
        return acc.replace(current[0], String(value));
      } else {
        throw new Error(
          `Could not interpolate permission condition because of missing value (${objectPath[0]})`
        );
      }
    } else {
      throw new Error("Could not find object path in permission condition placeholder");
    }
  }, conditionAsString);

  return JSON.parse(interpolatedString);
}

/**
 * Get the privileges rules associated to a user
 * @param userId id of a User
 * @returns An array of privileges associated to the user
 */
export const getPrivilegeRulesForUser = async (userId: string) => {
  try {
    const cachedPrivilegesRules = await privilegeCheck(userId);
    if (cachedPrivilegesRules?.length) return cachedPrivilegesRules;
    // Order privileges ascending so that Base Privileges are always applied first
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        privileges: {
          orderBy: {
            priority: "asc",
          },
        },
      },
    });

    if (!user || !user?.privileges) throw new Error("No privileges assigned to user");

    const userPrivilegeRules = user.privileges
      .map((privilege) => (privilege as Privilege).permissions)
      .flat()
      .map((p) => {
        return p.conditions
          ? {
              ...p,
              conditions: interpolatePermissionCondition(p.conditions, { user }),
            }
          : p;
      });

    await privilegePut(userId, userPrivilegeRules);

    return userPrivilegeRules;
  } catch (e) {
    return prismaErrors(e, []);
  }
};

/**
 * Update and overwrite existing privileges on a User
 * @param ability Ability instance for session
 * @param userID id of the user to be updated
 * @param privileges Array of privileges to be connect to user
 * @returns
 */
export const updatePrivilegesForUser = async (
  ability: UserAbility,
  userID: string,
  privileges: { id: string; action: "add" | "remove" }[]
) => {
  try {
    checkPrivileges(ability, [{ action: "update", subject: "User" }]);
    const addPrivileges: { id: string }[] = [];
    const removePrivileges: { id: string }[] = [];
    privileges.forEach((privilege) => {
      if (privilege.action === "add") {
        addPrivileges.push({ id: privilege.id });
      } else {
        removePrivileges.push({ id: privilege.id });
      }
    });

    // Run prisma calls in parallel
    const [privilegesInfo, user] = await Promise.all([
      prisma.privilege
        .findMany({
          select: {
            id: true,
            nameEn: true,
          },
        })
        .catch((e) => prismaErrors(e, [])),
      prisma.user.update({
        where: {
          id: userID,
        },
        data: {
          privileges: {
            connect: addPrivileges,
            disconnect: removePrivileges,
          },
        },
        select: {
          privileges: true,
        },
      }),
    ]);

    // Logging the events asynchronously to not block the function
    addPrivileges.forEach((privilege) =>
      logEvent(
        ability.userID,
        { type: "Privilege", id: privilege.id },
        "GrantPrivilege",
        `Granted privilege : ${privilegesInfo.find((p) => p.id === privilege.id)?.nameEn}`
      )
    );
    removePrivileges.forEach((privilege) =>
      logEvent(
        ability.userID,
        { type: "Privilege", id: privilege.id },
        "RevokePrivilege",
        `Revoked privilege : ${privilegesInfo.find((p) => p.id === privilege.id)?.nameEn}`
      )
    );
    // Remove existing values from Cache
    await privilegeDelete(userID);

    return user.privileges;
  } catch (error) {
    logMessage.error(error as Error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      // Error P2025: Record to update not found.
      return null;
    }
    if (error instanceof AccessControlError) {
      logEvent(
        ability.userID,
        { type: "Privilege" },
        "AccessDenied",
        `Attempted to modify privilege on user ${userID}`
      );
    }
    throw error;
  }
};

/**
 * Get all privileges availabe in the application
 * @returns an array of privealges
 */
export const getAllPrivileges = async (ability: UserAbility) => {
  try {
    checkPrivileges(ability, [{ action: "view", subject: "Privilege" }]);
    return await prisma.privilege.findMany({
      select: {
        id: true,
        nameEn: true,
        nameFr: true,
        descriptionEn: true,
        descriptionFr: true,
        permissions: true,
        priority: true,
      },
      orderBy: {
        priority: "asc",
      },
    });
  } catch (e) {
    return prismaErrors(e, []);
  }
};

export const updatePrivilege = async (ability: UserAbility, privilege: Privilege) => {
  try {
    checkPrivileges(ability, [{ action: "update", subject: "Privilege" }]);

    const response = await prisma.privilege.update({
      where: {
        id: privilege.id,
      },
      data: privilege,

      select: {
        id: true,
      },
    });
    // Flush existing privilege cache for all users asynchronously
    flushValues();
    return response;
  } catch (error) {
    logMessage.error(error as Error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      // Error P2025: Record to update not found.
      return null;
    }
    throw error;
  }
};

export const createPrivilege = async (ability: UserAbility, privilege: Privilege) => {
  try {
    checkPrivileges(ability, [{ action: "create", subject: "Privilege" }]);

    const response = await prisma.privilege.create({
      data: privilege,

      select: {
        id: true,
      },
    });
    // Flush existing privilege cache for all users asynchronously
    flushValues();
    return response;
  } catch (error) {
    logMessage.error(error as Error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      // Error P2025: Record to update not found.
      return null;
    }
    throw error;
  }
};

/**
 * Helper function to determine which Subject Type is being passed
 * @param subject  Rule subject
 * @returns True is subject is of type ForcedSubjectType
 */
function _isForceTyping(subject: Subject | ForcedSubjectType): subject is ForcedSubjectType {
  return (
    (subject as ForcedSubjectType).type !== undefined &&
    (subject as ForcedSubjectType).object !== undefined
  );
}

/**
 * Checks the privileges requested against an ability instance and throws and error if the action is not permitted.
 * @param ability The ability instance associated to a User
 * @param rules An array of rules to verify
 * @param logic Use an AND or OR logic comparison
 */
export const checkPrivileges = (
  ability: UserAbility,
  rules: {
    action: Action;
    subject: Subject | ForcedSubjectType;
    field?: string;
  }[],
  logic: "all" | "one" = "all"
): void => {
  // helper to define if we are force typing a passed object
  try {
    const result = rules.map(({ action, subject, field }) => {
      let ruleResult = false;
      if (_isForceTyping(subject)) {
        ruleResult = ability.can(action, setSubjectType(subject.type, subject.object), field);
        logMessage.debug(
          `Privilege Check ${ruleResult ? "PASS" : "FAIL"}: Can ${action} on ${subject.type} `
        );
      } else {
        ruleResult = ability.can(action, subject, field);
        logMessage.debug(
          `Privilege Check ${ruleResult ? "PASS" : "FAIL"}: Can ${action} on ${subject} `
        );
      }
      return ruleResult;
    });

    let accessAllowed = false;

    switch (logic) {
      case "all":
        // The initial value needs to be true because of the AND logic
        accessAllowed = result.reduce((prev, curr) => prev && curr, true);
        break;
      case "one":
        accessAllowed = result.reduce((prev, curr) => prev || curr, false);
        break;
    }
    if (!accessAllowed) {
      throw new AccessControlError(`Access Control Forbidden Action`);
    }
  } catch {
    // If there is any error in privilege checking default to forbidden
    // Do not create an audit log as the error is with the system itself
    throw new AccessControlError(`Access Control Forbidden Action`);
  }
};

export const checkPrivilegesAsBoolean = (
  ability: UserAbility,
  rules: {
    action: Action;
    subject: Subject | ForcedSubjectType;
    field?: string;
  }[],
  logic: "all" | "one" = "all"
): boolean => {
  try {
    checkPrivileges(ability, rules, logic);
    return true;
  } catch (error) {
    return false;
  }
};
