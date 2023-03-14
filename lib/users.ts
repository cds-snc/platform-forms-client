import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { DefaultJWT } from "next-auth/jwt";
import { AccessControlError, checkPrivileges } from "@lib/privileges";
import { UserAbility } from "./types";
import { logEvent } from "./auditLogs";

/**
 * Get or Create a user if a record does not exist
 * @returns A User Object
 */
export const getOrCreateUser = async ({ name, email, picture }: DefaultJWT) => {
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

  if (basePrivileges === null) throw new Error("Base Privileges is not set in Database");

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

    if (newUser !== null)
      logEvent(newUser.id, { type: "User", id: newUser.id }, "UserRegistration");

    return newUser;
  } else {
    return await prisma.user
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
        },
      })
      .catch((e) => prismaErrors(e, null));
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
