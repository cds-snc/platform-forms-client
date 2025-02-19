import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { authorization } from "@lib/privileges";
import { AccessControlError } from "@lib/auth/errors";
import { NagwareResult } from "./types";
import { logEvent } from "./auditLogs";
import { logMessage } from "@lib/logger";
import { Privilege, Prisma } from "@prisma/client";
import { DeactivationReason, sendDeactivationEmail } from "@lib/deactivate";
import { getAllTemplatesForUser } from "./templates";
import { listAllSubmissions } from "./vault";
import { detectOldUnprocessedSubmissions } from "./nagware";
import { AppUser } from "./types/user-types";
import { activeStatusUpdate } from "@lib/cache/userActiveStatus";

/**
 * Get or Create a user if a record does not exist
 * @returns A User Object
 */
export const getOrCreateUser = async ({
  name,
  email,
  picture,
}: {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
}): Promise<{
  newlyRegistered?: boolean;
  name: string | null;
  email: string;
  privileges: Privilege[];
  id: string;
  active: boolean;
} | null> => {
  if (!email) throw new Error("Email does not exist on token");
  logMessage.info(`getOrCreateUser - email: ${email}`);
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
        active: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  logMessage.info(`getOrCreateUser -find user: ${user?.id ?? "none"}`);

  // If a user already exists and has privileges return the record
  if (user !== null && user.privileges.length) return user;

  // User does not exist, create and return a record or assign base privileges
  const basePrivileges = await prisma.privilege
    .findUnique({
      where: {
        name: "Base",
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
          active: true,
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
export const getUser = async (id: string): Promise<AppUser> => {
  await authorization.canViewUser(id).catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(e.user.id, { type: "User" }, "AccessDenied", `Attempted to get user by id ${id}`);
    }
    throw e;
  });

  return prisma.user.findFirstOrThrow({
    where: {
      id: id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      createdAt: true,
      notes: true,
      privileges: {
        select: {
          id: true,
          name: true,
          descriptionEn: true,
          descriptionFr: true,
        },
      },
    },
  });
};

/**
 * Get all Users
 * @returns An array of all Users
 */
export const getUsers = async (where?: Prisma.UserWhereInput): Promise<AppUser[] | never[]> => {
  await authorization.canViewAllUsers().catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(e.user.id, { type: "User" }, "AccessDenied", "Attempted to list users");
    }
    throw e;
  });

  const users = await prisma.user
    .findMany({
      ...(where && { where }),
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        createdAt: true,
        notes: true,
        privileges: {
          select: {
            id: true,
            name: true,
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
 * Update and overwrite existing User active status
 * @param userID id of the user to be updated
 * @param active activate or deactivate user
 * @returns User
 */
export const updateActiveStatus = async (
  userID: string,
  active: boolean,
  reason: DeactivationReason = DeactivationReason.DEFAULT
) => {
  try {
    const { user: abilityUser } = await authorization.canManageAllUsers().catch((e) => {
      if (e instanceof AccessControlError) {
        logEvent(
          e.user.id,
          { type: "User" },
          "AccessDenied",
          `Attempted to update user ${userID} active status`
        );
      }
      throw e;
    });

    const [user, privilegedUser] = await Promise.all([
      prisma.user.update({
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
      }),
      prisma.user.findUniqueOrThrow({
        where: {
          id: abilityUser.id,
        },
        select: {
          email: true,
        },
      }),
    ]);

    // Force update the cache with the new active value
    await activeStatusUpdate(userID, active);

    // Log the event
    await logEvent(
      userID,
      { type: "User", id: userID },
      active ? "UserActivated" : "UserDeactivated",
      `User ${user.email} (userID: ${userID}) was ${active ? "activated" : "deactivated"} by user ${
        privilegedUser.email
      } (userID: ${abilityUser.id})`
    );

    if (!active && user.email) {
      sendDeactivationEmail(user.email, reason);
    }

    return user;
  } catch (error) {
    logMessage.error(error as Error);
    throw error;
  }
};

type Overdue = { [key: string]: NagwareResult };

export const getUnprocessedSubmissionsForUser = async (userId: string) => {
  const overdue: Overdue = {};

  try {
    const templates = (await getAllTemplatesForUser()).map((template) => {
      const {
        id,
        form: { titleEn, titleFr },
        isPublished,
        createdAt,
      } = template;

      return {
        id,
        titleEn,
        titleFr,
        isPublished,
        createdAt: Number(createdAt),
      };
    });

    await Promise.all(
      templates.map(async (template) => {
        const allSubmissions = await listAllSubmissions(template.id);

        const unprocessed = await detectOldUnprocessedSubmissions(allSubmissions.submissions);

        if (unprocessed.level > 0) {
          overdue[template.id] = unprocessed;
        }
      })
    );
  } catch (e) {
    if (e instanceof AccessControlError) {
      logEvent(
        e.user.id,
        { type: "User" },
        "AccessDenied",
        `Attempted to get unprocessed submssions for user ${userId}`
      );
    }
    throw e;
  }

  return overdue;
};

export const addNoteToUser = async (id: string, note: string) => {
  await authorization.canManageUser(id).catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(
        e.user.id,
        { type: "User" },
        "AccessDenied",
        `Attempted to add a note to user ${id}`
      );
    }
    throw e;
  });

  await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      notes: note,
    },
  });
};
