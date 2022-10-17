import { User } from "next-auth";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { AccessLog, FormUser, Prisma, UserRole } from "@prisma/client";
import { logMessage } from "@lib/logger";
import { LoggingAction } from "./auth";

/**
 * Get all Users
 * @returns An array of all Users
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    const users: User[] = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return users;
  } catch (e) {
    return prismaErrors(e, []);
  }
};

/**
 * Get a FormUser
 * @param userId FormUser Id
 * @returns FormUser Object
 */
export const getFormUser = async (userId: string): Promise<FormUser | null> => {
  try {
    return await prisma.formUser.findUnique({
      where: {
        id: userId,
      },
    });
  } catch (e) {
    return prismaErrors(e, null);
  }
};

/**
 * Get or Create a user if a record does not exist
 * @returns A User Object
 */
export const getOrCreateUser = async ({
  sub,
  name,
  email,
  picture,
}: {
  sub?: string | null;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
}): Promise<User | null> => {
  try {
    if (!sub) throw new Error("Sub does not exist on token");
    const user: User | null = await prisma.user.findUnique({
      where: {
        id: sub,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // If a user already exists return the record
    if (user !== null) return user;

    // User does not exist, create and return a record
    return await prisma.user.create({
      data: {
        id: sub,
        name,
        email,
        image: picture,
      },
    });
  } catch (e) {
    return prismaErrors(e, null);
  }
};

/**
 * Modifies the Admin role on a user
 * @param isAdmin
 * @param userId
 * @returns boolean that indicates success or failure and if a user exists
 */
export const adminRole = async (isAdmin: boolean, userId: string): Promise<[boolean, boolean]> => {
  try {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: isAdmin ? UserRole.ADMINISTRATOR : UserRole.PROGRAM_ADMINISTRATOR,
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

/**
 * Retrieves the accessLog entry for the last login for a user
 * @param userId
 * @returns AccessLog object
 */
export const userLastLogin = async (userId: string): Promise<AccessLog | null> => {
  try {
    return await prisma.accessLog.findFirst({
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
