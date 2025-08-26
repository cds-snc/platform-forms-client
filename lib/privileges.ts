import { Prisma } from "@prisma/client";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { privilegeCheck, privilegePut, privilegeDelete } from "@lib/cache/privilegeCache";
import {
  createMongoAbility,
  MongoAbility,
  MongoQuery,
  subject as setSubjectType,
} from "@casl/ability";
import {
  Abilities,
  Privilege,
  Action,
  Subject,
  AnyObject,
  UserAbility,
} from "@lib/types/privileges-types";

import { Session } from "next-auth";

import get from "lodash/get";

import { logMessage } from "./logger";
import { logEvent } from "./auditLogs";
import { checkOne } from "./cache/flags";
import { InMemoryCache } from "./cache/inMemoryCache";
import { auth } from "@lib/auth/nextAuth";
import { AccessControlError } from "@lib/auth/errors";
import { getCurrentLanguage } from "@i18n/utils";
import { redirect } from "next/navigation";
import { cache } from "react";
/*
This file contains references to server side only modules.
Any attempt to import these functions into a browser will cause compilation failures
 */

// Maximum number of items to store in the cache: 100
// TTL for items in the cache: 1 minutes
const abilityCache = new InMemoryCache(100, 60);

export const getAbility = cache(async (): Promise<UserAbility> => {
  const session = await auth();
  if (!session) throw new Error("No session found");
  // If the privileges are cached, we can use them as a check that no changes have been made
  // and it is safe to use the cached ability
  const cachedPrivilegesRules = await privilegeCheck(session.user.id);
  const cachedAbility = abilityCache.get(session.user.id);
  if (cachedAbility && cachedPrivilegesRules !== null) {
    logMessage.debug(`Using cached ability for user ${session.user.id}`);
    return cachedAbility as UserAbility;
  } else {
    logMessage.debug(`Creating new ability for user ${session.user.id}`);
    const ability = createAbility(session);
    abilityCache.set(session.user.id, ability);
    return ability;
  }
});

export const createAbility = (session: Session): UserAbility => {
  const ability = createMongoAbility<MongoAbility<Abilities>>(
    session.user.privileges
  ) as UserAbility;
  ability.user = {
    id: session.user.id,
    email: session.user.email,
  };
  return ability;
};

export function interpolatePermissionCondition(
  condition: MongoQuery<AnyObject>,
  values: AnyObject
): MongoQuery<AnyObject> {
  const placeHolderRegex = /\$\{[^}]*\}/g;
  const objectPathRegex = /([a-zA-Z]+(\.*[a-zA-Z]+)+)/;

  const conditionAsString = JSON.stringify(condition);
  const placeHolder = conditionAsString.matchAll(placeHolderRegex);

  const interpolatedString = Array.from(placeHolder).reduce((acc, current) => {
    const objectPath = current[0].match(objectPathRegex);

    if (objectPath) {
      const value = get(values, objectPath[0]);

      if (value !== undefined) {
        return acc.replace(current[0], String(value));
      } else {
        throw new Error(
          `Could not interpolate permission condition because of missing value (${objectPath[0]})`
        );
      }
    } else {
      throw new Error("Could not find object path in permission condition placeholder");
    }
  }, conditionAsString);

  return JSON.parse(interpolatedString);
}

/**
 * Get the privileges rules associated to a user
 * @param userId id of a User
 * @returns An array of privileges associated to the user
 */
export const getPrivilegeRulesForUser = async (userId: string) => {
  try {
    const cachedPrivilegesRules = await privilegeCheck(userId);
    if (cachedPrivilegesRules?.length) return cachedPrivilegesRules;
    // Order privileges ascending so that Base Privileges are always applied first
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        privileges: {
          orderBy: {
            priority: "asc",
          },
        },
      },
    });

    if (!user || !user?.privileges) throw new Error("No privileges assigned to user");

    const userPrivilegeRules = user.privileges
      .map((privilege) => (privilege as Privilege).permissions)
      .flat()
      .map((p) => {
        return p.conditions
          ? {
              ...p,
              conditions: interpolatePermissionCondition(p.conditions, { user }),
            }
          : p;
      });

    await privilegePut(userId, userPrivilegeRules);

    return userPrivilegeRules;
  } catch (e) {
    return prismaErrors(e, []);
  }
};

/**
 * Update and overwrite existing privileges on a User
 * @param userID id of the user to be updated
 * @param privileges Array of privileges to be connect to user
 * @returns
 */
