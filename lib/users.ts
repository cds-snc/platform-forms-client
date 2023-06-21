import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { JWT } from "next-auth/jwt";
import { AccessControlError, checkPrivileges } from "@lib/privileges";
import { UserAbility } from "./types";
import { logEvent } from "./auditLogs";
import { logMessage } from "@lib/logger";
import { Privilege } from "@prisma/client";
import { sendDeactivationEmail } from "@lib/deactivate";

/**
 * Get or Create a user if a record does not exist
 * @returns A User Object
 */
export const getOrCreateUser = async ({
  name,
  email,
  picture,
}: JWT): Promise<{
  newlyRegistered?: boolean;
  name: string | null;
  email: string | null;
  privileges: Privilege[];
  id: string;
} | null> => {
  if (!email) throw new Error("Email does not exist on token");
  const user = await prisma.user
    .findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        privileges: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  // If a user already exists and has privileges return the record
  if (user !== null && user.privileges.length) return user;

  // User does not exist, create and return a record or assign base privileges
  const basePrivileges = await prisma.privilege
    .findUnique({
      where: {
        nameEn: "Base",
      },
      select: {
        id: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (basePrivileges === null) {
    throw new Error("Base Privileges is not set in Database");
  }

  if (!user) {
    const newUser = await prisma.user
      .create({
        data: {
          name,
          email,
          image: picture,
          privileges: {
            connect: basePrivileges,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          privileges: true,
        },
      })
      .catch((e) => prismaErrors(e, null));

    if (newUser !== null) {
      logEvent(newUser.id, { type: "User", id: newUser.id }, "UserRegistration");
      return { ...newUser, newlyRegistered: true };
    }

    return null;
  } else {
    return prisma.user
      .update({
        where: {
          id: user.id,
        },
        data: {
          privileges: {
            connect: basePrivileges,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          privileges: true,
          active: true,
        },
      })
      .catch((e) => prismaErrors(e, null));
  }
};

/**
 * Get User by id
 * @returns User if found
 */
export const getUser = async (id: string, ability: UserAbility) => {
  try {
    checkPrivileges(ability, [{ action: "view", subject: "User" }]);

    const users = await prisma.user
      .findFirstOrThrow({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          active: true,
        },
      })
      .catch((e) => prismaErrors(e, false));

    return users;
  } catch (e) {
    if (e instanceof AccessControlError) {
      logEvent(
        ability.userID,
        { type: "User" },
        "AccessDenied",
        `Attempted to get user by id ${id}`
      );
    }
    throw e;
  }
};

/**
 * Get all Users
 * @returns An array of all Users
 */
export const getUsers = async (ability: UserAbility) => {
  try {
    checkPrivileges(ability, [{ action: "view", subject: "User" }]);

    const users = await prisma.user
      .findMany({
        select: {
          id: true,
          name: true,
          email: true,
          active: true,
          privileges: {
            select: {
              id: true,
              nameEn: true,
              nameFr: true,
              descriptionEn: true,
              descriptionFr: true,
            },
          },
        },
        orderBy: {
          id: "asc",
        },
      })
      .catch((e) => prismaErrors(e, []));

    return users;
  } catch (e) {
    if (e instanceof AccessControlError) {
      logEvent(ability.userID, { type: "User" }, "AccessDenied", "Attempted to list users");
    }
    throw e;
  }
};

/**
 * Update and overwrite existing User active status
 * @param userID id of the user to be updated
 * @param active activate or deactivate user
 * @returns User
 */
export const updateActiveStatus = async (ability: UserAbility, userID: string, active: boolean) => {
  try {
    const canManageUsers = ability?.can("update", "User") ?? false;
    if (!canManageUsers) throw new AccessControlError("Access Denied");

    checkPrivileges(ability, [{ action: "update", subject: "User" }]);
    const user = await prisma.user.update({
      where: {
        id: userID,
      },
      data: {
        active: active,
      },
      select: {
        id: true,
        active: true,
        email: true,
      },
    });

    if (!active && user.email) {
      sendDeactivationEmail(user.email);
    }

    return user;
  } catch (error) {
    logMessage.error(error as Error);
    throw error;
  }
};
