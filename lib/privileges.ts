import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { privilegeCheck, privilegePut, privilegeDelete, flushValues } from "@lib/privilegeCache";
import {
  Ability,
  Action,
  Subject,
  AccessControlError,
  Privilege,
  interpolatePermissionCondition,
} from "@lib/policyBuilder";
import { Prisma } from "@prisma/client";
import { logMessage } from "./logger";
import { subject as setSubjectType } from "@casl/ability";

interface ForcedSubjectType {
  type: Extract<Subject, string>;
  object: Record<string, unknown>;
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

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        privileges: true,
      },
    });

    if (!user || !user?.privileges) throw new Error("No privileges assigned to user");

    try {
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
    } catch (error) {
      logMessage.error(error);
      throw error;
    }
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
  ability: Ability,
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
    const user = await prisma.user.update({
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
    });
    await privilegeDelete(userID);

    return user.privileges;
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
 * Get all privileges availabe in the application
 * @returns an array of privealges
 */
export const getAllPrivileges = async (ability: Ability) => {
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
      },
      orderBy: {
        id: "asc",
      },
    });
  } catch (e) {
    return prismaErrors(e, []);
  }
};

export const updatePrivilege = async (ability: Ability, privilege: Privilege) => {
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

export const createPrivilege = async (ability: Ability, privilege: Privilege) => {
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
 * Checks the privileges requested against an ability instance and throws and error if the action is not permitted.
 * @param ability The ability instance associated to a User
 * @param rules An array of rules to verify
 * @param logic Use an AND or OR logic comparison
 */
export const checkPrivileges = (
  ability: Ability,
  rules: {
    action: Action;
    subject: Subject | ForcedSubjectType;
  }[],
  logic: "all" | "one" = "all"
): void => {
  // helper to define if we are force typing a passed object
  function isForceTyping(subject: Subject | ForcedSubjectType): subject is ForcedSubjectType {
    return (
      (subject as ForcedSubjectType).type !== undefined &&
      (subject as ForcedSubjectType).object !== undefined
    );
  }
  const result = rules.map(({ action, subject }) => {
    if (isForceTyping(subject)) {
      return ability.can(action, setSubjectType(subject.type, subject.object));
    } else {
      return ability.can(action, subject);
    }
  });
  let accessAllowed = false;
  if (process.env.NODE_ENV !== "production") {
    rules.map((rule, index) => {
      if (isForceTyping(rule.subject)) {
        logMessage.debug(
          `Privilege Check ${result[index] ? "PASS" : "FAIL"}: Can ${rule.action} on ${
            rule.subject.type
          } `
        );
      } else {
        logMessage.debug(
          `Privilege Check ${result[index] ? "PASS" : "FAIL"}: Can ${rule.action} on ${
            rule.subject
          } `
        );
      }
    });
  }
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
};
