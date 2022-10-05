import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { privelageCheck, privelagePut, privelageDelete } from "@lib/privelageCache";
import { Ability, Action, Subject, AccessControlError, Privelage } from "@lib/policyBuilder";
import { Prisma } from "@prisma/client";
import { logMessage } from "./logger";

/**
 * Get the privelages rules associated to a user
 * @param userId id of a User
 * @returns An array of privelages associated to the user
 */
export const getPrivelageRulesForUser = async (userId: string) => {
  try {
    const cachedPrivelagesRules = await privelageCheck(userId);
    if (cachedPrivelagesRules?.length) return cachedPrivelagesRules;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        privelages: true,
      },
    });

    if (!user || !user?.privelages) throw new Error("No privelages assigned to user");

    const refreshedRules = user.privelages
      .map((privelage) => (privelage as Privelage).permissions)
      .flat();
    //  as unknown as RawRuleOf<AppAbility>[];
    refreshedRules && privelagePut(userId, refreshedRules);
    return refreshedRules;
  } catch (e) {
    return prismaErrors(e, []);
  }
};

/**
 * Update and overwrite existing privelages on a User
 * @param ability Ability instance for session
 * @param userID id of the user to be updated
 * @param privelages Array of privelages to be connect to user
 * @returns
 */
export const updatePrivelagesForUser = async (
  ability: Ability,
  userID: string,
  privelages: { id: string; action: "add" | "remove" }[]
) => {
  try {
    checkPrivelages(ability, [{ action: "manage", subject: "User" }]);
    const addPrivelages: { id: string }[] = [];
    const removePrivelages: { id: string }[] = [];
    privelages.forEach((privelage) => {
      if (privelage.action === "add") {
        addPrivelages.push({ id: privelage.id });
      } else {
        removePrivelages.push({ id: privelage.id });
      }
    });
    const user = await prisma.user.update({
      where: {
        id: userID,
      },
      data: {
        privelages: {
          connect: addPrivelages,
          disconnect: removePrivelages,
        },
      },
      select: {
        privelages: true,
      },
    });
    await privelageDelete(userID);

    return user.privelages;
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
 * Get all privelages availabe in the application
 * @returns an array of privealges
 */
export const getAllPrivelages = async (ability: Ability) => {
  try {
    checkPrivelages(ability, [{ action: "view", subject: "Privelage" }]);
    return await prisma.privelage.findMany({
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

export const updatePrivelage = async (ability: Ability, privelage: Privelage) => {
  try {
    checkPrivelages(ability, [{ action: "manage", subject: "Privelage" }]);

    const response = await prisma.privelage.update({
      where: {
        id: privelage.id,
      },
      data: privelage,

      select: {
        id: true,
      },
    });
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

export const createPrivelage = async (ability: Ability, privelage: Privelage) => {
  try {
    checkPrivelages(ability, [{ action: "manage", subject: "Privelage" }]);

    const response = await prisma.privelage.create({
      data: privelage,

      select: {
        id: true,
      },
    });
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
 * Checks the privelages requested against an ability instance and throws and error if the action is not permitted.
 * @param ability The ability instance associated to a User
 * @param rules An array of rules to verify
 * @param logic Use an AND or OR logic comparison
 */
export const checkPrivelages = (
  ability: Ability,
  rules: { action: Action; subject: Subject }[],
  logic: "all" | "one" = "all"
): void => {
  // Deny by default
  const result = rules.map(({ action, subject }) => ability.can(action, subject));
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
};
