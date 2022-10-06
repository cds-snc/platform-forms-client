import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { privelegeCheck, privelegePut, privelegeDelete, flushValues } from "@lib/privelegeCache";
import { Ability, Action, Subject, AccessControlError, Privelege } from "@lib/policyBuilder";
import { Prisma } from "@prisma/client";
import { logMessage } from "./logger";

/**
 * Get the priveleges rules associated to a user
 * @param userId id of a User
 * @returns An array of priveleges associated to the user
 */
export const getPrivelegeRulesForUser = async (userId: string) => {
  try {
    const cachedPrivelegesRules = await privelegeCheck(userId);
    if (cachedPrivelegesRules?.length) return cachedPrivelegesRules;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        priveleges: true,
      },
    });

    if (!user || !user?.priveleges) throw new Error("No priveleges assigned to user");

    const refreshedRules = user.priveleges
      .map((privelege) => (privelege as Privelege).permissions)
      .flat();
    //  as unknown as RawRuleOf<AppAbility>[];
    refreshedRules && privelegePut(userId, refreshedRules);
    return refreshedRules;
  } catch (e) {
    return prismaErrors(e, []);
  }
};

/**
 * Update and overwrite existing priveleges on a User
 * @param ability Ability instance for session
 * @param userID id of the user to be updated
 * @param priveleges Array of priveleges to be connect to user
 * @returns
 */
export const updatePrivelegesForUser = async (
  ability: Ability,
  userID: string,
  priveleges: { id: string; action: "add" | "remove" }[]
) => {
  try {
    checkPriveleges(ability, [{ action: "manage", subject: "User" }]);
    const addPriveleges: { id: string }[] = [];
    const removePriveleges: { id: string }[] = [];
    priveleges.forEach((privelege) => {
      if (privelege.action === "add") {
        addPriveleges.push({ id: privelege.id });
      } else {
        removePriveleges.push({ id: privelege.id });
      }
    });
    const user = await prisma.user.update({
      where: {
        id: userID,
      },
      data: {
        priveleges: {
          connect: addPriveleges,
          disconnect: removePriveleges,
        },
      },
      select: {
        priveleges: true,
      },
    });
    await privelegeDelete(userID);

    return user.priveleges;
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
 * Get all priveleges availabe in the application
 * @returns an array of privealges
 */
export const getAllPriveleges = async (ability: Ability) => {
  try {
    checkPriveleges(ability, [{ action: "view", subject: "Privelege" }]);
    return await prisma.privelege.findMany({
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

export const updatePrivelege = async (ability: Ability, privelege: Privelege) => {
  try {
    checkPriveleges(ability, [{ action: "manage", subject: "Privelege" }]);

    const response = await prisma.privelege.update({
      where: {
        id: privelege.id,
      },
      data: privelege,

      select: {
        id: true,
      },
    });
    // Flush existing privelege cache for all users asynchronously
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

export const createPrivelege = async (ability: Ability, privelege: Privelege) => {
  try {
    checkPriveleges(ability, [{ action: "manage", subject: "Privelege" }]);

    const response = await prisma.privelege.create({
      data: privelege,

      select: {
        id: true,
      },
    });
    // Flush existing privelege cache for all users asynchronously
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
 * Checks the priveleges requested against an ability instance and throws and error if the action is not permitted.
 * @param ability The ability instance associated to a User
 * @param rules An array of rules to verify
 * @param logic Use an AND or OR logic comparison
 */
export const checkPriveleges = (
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
