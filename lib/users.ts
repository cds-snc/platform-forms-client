import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { JWT } from "next-auth/jwt";
import { AccessControlError, checkPrivileges } from "@lib/privileges";
import { NagwareResult, UserAbility } from "./types";
import { logEvent } from "./auditLogs";
import { logMessage } from "@lib/logger";
import { Privilege } from "@prisma/client";
import { sendDeactivationEmail } from "@lib/deactivate";
import { getAllTemplatesForUser } from "./templates";
import { listAllSubmissions } from "./vault";
import { detectOldUnprocessedSubmissions } from "./nagware";
import { DBUser } from "./types/user-types";

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
  active: boolean;
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
        active: true,
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
export const getUser = async (
  ability: UserAbility,
  id: string
): Promise<boolean | SelectedUser> => {
  try {
    checkPrivileges(ability, [{ action: "view", subject: "User" }]);

    const user = await prisma.user
      .findFirstOrThrow({
        where: {
          id: id,
        },
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
      })
      .catch((e) => prismaErrors(e, false));

    return user;
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

interface SelectedUser
  extends Omit<DBUser, "privileges" | "image" | "emailVerified" | "lastLogin"> {
  privileges: {
    id: string;
    nameEn: string | null;
    nameFr: string | null;
    descriptionEn: string | null;
    descriptionFr: string | null;
  }[];
}

/**
 * Get all Users
 * @returns An array of all Users
 */
export const getUsers = async (ability: UserAbility): Promise<SelectedUser[] | never[]> => {
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
    if (error instanceof AccessControlError) {
      logEvent(
        ability.userID,
        { type: "User" },
        "AccessDenied",
        `Attempted to get user by id ${userID}`
      );
    }

    logMessage.error(error as Error);
    throw error;
  }
};

type Overdue = { [key: string]: NagwareResult };

type Templates = Array<{
  id: string;
  titleEn: string;
  titleFr: string;
  isPublished: boolean;
  createdAt: number | Date;
  [key: string]: string | boolean | number | Date;
}>;

export const getUnprocessedSubmissionsForUser = async (
  ability: UserAbility,
  userId: string,
  templates: Templates | false = false
) => {
  const overdue: Overdue = {};

  try {
    const user = await getUser(ability, userId);
    if (!user) return overdue;

    if (!templates) {
      templates = (await getAllTemplatesForUser(ability, userId)).map((template) => {
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
    }

    await Promise.all(
      templates.map(async (template) => {
        const allSubmissions = await listAllSubmissions(ability, template.id);

        const unprocessed = await detectOldUnprocessedSubmissions(allSubmissions.submissions);

        if (unprocessed.level > 0) {
          overdue[template.id] = unprocessed;
        }
      })
    );
  } catch (error) {
    logMessage.error(error as Error);
    // noop
  }

  return overdue;
};
