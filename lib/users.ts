import { User } from "next-auth";
import { prisma } from "@lib/integration/prismaConnector";
import { Prisma } from "@prisma/client";

import { logMessage } from "@lib/logger";

/**
 * Get all users
 * @returns An array of all Users
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    const users: User[] = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        admin: true,
      },
    });

    return users;
  } catch (e) {
    logMessage.error(e as Error);
    return [];
  }
};

/**
 * Modifies the Admin role on a user
 * @param isAdmin
 * @param userID
 * @returns boolean that indicates success or failure and if a user exists
 */
export const adminRole = async (isAdmin: boolean, userID: string): Promise<[boolean, boolean]> => {
  try {
    const user = await prisma.user.update({
      where: {
        id: userID,
      },
      data: {
        admin: isAdmin,
      },
    });
    return [true, Boolean(user)];
  } catch (e) {
    logMessage.error(e as Error);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      // Error P2025: Record to update not found.
      return [true, false];
    }
    return [false, false];
  }
};
