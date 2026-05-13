import { prisma, prismaErrors, Privilege, Prisma } from "@gcforms/database";
import { authorization } from "@lib/privileges";
import { AccessControlError } from "@lib/auth/errors";
import { DeactivationReason, DeactivationReasons, NagwareResult } from "./types";
import { AuditLogAccessDeniedDetails, AuditLogDetails, logEvent } from "./auditLogs";
import { logMessage } from "@lib/logger";
import { sendDeactivationEmail } from "@lib/deactivate";
import { getAllTemplatesForUser } from "./templates";
import { listAllSubmissions } from "./vault";
import { detectOldUnprocessedSubmissions } from "./nagware";
import { AppUser } from "./types/user-types";
import { activeStatusUpdate } from "@lib/cache/userActiveStatus";

const userListSelect = {
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
} satisfies Prisma.UserSelect;

const userExportSelect = {
  id: true,
  name: true,
  email: true,
  active: true,
  lastLogin: true,
} satisfies Prisma.UserSelect;

export type UserSearchProperty = "all" | "name" | "email" | "id";
export type UserSearchState = "active" | "deactivated";

export type GetUsersPageOptions = {
  page?: number;
  pageSize?: number;
  query?: string;
  property?: UserSearchProperty;
  userState?: UserSearchState;
};

export type UsersPage = {
  users: AppUser[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ExportableUser = {
  name: string | null;
  email: string;
  lastLogin: Date | null;
};

const authorizeViewAllUsers = async () => {
  await authorization.canViewAllUsers().catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(
        e.user.id,
        { type: "User" },
        "AccessDenied",
        AuditLogAccessDeniedDetails.AccessDenied_AttemptedToListUsers
      );
    }
    throw e;
  });
};

const buildUserSearchWhere = ({
  query,
  property = "all",
  userState,
}: Pick<GetUsersPageOptions, "query" | "property" | "userState">):
  | Prisma.UserWhereInput
  | undefined => {
  const normalizedQuery = query?.trim();
  const where: Prisma.UserWhereInput = {};

  if (typeof userState !== "undefined") {
    where.active = userState === "active";
  }

  if (!normalizedQuery) {
    return Object.keys(where).length > 0 ? where : undefined;
  }

  const searchMode: Prisma.QueryMode = "insensitive";
  const searchConditionsByProperty: Record<UserSearchProperty, Prisma.UserWhereInput[]> = {
    all: [
      { name: { contains: normalizedQuery, mode: searchMode } },
      { email: { contains: normalizedQuery, mode: searchMode } },
    ],
    name: [{ name: { contains: normalizedQuery, mode: searchMode } }],
    email: [{ email: { contains: normalizedQuery, mode: searchMode } }],
    id: [{ id: normalizedQuery }],
  };

  where.OR = searchConditionsByProperty[property];

  return where;
};

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
      logEvent(
        e.user.id,
        { type: "User" },
        "AccessDenied",
        AuditLogAccessDeniedDetails.AccessDenied_AttemptedToGetUserById,
        { id }
      );
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
  await authorizeViewAllUsers();

  const users = await prisma.user
    .findMany({
      ...(where && { where }),
      select: userListSelect,
      orderBy: {
        id: "asc",
      },
    })
    .catch((e) => prismaErrors(e, []));

  return users;
};

export const getExportableUsers = async ({
  userState,
}: {
  userState: UserSearchState;
}): Promise<ExportableUser[]> => {
  await Promise.all([authorization.canViewAllUsers(), authorization.canAccessPrivileges()]);

  return prisma.user
    .findMany({
      where: { active: userState === "active" },
      select: userExportSelect,
      orderBy: [{ name: "asc" }, { email: "asc" }],
    })
    .catch((e) => prismaErrors(e, []));
};

export const getUsersPage = async ({
  page = 1,
  pageSize = 24,
  query,
  property = "all",
  userState,
}: GetUsersPageOptions): Promise<UsersPage> => {
  await authorizeViewAllUsers();

  const normalizedPage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  const normalizedPageSize = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 24;
  const where = buildUserSearchWhere({ query, property, userState });

  const [totalCount, users] = await Promise.all([
    prisma.user.count({ ...(where && { where }) }).catch((e) => prismaErrors(e, 0)),
    prisma.user
      .findMany({
        ...(where && { where }),
        select: userListSelect,
        skip: (normalizedPage - 1) * normalizedPageSize,
        take: normalizedPageSize,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      })
      .catch((e) => prismaErrors(e, [])),
  ]);

  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / normalizedPageSize);

  return {
    users,
    totalCount,
    page: normalizedPage,
    pageSize: normalizedPageSize,
    totalPages,
  };
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
  reason: DeactivationReason = DeactivationReasons.DEFAULT
) => {
  try {
    const { user: abilityUser } = await authorization.canManageAllUsers().catch((e) => {
      if (e instanceof AccessControlError) {
        logEvent(
          e.user.id,
          { type: "User" },
          "AccessDenied",
          AuditLogAccessDeniedDetails.AccessDenied_AttemptedToUpdateUserActiveStatus,
          { targetUserId: userID }
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
      AuditLogDetails.UserActiveStatusUpdate,
      {
        email: user.email,
        userID: userID,
        active: active ? "activated" : "deactivated",
        privilegedUserEmail: privilegedUser.email,
        privilegedUserId: abilityUser.id,
      }
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
        AuditLogAccessDeniedDetails.AccessDenied_AttemptToAccessUnprocessedSubmissions,
        { userId }
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
        AuditLogAccessDeniedDetails.AccessDenied_AttemptToAddNoteToUser,
        { userId: id }
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