export const updatePrivilegesForUser = async (
  userID: string,
  privileges: { id: string; action: "add" | "remove" }[]
) => {
  try {
    const { user: abilityUser } = await authorization.canManageUser(userID).catch((e) => {
      if (e instanceof AccessControlError) {
        logEvent(
          e.user.id,
          { type: "Privilege" },
          "AccessDenied",
          `Attempted to modify privilege on user ${userID}`
        );
      }
      throw e;
    });

    const addPrivileges: { id: string }[] = [];
    const removePrivileges: { id: string }[] = [];

    privileges.forEach((privilege) => {
      if (privilege.action === "add") {
        addPrivileges.push({ id: privilege.id });
      } else {
        removePrivileges.push({ id: privilege.id });
      }
    });

    // Run prisma calls in parallel

    const [privilegesInfo, user, privilegedUser] = await Promise.all([
      prisma.privilege.findMany({
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.user.update({
        where: {
          id: userID,
        },
        data: {
          privileges: {
            connect: addPrivileges,
            disconnect: removePrivileges,
          },
        },
        select: {
          id: true,
          email: true,
          privileges: true,
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

    // Logging the events asynchronously to not block the function
    addPrivileges.forEach((privilege) =>
      logEvent(
        userID,
        { type: "Privilege", id: privilege.id },
        "GrantPrivilege",
        `Granted privilege : ${privilegesInfo.find((p) => p.id === privilege.id)?.name} to ${
          user.email
        } (userID: ${user.id}) by ${privilegedUser?.email} (userID: ${abilityUser.id})`
      )
    );

    removePrivileges.forEach((privilege) =>
      logEvent(
        userID,
        { type: "Privilege", id: privilege.id },
        "RevokePrivilege",
        `Revoked privilege : ${privilegesInfo.find((p) => p.id === privilege.id)?.name} from ${
          user.email
        } (userID: ${user.id}) by ${privilegedUser?.email} (userID: ${abilityUser.id})`
      )
    );

    // Remove existing values from Cache
    await privilegeDelete(userID);

    return user.privileges;
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
 * Get all privileges availabe in the application
 * @returns an array of privealges
 */
export const getAllPrivileges = async () => {
  try {
    await authorization.canAccessPrivileges();
    return await prisma.privilege.findMany({
      select: {
        id: true,
        name: true,
        descriptionEn: true,
        descriptionFr: true,
        permissions: true,
        priority: true,
      },
      orderBy: {
        priority: "asc",
      },
    });
  } catch (e) {
    return prismaErrors(e, []);
  }
};

export const getPrivilege = async (where: Prisma.PrivilegeWhereInput) => {
  try {
    await authorization.canAccessPrivileges();
    return await prisma.privilege.findFirst({
      where,
      select: {
        id: true,
        name: true,
        descriptionEn: true,
        descriptionFr: true,
        permissions: true,
        priority: true,
      },
      orderBy: {
        priority: "asc",
      },
    });
  } catch (e) {
    return prismaErrors(e, null);
  }
};

const _getSubject = async (subject: { type: Extract<Subject, string>; id: string }) => {
  if (subject.id === "all") {
    return {};
  }
  switch (subject.type) {
    case "User":
      return prisma.user.findUniqueOrThrow({
        where: {
          id: subject.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          lastLogin: true,
          active: true,
        },
      });
    case "FormRecord":
      return prisma.template.findUniqueOrThrow({
        where: {
          id: subject.id,
        },
        select: {
          id: true,
          created_at: true,
          updated_at: true,
          name: true,
          isPublished: true,
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              active: true,
            },
          },
        },
      });
    case "Privilege":
      return prisma.privilege.findUniqueOrThrow({
        where: {
          id: subject.id,
        },
      });
    case "Setting":
      return prisma.setting.findUniqueOrThrow({
        where: {
          internalId: subject.id,
        },
      });
    case "Flag":
      return { id: subject.id, value: await checkOne(subject.id) };
    default:
      throw new Error("Subject type not valid for privilege check");
  }
};

const _retrieveSubjects = async (
  cache: Map<string, unknown>,
  subject: {
    type: Extract<Subject, string>;
    scope: "all" | { subjectId: string } | { subjectIds: string[] };
  }
) => {
  if (subject.scope === "all") {
    return [{}];
  }
  if ("subjectId" in subject.scope) {
    const cachedItem = cache.get(`${subject.type}:${subject.scope.subjectId}`);
    if (cachedItem) return [cachedItem];

    const item = await _getSubject({ type: subject.type, id: subject.scope.subjectId });
    cache.set(`${subject.type}:${subject.scope.subjectId}`, item);
    return [item];
  }
  return Promise.all(
    subject.scope.subjectIds.map(async (id) => {
      const cachedItem = cache.get(`${subject.type}:${id}`);
      if (cachedItem) return cachedItem;

      const item = await _getSubject({ type: subject.type, id });
      cache.set(`${subject.type}:${id}`, item);
      return item;
    })
  );
};

/**
 * Check if a user has the ability to perform an action on a subject
 * @param ability The ability instance associated to a User
 * @param rules An array of rules to verify
 * @param logic Use an AND or OR logic comparison
 */
const _authorizationCheck = async (
  rules: {
    action: Action;
    subject: {
      type: Extract<Subject, string>;
      scope: "all" | { subjectId: string } | { subjectIds: string[] };
    };
    fields?: string[];
  }[],
  logic: "all" | "one" = "all"
) => {
  // Create a local scoped memory cache to store the subject objects between rules
  const cache = new Map();
  const ability = await getAbility();

  const result = await Promise.all(
    rules.flatMap(async ({ action, subject, fields }) => {
      const subjectsToValidate = await _retrieveSubjects(cache, subject);

      return subjectsToValidate.flatMap((subjectToValidate) => {
        if (fields) {
          return fields?.map((f) => {
            const ruleResult = ability.can(
              action,
              setSubjectType(subject.type, subjectToValidate),
              f
            );
            logMessage.debug(
              `Privilege Check ${ruleResult ? "PASS" : "FAIL"}: Can ${action} on ${subject.type} ${
                fields && `for field ${fields}`
              } `
            );
            return ruleResult;
          });
        } else {
          // There are no fields to validate
          const ruleResult = ability.can(action, setSubjectType(subject.type, subjectToValidate));
          logMessage.debug(
            `Privilege Check ${ruleResult ? "PASS" : "FAIL"}: Can ${action} on ${subject.type}`
          );
          return ruleResult;
        }
      });
    })
  )
    .then((results) => results.flat())
    .catch((e) => {
      const data = JSON.stringify(rules);
      logMessage.error(`Error in privilege check: ${e} data: ${data}`);
      //  On any error in the promise chain, default to forbidden
      throw new AccessControlError(ability.user.id, "Access Control Forbidden Action");
    });

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
    throw new AccessControlError(ability.user.id, "Access Control Forbidden Action");
  }
  return { user: ability.user };
};

export const authorization = {
  check: _authorizationCheck,
  /**
   * Check if a user has the ability to perform an action on a subject and return a boolean
   * @param rules An array of rules to verify
   * @param logic Use an AND or OR logic comparison
   * @returns A boolean value
   */
  checkAsBoolean: async (...args: Parameters<typeof _authorizationCheck>) => {
    return _authorizationCheck(...args)
      .then(() => true)
      .catch(() => false);
  },
  /**
   * Does the user have any privileges above Base and PublishForms
   */
  hasAdministrationPrivileges: async () => {
    return _authorizationCheck(
      [
        {
          action: "update",
          subject: { type: "FormRecord", scope: "all" },
        },
        {
          action: "view",
          subject: { type: "Privilege", scope: "all" },
        },
        {
          action: "view",
          subject: { type: "User", scope: "all" },
        },
        {
          action: "view",
          subject: { type: "Setting", scope: "all" },
        },
        {
          action: "view",
          subject: { type: "Flag", scope: "all" },
        },
      ],
      "one"
    );
  },
  /**
   * Verify if the user has the privilege to publish forms
   * @returns boolean
   */
  hasPublishFormsPrivilege: async () => {
    const ability = await getAbility();
    const result = await prisma.user.count({
      where: {
        id: ability.user.id,
        privileges: {
          some: {
            name: "PublishForms",
          },
        },
      },
    });
    return result > 0;
  },
  /**
   * Can the user create a new form
   */
  canCreateForm: async () => {
    return _authorizationCheck([
      {
        action: "create",
        subject: { type: "FormRecord", scope: "all" },
      },
    ]);
  },
  /**
   * Can the user view this specific form
   * @param formId The ID of the form
   */
  canViewForm: async (formId: string) => {
    return _authorizationCheck([
      {
        action: "view",
        subject: { type: "FormRecord", scope: { subjectId: formId } },
      },
    ]);
  },
  /**
   * Can the user edit this specific form
   * @param formId The ID of the form
   */
  canEditForm: async (formId: string) => {
    return _authorizationCheck([
      {
        action: "update",
        subject: { type: "FormRecord", scope: { subjectId: formId } },
      },
    ]);
  },
  /**
   * Can the user delete this specific form
   * @param formId The ID of the form
   */
  canDeleteForm: async (formId: string) => {
    return _authorizationCheck([
      {
        action: "delete",
        subject: { type: "FormRecord", scope: { subjectId: formId } },
      },
    ]);
  },
  /**
   * Can the user publish this specific form
   * @param formId The ID of the form
   */
  canPublishForm: async (formId: string) => {
    return _authorizationCheck([
      {
        action: "update",
        subject: { type: "FormRecord", scope: { subjectId: formId } },
        fields: ["isPublished"],
      },
    ]);
  },
  /**
   * Can the user view all forms in the application
   */
  canViewAllForms: async () => {
    return _authorizationCheck([
      {
        action: "view",
        subject: { type: "FormRecord", scope: "all" },
      },
    ]);
  },
  /**
   * Can the user modify any form in the application
   */
  canManageAllForms: async () => {
    return _authorizationCheck([
      {
        action: "update",
        subject: { type: "FormRecord", scope: "all" },
      },
    ]);
  },
  /**
   * Can view a users information
   * @param userId the ID of the user
   */
  canViewUser: async (userId: string) => {
    return _authorizationCheck([
      {
        action: "view",
        subject: { type: "User", scope: { subjectId: userId } },
      },
    ]);
  },
  /**
   * Can view all users information
   * @param userId the ID of the user
   */
  canViewAllUsers: async () => {
    return _authorizationCheck([
      {
        action: "view",
        subject: { type: "User", scope: "all" },
      },
    ]);
  },
  /**
   * Can the user administratively manage this specific user
   * @param userId The ID of the user
   */
  canManageUser: async (userId: string) => {
    return _authorizationCheck([
      {
        action: "update",
        subject: { type: "User", scope: { subjectId: userId } },
        fields: ["active"],
      },
    ]);
  },
  /**
   * Can the user update security questions on this specific user
   */
  canUpdateSecurityQuestions: async () => {
    const ability = await getAbility();
    return _authorizationCheck([
      {
        action: "update",
        subject: { type: "User", scope: { subjectId: ability.user.id } },
        fields: ["securityAnswers"],
      },
    ]);
  },

  /**
   * Can the user update the name on this specific user
   */
  canChangeUserName: async () => {
    const ability = await getAbility();
    return _authorizationCheck([
      {
        action: "update",
        subject: { type: "User", scope: { subjectId: ability.user.id } },
        fields: ["name"],
      },
    ]);
  },
  /**
   * Can the user modify all users in the application
   */
  canManageAllUsers: async () => {
    return _authorizationCheck([
      {
        action: "update",
        subject: { type: "User", scope: "all" },
      },
    ]);
  },
  /**
   * Can the user view application flags
   */
  canAccessFlags: async () => {
    return _authorizationCheck([
      {
        action: "view",
        subject: { type: "Flag", scope: "all" },
      },
    ]);
  },
  /**
   * Can the user manage application flags
   */
  canManageFlags: async () => {
    return _authorizationCheck([
      {
        action: "update",
        subject: { type: "Flag", scope: "all" },
      },
    ]);
  },
  /**
   * Can the user view application settings
   */
  canAccessSettings: async () => {
    return _authorizationCheck([
      {
        action: "view",
        subject: { type: "Setting", scope: "all" },
      },
    ]);
  },
  /**
   * Can the user manage application settings
   */
  canManageSettings: async () => {
    return _authorizationCheck([
      {
        action: "update",
        subject: { type: "Setting", scope: "all" },
      },
    ]);
  },
  /**
   * Can the user view application privileges
   */
  canAccessPrivileges: async () => {
    return _authorizationCheck([
      {
        action: "view",
        subject: { type: "Privilege", scope: "all" },
      },
    ]);
  },
  canAccessBetaComponents: async (flag: string) => {
    const session = await auth();
    const userFeatureFlags = session?.user.featureFlags;
    if (!userFeatureFlags || userFeatureFlags.length < 1) {
      return false;
    }
    return userFeatureFlags.includes(flag);
  },
  unauthorizedRedirect: async () => {
    const language = await getCurrentLanguage();
    redirect(`/${language}/unauthorized`);
  },
};
