import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { ApiAccessLog } from "@prisma/client";
import { JWT } from "next-auth";
import { LoggingAction } from "./auth";
import { Ability } from "./policyBuilder";
import { checkPrivileges } from "@lib/privileges";

/**
 * Get or Create a user if a record does not exist
 * @returns A User Object
 */
export const getOrCreateUser = async (userToken: JWT) => {
  try {
    if (!userToken.email) throw new Error("Email address does not exist on token");
    const user = await prisma.user.findUnique({
      where: {
        email: userToken.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        privileges: true,
      },
    });

    // If a user already exists and has privileges return the record
    if (user !== null && user.privileges.length) return user;

    // User does not exist, create and return a record or assign base privileges
    const { name, email, picture: image } = userToken;
    const basePrivileges = await prisma.privilege.findUnique({
      where: {
        nameEn: "Base",
      },
      select: {
        id: true,
      },
    });

    if (basePrivileges === null) throw new Error("Base Privileges is not set in Database");

    if (!user) {
      return await prisma.user.create({
        data: {
          name,
          email,
          image,
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
      });
    } else {
      return await prisma.user.update({
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
      });
    }
  } catch (e) {
    return prismaErrors(e, null);
  }
};

/**
 * Get all Users
 * @returns An array of all Users
 */
export const getUsers = async (ability: Ability) => {
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
};

/**
 * Retrieves the accessLog entry for the last login for an API user
 * @param userId
 * @returns AccessLog object
 */
export const userLastLogin = async (userId: string): Promise<ApiAccessLog | null> => {
  try {
    return await prisma.apiAccessLog.findFirst({
      where: {
        userId: userId,
        action: LoggingAction.LOGIN,
      },
      orderBy: {
        timestamp: "desc",
      },
    });
  } catch (e) {
    return prismaErrors(e, null);
  }
};
