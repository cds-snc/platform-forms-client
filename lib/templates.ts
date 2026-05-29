import { formCache } from "./cache/formCache";
import { prisma, prismaErrors, Prisma } from "@gcforms/database";
import {
  PublicFormRecord,
  FormRecord,
  FormProperties,
  DeliveryOption,
  SecurityAttribute,
  ClosedDetails,
} from "@lib/types";

import { authorization, getAbility } from "./privileges";
import { AuditLogAccessDeniedDetails, AuditLogDetails, AuditLogEvent, logEvent } from "./auditLogs";
import { logMessage } from "@lib/logger";
import { unprocessedSubmissions, deleteDraftFormResponses } from "./vault";
import { deleteKey } from "./serviceAccount";
import { ownerRemovedEmailTemplate } from "./invitations/emailTemplates/ownerRemovedEmailTemplate";
import { sendEmail } from "./integration/notifyConnector";
import { youHaveBeenRemovedEmailTemplate } from "./invitations/emailTemplates/youHaveBeenRemovedEmailTemplate";
import { ownerAddedEmailTemplate } from "./invitations/emailTemplates/ownerAddedEmailTemplate";
import { isValidISODate } from "./utils/date/isValidISODate";
import { validateTemplate } from "@lib/utils/form-builder/validate";
import { dateHasPast } from "@lib/utils";
import { validateTemplateSize } from "@lib/utils/validateTemplateSize";
import { NotificationsInterval } from "@gcforms/types";
import { checkOne } from "@lib/cache/flags";
import { checkForBetaComponentsAsync } from "./validation/betaCheck";
import { invalidateTemplateEditLockUserCountCache } from "./editLocks";
import type { TemplateVersionOption } from "@lib/types/form-builder-types";

const checkFlag = async (flag: string) => {
  return (await Promise.all([checkOne(flag), authorization.canAccessBetaComponents(flag)])).reduce(
    (prev, curr) => prev || curr
  );
};

const TEMPLATE_VERSION_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  SUPERSEDED: "SUPERSEDED",
} as const;

type TemplateVersionStatus = (typeof TEMPLATE_VERSION_STATUS)[keyof typeof TEMPLATE_VERSION_STATUS];

type TemplateVersionSnapshot = {
  id: string;
  versionNumber: number;
  status: TemplateVersionStatus;
  jsonConfig: Prisma.JsonValue;
  createdAt?: Date;
  updatedAt?: Date;
  publishedAt?: Date | null;
  supersededAt?: Date | null;
  createdByUserId?: string | null;
  publishedByUserId?: string | null;
  publishReason?: string;
  publishFormType?: string;
  publishDesc?: string;
};

type TemplateRecordForParsing = {
  id: string;
  created_at?: Date;
  updated_at?: Date;
  name: string;
  isPublished: boolean;
  currentPublishedVersionId?: string | null;
  currentDraftVersionId?: string | null;
  currentPublishedVersion?: TemplateVersionSnapshot | null;
  currentDraftVersion?: TemplateVersionSnapshot | null;
  deliveryOption: {
    emailAddress: string;
    emailSubjectEn: string | null;
    emailSubjectFr: string | null;
  } | null;
  securityAttribute: string;
  formPurpose: string;
  publishReason: string;
  publishFormType: string;
  publishDesc: string;
  closingDate?: Date | null;
  closedDetails?: Prisma.JsonValue | null;
  saveAndResume: boolean;
  notificationsInterval?: number | null;
  ttl?: Date | null;
};

type TemplateVersionPointers = Pick<
  TemplateRecordForParsing,
  "currentDraftVersion" | "currentPublishedVersion"
>;

const templateVersionSelect = {
  id: true,
  versionNumber: true,
  status: true,
  jsonConfig: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  supersededAt: true,
  createdByUserId: true,
  publishedByUserId: true,
  publishReason: true,
  publishFormType: true,
  publishDesc: true,
} satisfies Prisma.TemplateVersionSelect;

const templateRecordInclude = {
  deliveryOption: true,
  currentDraftVersion: {
    select: templateVersionSelect,
  },
  currentPublishedVersion: {
    select: templateVersionSelect,
  },
} satisfies Prisma.TemplateInclude;

const parseJsonConfig = (raw: Prisma.JsonValue): FormProperties => {
  if (typeof raw === "string") {
    return JSON.parse(raw) as FormProperties;
  }

  return raw as FormProperties;
};

const getBuilderVersion = (template: TemplateVersionPointers) => {
  return template.currentDraftVersion ?? template.currentPublishedVersion ?? null;
};

const getPublishedVersion = (template: TemplateVersionPointers) => {
  return template.currentPublishedVersion ?? null;
};

const getTemplateVersionForList = (template: TemplateVersionPointers) => {
  return template.currentDraftVersion ?? template.currentPublishedVersion ?? null;
};

const getNotificationFormProperties = (template: TemplateVersionPointers): FormProperties => {
  const version = getTemplateVersionForList(template);

  if (!version) {
    throw new Error("Template does not have a resolvable template version for notification");
  }

  return parseJsonConfig(version.jsonConfig);
};

// ******************************************
// Internal Module Functions
// ******************************************
const _parseTemplate = (
  template: TemplateRecordForParsing,
  options?: {
    version?: TemplateVersionSnapshot | null;
    isPublished?: boolean;
  }
): FormRecord => {
  const version = options?.version ?? getTemplateVersionForList(template);

  if (!version) {
    throw new Error(`Template ${template.id} does not have a resolvable template version`);
  }

  return {
    id: template.id,
    ...(template.created_at && {
      createdAt: template.created_at?.toString(),
    }),
    ...(template.updated_at && {
      updatedAt: template.updated_at.toString(),
    }),
    name: template.name,
    form: parseJsonConfig(version.jsonConfig),
    isPublished: options?.isPublished ?? template.isPublished,
    templateVersionId: version.id,
    templateVersionNumber: version.versionNumber,
    templateVersionStatus: version.status,
    currentPublishedVersionId: template.currentPublishedVersionId,
    currentDraftVersionId: template.currentDraftVersionId,
    hasDraftVersion: Boolean(template.currentDraftVersionId),
    hasPublishedVersion: Boolean(template.currentPublishedVersionId),
    ...(template.deliveryOption && {
      deliveryOption: {
        emailAddress: template.deliveryOption.emailAddress,
        ...(template.deliveryOption.emailSubjectEn && {
          emailSubjectEn: template.deliveryOption.emailSubjectEn,
        }),
        ...(template.deliveryOption.emailSubjectFr && {
          emailSubjectFr: template.deliveryOption.emailSubjectFr,
        }),
      },
    }),
    formPurpose: template.formPurpose,
    publishReason: template.publishReason,
    publishFormType: template.publishFormType,
    publishDesc: template.publishDesc,
    securityAttribute: template.securityAttribute as SecurityAttribute,
    ...(template.closingDate && {
      closingDate: template.closingDate.toString(),
    }),
    closedDetails: template.closedDetails as ClosedDetails,
    saveAndResume: template.saveAndResume,
    notificationsInterval: template.notificationsInterval as NotificationsInterval,
    ...(template.ttl && { ttl: template.ttl }),
  };
};

// ******************************************
// Exportable Module Functions
// ******************************************

export type CreateTemplateCommand = {
  userID: string;
  formConfig: FormProperties;
  name?: string;
  deliveryOption?: DeliveryOption;
  securityAttribute?: SecurityAttribute;
  formPurpose?: string;
  publishReason?: string;
  publishFormType?: string;
  publishDesc?: string;
  notificationsInterval?: NotificationsInterval;
};

export type UpdateTemplateCommand = {
  formID: string;
  formConfig: FormProperties;
  name?: string;
  deliveryOption?: DeliveryOption;
  securityAttribute?: SecurityAttribute;
  formPurpose?: string;
  publishReason?: string;
  publishFormType?: string;
  publishDesc?: string;
  notificationsInterval?: NotificationsInterval;
};

export class InvalidFormConfigError extends Error {
  constructor(message?: string) {
    super(message ?? "InvalidFormConfigError");
    Object.setPrototypeOf(this, InvalidFormConfigError.prototype);
  }
}

export class TemplateAlreadyPublishedError extends Error {
  constructor(message?: string) {
    super(message ?? "TemplateAlreadyPublishedError");
    Object.setPrototypeOf(this, TemplateAlreadyPublishedError.prototype);
  }
}

export class TemplateHasUnprocessedSubmissions extends Error {
  constructor(message?: string) {
    super(message ?? "TemplateHasUnprocessedSubmissions");
    Object.setPrototypeOf(this, TemplateHasUnprocessedSubmissions.prototype);
  }
}

/**
 * Creates a Form Template record
 * @param config Form Template configuration
 * @returns Form Record or null if creation was not sucessfull.
 */
export async function createTemplate(command: CreateTemplateCommand): Promise<FormRecord | null> {
  const { user } = await authorization.canCreateForm().catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form" },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToCreateForm
    );
    throw e;
  });

  await checkForBetaComponentsAsync(command.formConfig.elements, checkFlag);

  const validationResult = validateTemplate(command.formConfig);

  if (!validationResult.valid) {
    logMessage.warn(
      `[templates][createTemplate] Form config is invalid.\nReasons: ${JSON.stringify(
        validationResult.errors
      )}.\nConfig: ${JSON.stringify(command.formConfig)}`
    );
    throw new InvalidFormConfigError();
  }

  const isValid = validateTemplateSize(JSON.stringify(command.formConfig));

  if (!isValid) {
    logMessage.warn(
      `[templates][createTemplate] Template size exceeds the limit.\nConfig: ${JSON.stringify(
        command.formConfig
      )}`
    );
    throw new InvalidFormConfigError();
  }

  const createdTemplate = await prisma
    .$transaction(async (tx) => {
      const template = await tx.template.create({
        data: {
          ...(command.name && {
            name: command.name,
          }),
          ...(command.deliveryOption && {
            deliveryOption: {
              create: {
                emailAddress: command.deliveryOption.emailAddress,
                emailSubjectEn: command.deliveryOption.emailSubjectEn,
                emailSubjectFr: command.deliveryOption.emailSubjectFr,
              },
            },
          }),
          ...(command.securityAttribute && {
            securityAttribute: command.securityAttribute as string,
          }),
          users: {
            connect: { id: command.userID },
          },
          ...(command.formPurpose && { formPurpose: command.formPurpose }),
          ...(command.notificationsInterval !== undefined && {
            notificationsInterval: command.notificationsInterval,
          }),
        },
        select: {
          id: true,
        },
      });

      const draftVersion = await tx.templateVersion.create({
        data: {
          templateId: template.id,
          versionNumber: 1,
          status: TEMPLATE_VERSION_STATUS.DRAFT,
          jsonConfig: command.formConfig as Prisma.JsonObject,
          createdByUserId: user.id,
        },
        select: {
          id: true,
        },
      });

      return tx.template.update({
        where: {
          id: template.id,
        },
        data: {
          currentDraftVersionId: draftVersion.id,
        },
        include: templateRecordInclude,
      });
    })
    .catch((e) => prismaErrors(e, null));

  if (createdTemplate === null) return null;

  logEvent(user.id, { type: "Form", id: createdTemplate?.id }, "CreateForm");

  return _parseTemplate(createdTemplate, {
    version: createdTemplate.currentDraftVersion,
    isPublished: false,
  });
}

/**
 * Get all form templates. Must has Manage All Forms privilege.
 * @returns An array of Form Records
 */
export async function getAllTemplates(options?: {
  requestedWhere?: Prisma.TemplateWhereInput;
  sortByDateUpdated?: "asc" | "desc";
}): Promise<Array<FormRecord>> {
  try {
    const { requestedWhere, sortByDateUpdated } = options ?? {};
    // Can a user view any Template
    const { user } = await authorization.canViewAllForms().catch((e) => {
      logEvent(
        e.user.id,
        { type: "Form" },
        "AccessDenied",
        AuditLogAccessDeniedDetails.AccessDenied_AttempttoAccessAllSystemForms
      );
      throw e;
    });

    const templates = await prisma.template
      .findMany({
        where: {
          ...(requestedWhere && requestedWhere),
        },
        include: templateRecordInclude,
        ...(sortByDateUpdated && {
          orderBy: {
            updated_at: sortByDateUpdated,
          },
        }),
      })
      .catch((e) => prismaErrors(e, []));

    // Only log the event if templates are found
    if (templates.length > 0)
      logEvent(user.id, { type: "Form" }, "ReadForm", AuditLogDetails.AccessedAllSystemForms);

    return templates.map((template) => _parseTemplate(template));
  } catch (e) {
    logMessage.error(e);
    return [];
  }
}

export type TemplateOptions = {
  sortByDateUpdated?: "asc" | "desc";
  requestedWhere?: Prisma.TemplateWhereInput;
};

/**
 * Get all form templates for the User calling the function.
 * @returns An array of Form Records
 */
export async function getAllTemplatesForUser(
  options?: TemplateOptions
): Promise<Array<FormRecord>> {
  try {
    const ability = await getAbility();

    const { sortByDateUpdated, requestedWhere } = options ?? {};
    const templates = await prisma.template
      .findMany({
        where: {
          ...(requestedWhere && requestedWhere),
          users: {
            some: {
              id: ability.user.id,
            },
          },
        },
        include: templateRecordInclude,
        ...(sortByDateUpdated && {
          orderBy: {
            updated_at: sortByDateUpdated,
          },
        }),
      })
      .catch((e) => prismaErrors(e, []));

    // Only log the event if templates are found
    if (templates.length > 0)
      logEvent(ability.user.id, { type: "Form" }, "ReadForm", AuditLogDetails.AccessedForms, {
        formList: templates.map((template) => template.id).toString(),
      });

    return templates.map((template) => _parseTemplate(template));
  } catch (e) {
    logMessage.error(e);
    return [];
  }
}

/**
 * Get a form template by ID (only includes public information but does not require any permission)
 * @param formID ID of form template
 * @returns PublicFormRecord
 */
export async function getPublicTemplateByID(formID: string): Promise<PublicFormRecord | null> {
  try {
    if (formCache.cacheAvailable) {
      // This value will always be the latest if it exists because
      // the cache is invalidated on change of a template
      const cachedValue = await formCache.check(formID);
      if (cachedValue) {
        return cachedValue;
      }
    }

    const template = await prisma.template
      .findUnique({
        where: {
          id: formID,
        },
        include: templateRecordInclude,
      })
      .catch((e) => prismaErrors(e, null));

    // Short circuit the public record filtering if no form record is found or the form is marked as deleted (ttl != null)
    if (!template || template.ttl || !template.currentPublishedVersion) return null;

    const parsedTemplate = _parseTemplate(template, {
      version: getPublishedVersion(template),
      isPublished: true,
    });
    const publicFormRecord = onlyIncludePublicProperties(parsedTemplate);

    if (formCache.cacheAvailable) formCache.set(formID, publicFormRecord);

    return publicFormRecord;
  } catch (e) {
    logMessage.error(e);
    return null;
  }
}

export async function getTemplatePublishedStatus(formID: string): Promise<boolean | null> {
  const template = await prisma.template
    .findUnique({
      where: {
        id: formID,
      },
      select: {
        isPublished: true,
        currentDraftVersionId: true,
        currentPublishedVersionId: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!template) return null;

  return template.isPublished;
}

export async function getTemplateVersionState(formID: string): Promise<{
  isPublished: boolean;
  hasDraftVersion: boolean;
  currentPublishedVersionId?: string | null;
  currentDraftVersionId?: string | null;
} | null> {
  const template = await prisma.template
    .findUnique({
      where: {
        id: formID,
      },
      select: {
        isPublished: true,
        currentPublishedVersionId: true,
        currentDraftVersionId: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!template) return null;

  return {
    isPublished: template.isPublished,
    hasDraftVersion: Boolean(template.currentDraftVersionId),
    currentPublishedVersionId: template.currentPublishedVersionId,
    currentDraftVersionId: template.currentDraftVersionId,
  };
}

/**
 * Get a form template by ID (includes full template information but requires view permission)
 * @param formID ID of form template
 * @returns FormRecord
 */
export async function getFullTemplateByID(
  formID: string,
  allowDeleted?: boolean
): Promise<FormRecord | null> {
  try {
    const { user } = await authorization.canViewForm(formID, allowDeleted).catch((e) => {
      logEvent(
        e.user.id,
        { type: "Form", id: formID },
        "AccessDenied",
        AuditLogAccessDeniedDetails.AccessDenied_AttemptedToReadFormObject
      );
      throw e;
    });

    const template = await prisma.template
      .findUnique({
        where: {
          id: formID,
          ttl: allowDeleted ? { not: null } : null,
        },
        include: templateRecordInclude,
      })
      .catch((e) => prismaErrors(e, null));

    if (!template) return null;

    logEvent(user.id, { type: "Form", id: formID }, "ReadForm");

    const version = getBuilderVersion(template);

    return _parseTemplate(template, {
      version,
      isPublished: version?.status === TEMPLATE_VERSION_STATUS.PUBLISHED,
    });
  } catch (e) {
    return null;
  }
}

export async function getTemplateVersionOptionsForTemplate(
  formID: string
): Promise<TemplateVersionOption[]> {
  const { user } = await authorization.canViewForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptedToReadFormObject
    );
    throw e;
  });

  const template = await prisma.template
    .findUnique({
      where: {
        id: formID,
        ttl: null,
      },
      select: {
        currentPublishedVersionId: true,
        versions: {
          where: {
            status: {
              in: [TEMPLATE_VERSION_STATUS.PUBLISHED, TEMPLATE_VERSION_STATUS.SUPERSEDED],
            },
          },
          select: {
            id: true,
            versionNumber: true,
            status: true,
            createdAt: true,
            publishedAt: true,
          },
          orderBy: {
            versionNumber: "desc",
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!template) return [];

  logEvent(user.id, { type: "Form", id: formID }, "ReadForm");

  return template.versions.map((version) => ({
    id: version.id,
    versionNumber: version.versionNumber,
    status: version.status,
    createdAt: version.createdAt.toISOString(),
    publishedAt: version.publishedAt?.toISOString() ?? null,
    isCurrentPublished: template.currentPublishedVersionId === version.id,
  }));
}

export async function getTemplateForResponseDownload(
  formID: string,
  templateVersionId?: string
): Promise<FormRecord | null> {
  try {
    const { user } = await authorization.canViewForm(formID).catch((e) => {
      logEvent(
        e.user.id,
        { type: "Form", id: formID },
        "AccessDenied",
        AuditLogAccessDeniedDetails.AccessDenied_AttemptedToReadFormObject
      );
      throw e;
    });

    const template = await prisma.template
      .findUnique({
        where: {
          id: formID,
          ttl: null,
        },
        include: templateRecordInclude,
      })
      .catch((e) => prismaErrors(e, null));

    if (!template) return null;

    logEvent(user.id, { type: "Form", id: formID }, "ReadForm");

    const requestedVersion = templateVersionId
      ? await prisma.templateVersion
          .findFirst({
            where: {
              id: templateVersionId,
              templateId: formID,
              status: {
                in: [TEMPLATE_VERSION_STATUS.PUBLISHED, TEMPLATE_VERSION_STATUS.SUPERSEDED],
              },
            },
            select: templateVersionSelect,
          })
          .catch((e) => prismaErrors(e, null))
      : null;

    if (templateVersionId && !requestedVersion) return null;

    const version =
      requestedVersion ?? getPublishedVersion(template) ?? getBuilderVersion(template);

    return _parseTemplate(template, {
      version,
      isPublished: Boolean(getPublishedVersion(template)),
    });
  } catch (e) {
    return null;
  }
}

export async function getTemplateWithAssociatedUsers(formID: string): Promise<{
  formRecord: FormRecord;
  users: { id: string; name: string | null; email: string }[];
} | null> {
  const { user } = await authorization.canViewForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToListAssignedUsers
    );
    throw e;
  });
  const templateWithAssociatedUsers = await prisma.template
    .findUnique({
      where: {
        id: formID,
      },
      include: {
        currentDraftVersion: {
          select: templateVersionSelect,
        },
        currentPublishedVersion: {
          select: templateVersionSelect,
        },
        deliveryOption: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!templateWithAssociatedUsers) return null;

  logEvent(user.id, { type: "Form", id: formID }, "ReadForm", AuditLogDetails.RetrieveFormUsers);
  const version = getBuilderVersion(templateWithAssociatedUsers);
  return {
    formRecord: _parseTemplate(templateWithAssociatedUsers, {
      version,
      isPublished: version?.status === TEMPLATE_VERSION_STATUS.PUBLISHED,
    }),
    users: templateWithAssociatedUsers.users,
  };
}

/**
 * Update a form template
 * @param template A Form Record containing updated information
 * @returns The updated form template or null if the record does not exist
 */
export async function updateTemplate(command: UpdateTemplateCommand): Promise<FormRecord | null> {
  const { user } = await authorization.canEditForm(command.formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: command.formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateForm
    );
    throw e;
  });

  await checkForBetaComponentsAsync(command.formConfig.elements, checkFlag).catch((e) => {
    logMessage.warn(`User ${user.email} tried to use beta form components without flags being set`);
    throw e;
  });

  const validationResult = validateTemplate(command.formConfig);

  if (!validationResult.valid) {
    logMessage.warn(
      `[templates][updateTemplate] Form config is invalid.\nReasons: ${JSON.stringify(
        validationResult.errors
      )}.\nConfig: ${JSON.stringify(command.formConfig)}`
    );
    throw new InvalidFormConfigError();
  }

  const isValid = validateTemplateSize(JSON.stringify(command.formConfig));

  if (!isValid) {
    logMessage.warn(
      `[templates][updateTemplate] Template size exceeds the limit.\nConfig: ${JSON.stringify(
        command.formConfig
      )}`
    );
    throw new InvalidFormConfigError();
  }

  const currentTemplate = await prisma.template.findUnique({
    where: {
      id: command.formID,
    },
    select: {
      name: true,
      deliveryOption: true,
      securityAttribute: true,
      currentDraftVersionId: true,
    },
  });

  if (!currentTemplate?.currentDraftVersionId) {
    throw new TemplateAlreadyPublishedError(
      "Create a new draft version before editing a published template."
    );
  }
  const currentDraftVersionId = currentTemplate.currentDraftVersionId;

  const updatedTemplate = await prisma
    .$transaction(async (tx) => {
      await tx.templateVersion.update({
        where: {
          id: currentDraftVersionId,
        },
        data: {
          jsonConfig: command.formConfig as Prisma.JsonObject,
        },
      });

      return tx.template.update({
        where: {
          id: command.formID,
        },
        data: {
          name: command.name,
          ...(command.deliveryOption && {
            deliveryOption: {
              upsert: {
                create: {
                  emailAddress: command.deliveryOption.emailAddress,
                  emailSubjectEn: command.deliveryOption.emailSubjectEn,
                  emailSubjectFr: command.deliveryOption.emailSubjectFr,
                },
                update: {
                  emailAddress: command.deliveryOption.emailAddress,
                  emailSubjectEn: command.deliveryOption.emailSubjectEn,
                  emailSubjectFr: command.deliveryOption.emailSubjectFr,
                },
              },
            },
          }),
          ...(command.securityAttribute && {
            securityAttribute: command.securityAttribute as string,
          }),
          ...(command.formPurpose && { formPurpose: command.formPurpose }),
          ...(command.notificationsInterval !== undefined && {
            notificationsInterval: command.notificationsInterval as NotificationsInterval,
          }),
        },
        include: templateRecordInclude,
      });
    })
    .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) throw new TemplateAlreadyPublishedError();

  if (formCache.cacheAvailable) formCache.invalidate(command.formID);

  // Log the audit events
  command.name !== undefined &&
    (currentTemplate?.name ?? "") !== command.name &&
    logEvent(
      user.id,
      { type: "Form", id: command.formID },
      AuditLogEvent.ChangeFormName,
      AuditLogDetails.UpdatedFormName,
      { newFormName: command.name ?? "" }
    );
  command.deliveryOption &&
    command.deliveryOption !== currentTemplate?.deliveryOption &&
    logEvent(
      user.id,
      { type: "Form", id: command.formID },
      "ChangeDeliveryOption",
      AuditLogDetails.ChangeDeliveryOption,
      {
        deliveryOption: Object.keys(command.deliveryOption)
          .map((key) => `${key}: ${command.deliveryOption && command.deliveryOption[key]}`)
          .join(", "),
      }
    );
  command.securityAttribute &&
    command.securityAttribute !== currentTemplate?.securityAttribute &&
    logEvent(
      user.id,
      { type: "Form", id: command.formID },
      AuditLogEvent.ChangeSecurityAttribute,
      AuditLogDetails.ChangeSecurityAttribute,
      { securityAttribute: command.securityAttribute ?? "" }
    );
  logEvent(
    user.id,
    { type: "Form", id: command.formID },
    "UpdateForm",
    AuditLogDetails.FormContentUpdated
  );

  return _parseTemplate(updatedTemplate, {
    version: updatedTemplate.currentDraftVersion,
    isPublished: false,
  });
}

/**
 * Update `isPublished` value for a specific form.
 */
export async function updateIsPublishedForTemplate(
  formID: string,
  isPublished: boolean,
  publishReason: string,
  publishFormType: string,
  publishDescription: string
): Promise<FormRecord | null> {
  // Alias the isPublished value to newPublishStatus for clarity within the function
  const newPublishStatus = isPublished;

  const { user } = await authorization.canPublishForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToPublishForm
    );
    throw e;
  });

  if (!newPublishStatus) {
    throw new Error("Unpublishing template versions is not supported.");
  }

  const templateVersionState = await getTemplateVersionState(formID);

  // Delete all form responses created during first-time draft mode. Republish keeps live responses.
  if (
    newPublishStatus &&
    process.env.APP_ENV !== "test" &&
    templateVersionState?.isPublished === false
  ) {
    try {
      await deleteDraftFormResponses(formID);
    } catch (e) {
      if (e instanceof TemplateAlreadyPublishedError) {
        // Already published, so we can just return the full template
        return getFullTemplateByID(formID, false);
      }

      throw e;
    }
  }

  const updatedTemplate = await prisma
    .$transaction(async (tx) => {
      const template = await tx.template.findUnique({
        where: {
          id: formID,
        },
        include: templateRecordInclude,
      });

      if (!template) return null;

      if (!template.currentDraftVersion) {
        return template.isPublished ? template : null;
      }

      const now = new Date();

      if (template.currentPublishedVersionId) {
        await tx.templateVersion.update({
          where: {
            id: template.currentPublishedVersionId,
          },
          data: {
            status: TEMPLATE_VERSION_STATUS.SUPERSEDED,
            supersededAt: now,
          },
        });
      }

      await tx.templateVersion.update({
        where: {
          id: template.currentDraftVersion.id,
        },
        data: {
          status: TEMPLATE_VERSION_STATUS.PUBLISHED,
          publishedAt: now,
          publishedByUserId: user.id,
          publishReason,
          publishFormType,
          publishDesc: publishDescription,
        },
      });

      return tx.template.update({
        where: {
          id: formID,
        },
        data: {
          isPublished: true,
          currentPublishedVersionId: template.currentDraftVersion.id,
          currentDraftVersionId: null,
          publishReason,
          publishFormType,
          publishDesc: publishDescription,
        },
        include: templateRecordInclude,
      });
    })
    .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return updatedTemplate;

  if (formCache.cacheAvailable) formCache.invalidate(formID);

  logEvent(user.id, { type: "Form", id: formID }, "PublishForm");

  return _parseTemplate(updatedTemplate, {
    version: updatedTemplate.currentPublishedVersion,
    isPublished: true,
  });
}

export async function createDraftVersionForTemplate(formID: string): Promise<FormRecord | null> {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateForm
    );
    throw e;
  });

  const updatedTemplate = await prisma
    .$transaction(async (tx) => {
      const template = await tx.template.findUnique({
        where: {
          id: formID,
        },
        include: {
          ...templateRecordInclude,
          versions: {
            select: {
              versionNumber: true,
            },
            orderBy: {
              versionNumber: "desc",
            },
            take: 1,
          },
        },
      });

      if (!template?.currentPublishedVersion) return null;

      if (template.currentDraftVersion) {
        return template;
      }

      const nextVersionNumber = (template.versions[0]?.versionNumber ?? 0) + 1;
      const draftVersion = await tx.templateVersion.create({
        data: {
          templateId: formID,
          versionNumber: nextVersionNumber,
          status: TEMPLATE_VERSION_STATUS.DRAFT,
          jsonConfig: template.currentPublishedVersion.jsonConfig as Prisma.JsonObject,
          createdByUserId: user.id,
        },
        select: {
          id: true,
        },
      });

      return tx.template.update({
        where: {
          id: formID,
        },
        data: {
          currentDraftVersionId: draftVersion.id,
        },
        include: templateRecordInclude,
      });
    })
    .catch((e) => prismaErrors(e, null));

  if (!updatedTemplate) return null;

  if (formCache.cacheAvailable) formCache.invalidate(formID);

  logEvent(user.id, { type: "Form", id: formID }, "UpdateForm", AuditLogDetails.FormContentUpdated);

  return _parseTemplate(updatedTemplate, {
    version: updatedTemplate.currentDraftVersion,
    isPublished: false,
  });
}

class TemplateNotFoundError extends Error {}
class UserNotFoundError extends Error {}

/**
 * Remove a user from a form
 *
 * @param formID Form ID
 * @param userID User to be removed ID
 */
export async function removeAssignedUserFromTemplate(
  formID: string,
  userID: string
): Promise<void> {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToRemoveAssignedUser
    );
    throw e;
  });

  const template = await prisma.template.findUnique({
    where: {
      id: formID,
    },
    select: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (template === null) {
    logMessage.warn(
      `Can not remove assigned user ${userID} on template ${formID}.  Template does not exist`
    );
    throw new TemplateNotFoundError();
  }

  const userToRemove = template.users.find((user) => user.id === userID);

  if (!userToRemove) {
    logMessage.warn(
      `Can not remove assigned user ${userID} on template ${formID}.  User is not assigned`
    );
    throw new UserNotFoundError();
  }

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
      },
      include: {
        currentDraftVersion: {
          select: templateVersionSelect,
        },
        currentPublishedVersion: {
          select: templateVersionSelect,
        },
        users: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      data: {
        users: {
          disconnect: {
            id: userID,
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return;

  await invalidateTemplateEditLockUserCountCache(formID);

  logEvent(
    user.id,
    { type: "Form", id: formID },
    "RevokeFormAccess",
    AuditLogDetails.RevokeFormAccess,
    { userId: userID }
  );

  notifyOwnersOwnerRemoved(
    userToRemove,
    getNotificationFormProperties(updatedTemplate),
    updatedTemplate.users
  );
}

/**
 * Assign a user to a form
 *
 * @param ability
 * @param formID
 * @param userID
 */
export async function assignUserToTemplate(formID: string, userID: string): Promise<void> {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToRemoveAssignedUser
    );
    throw e;
  });

  const template = await prisma.template.findUnique({
    where: {
      id: formID,
    },
    select: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (template === null) {
    logMessage.warn(`Can not add user ${userID} to template ${formID}.  Template does not exist`);
    throw new TemplateNotFoundError();
  }

  const userToAdd = template.users.find((user) => user.id === userID);

  if (!userToAdd) {
    logMessage.warn(`Can not add user ${userID} to template ${formID}.  User does not exist`);
    throw new UserNotFoundError();
  }

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
      },
      include: {
        currentDraftVersion: {
          select: templateVersionSelect,
        },
        currentPublishedVersion: {
          select: templateVersionSelect,
        },
        users: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      data: {
        users: {
          connect: {
            id: userID,
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  // No changes
  if (updatedTemplate === null) return;

  await invalidateTemplateEditLockUserCountCache(formID);

  logEvent(
    user.id,
    { type: "Form", id: formID },
    AuditLogEvent.InvitationAccepted,
    AuditLogDetails.AcceptedInvitation,
    { userEmail: user.email }
  );

  notifyOwnersOwnerAdded(
    userToAdd,
    getNotificationFormProperties(updatedTemplate),
    updatedTemplate.users
  );
}

/**
 * Notify all owners when ownership changes (owner added)
 *
 * @param user New owner
 * @param form Form properties object
 * @param users Current owners
 */
export const notifyOwnersOwnerAdded = async (
  userToAdd: { name: string | null; email: string },
  form: FormProperties,
  users: { id: string; email: string }[]
) => {
  const emailContent = ownerAddedEmailTemplate(
    form.titleEn,
    form.titleFr,
    userToAdd.name || userToAdd.email
  );

  users.forEach((owner) => {
    sendEmail(
      owner.email,
      {
        subject: "Ownership change notification | Notification de changement de propriété",
        formResponse: emailContent,
      },
      "notifyAddedOwner"
    );
  });
};

/**
 * Notify owners of ownership changes (owner removed)
 *
 * @param userToRemove User to be removed
 * @param form Form properties object
 * @param users Current owners
 */
export const notifyOwnersOwnerRemoved = async (
  userToRemove: { name: string | null; email: string },
  form: FormProperties,
  users: { id: string; email: string }[]
) => {
  // Send email to person who was removed
  const youHaveBeenRemovedEmailContent = youHaveBeenRemovedEmailTemplate(
    form.titleEn,
    form.titleFr
  );

  sendEmail(
    userToRemove.email,
    {
      subject: "Form access removed | Accès au formulaire supprimé",
      formResponse: youHaveBeenRemovedEmailContent,
    },
    "notifyRemovedOwner"
  );

  // Send email to remaining owners
  users.forEach((owner) => {
    const ownerRemovedEmailContent = ownerRemovedEmailTemplate(
      form.titleEn,
      form.titleFr,
      userToRemove.name || "An owner"
    );

    sendEmail(
      owner.email,
      {
        subject: "Form access removed | Accès au formulaire supprimé",
        formResponse: ownerRemovedEmailContent,
      },
      "notifyOtherOwnersOfRemovedOwner"
    );
  });
};

/**
 * Add/remove (sync) users to a form
 *
 * @param ability
 * @param formID
 * @param users
 */
export async function updateAssignedUsersForTemplate(
  formID: string,
  users: { id: string }[]
): Promise<FormRecord | null> {
  if (!users.length) throw new Error("No users provided");
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToSetAssignedUsers
    );
    throw e;
  });

  const template = await prisma.template
    .findFirst({
      where: {
        id: formID,
      },
      include: {
        users: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (template === null) {
    logMessage.warn(
      `Can not update assigned users ${JSON.stringify(
        users
      )} on template ${formID}.  Template does not exist`
    );
    return null;
  }

  const previouslyAssigned =
    template?.users.map((user) => {
      return { id: user.id };
    }) || [];

  const toAdd = users.filter((n) => !previouslyAssigned.some((n2) => n.id == n2.id));
  const toRemove = previouslyAssigned.filter((n) => !users.some((n2) => n.id == n2.id));

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
      },
      data: {
        users: {
          connect: toAdd,
          disconnect: toRemove,
        },
      },
      include: {
        ...templateRecordInclude,
        users: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return updatedTemplate;

  await invalidateTemplateEditLockUserCountCache(formID);

  const getUsersFromUserIds = (userIds: string[]) => {
    return Promise.all(
      userIds.map((userId) => {
        return prisma.user.findUniqueOrThrow({
          where: {
            id: userId,
          },
        });
      })
    );
  };

  const usersToAdd = await getUsersFromUserIds(toAdd.map((u) => u.id));

  usersToAdd.forEach((user) => {
    notifyOwnersOwnerAdded(
      user,
      getNotificationFormProperties(updatedTemplate),
      updatedTemplate.users
    );
  });

  const usersToRemove = await getUsersFromUserIds(toRemove.map((u) => u.id));

  usersToRemove.forEach((user) => {
    notifyOwnersOwnerRemoved(
      user,
      getNotificationFormProperties(updatedTemplate),
      updatedTemplate.users
    );
  });

  usersToAdd.length > 0 &&
    logEvent(
      user.id,
      { type: "Form", id: formID },
      "GrantFormAccess",
      AuditLogDetails.AccessGrantedTo,
      { userList: usersToAdd.map((user) => user.email ?? user.id).toString() }
    );

  usersToRemove.length > 0 &&
    logEvent(
      user.id,
      { type: "Form", id: formID },
      "RevokeFormAccess",
      AuditLogDetails.AccessRevokedFor,
      { userList: usersToRemove.map((user) => user.email ?? user.id).toString() }
    );

  const version = getBuilderVersion(updatedTemplate);

  return _parseTemplate(updatedTemplate, {
    version,
    isPublished: version?.status === TEMPLATE_VERSION_STATUS.PUBLISHED,
  });
}

export async function updateFormPurpose(
  formID: string,
  formPurpose: string
): Promise<FormRecord | null> {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToSetFormPurpose
    );
    throw e;
  });

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
        isPublished: false,
      },
      data: {
        formPurpose: formPurpose,
      },
      include: templateRecordInclude,
    })
    .catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          throw new TemplateAlreadyPublishedError();
        }
      }
      return prismaErrors(e, null);
    });

  if (updatedTemplate === null) return updatedTemplate;

  logEvent(
    user.id,
    { type: "Form", id: formID },
    "ChangeFormPurpose",
    AuditLogDetails.SetFormPurpose,
    { formPurpose: formPurpose }
  );

  const version = getBuilderVersion(updatedTemplate);

  return _parseTemplate(updatedTemplate, {
    version,
    isPublished: version?.status === TEMPLATE_VERSION_STATUS.PUBLISHED,
  });
}

export async function updateFormSaveAndResume(
  formID: string,
  saveAndResume: boolean
): Promise<FormRecord | null> {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToSetSaveAndResume
    );
    throw e;
  });

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
      },
      data: {
        saveAndResume: saveAndResume ?? false,
      },
      include: templateRecordInclude,
    })
    .catch((e) => {
      return prismaErrors(e, null);
    });

  if (updatedTemplate === null) return updatedTemplate;

  logEvent(
    user.id,
    { type: "Form", id: formID },
    AuditLogEvent.ChangeFormSaveAndResume,
    AuditLogDetails.SetSaveAndResume,
    { saveAndResume: saveAndResume ? "On" : "Off" }
  );

  const version = getBuilderVersion(updatedTemplate);

  return _parseTemplate(updatedTemplate, {
    version,
    isPublished: version?.status === TEMPLATE_VERSION_STATUS.PUBLISHED,
  });
}

/**
 * Remove DeliveryOption from template. Form responses will be sent to the Vault.
 * @param formID The unique identifier of the form you want to modify
 * @returns void
 */
export async function removeDeliveryOption(formID: string): Promise<void> {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToSetDeliveryToVault
    );
    throw e;
  });

  // Don't change delivery option if the form is published
  const template = await prisma.template.findFirstOrThrow({
    where: {
      id: formID,
    },
    select: {
      isPublished: true,
    },
  });

  if (!template) throw new TemplateNotFoundError();

  if (template.isPublished) throw new TemplateAlreadyPublishedError();

  await prisma.deliveryOption.deleteMany({
    where: {
      templateId: formID,
    },
  });

  logEvent(
    user.id,
    { type: "Form", id: formID },
    "ChangeDeliveryOption",
    AuditLogDetails.SetDeliveryToVault
  );
}

/**
 * Clone a template including associated users and delivery option
 */
export async function cloneTemplate(
  formID: string,
  allowDeleted: boolean,
  locale: string = "en"
): Promise<FormRecord | null> {
  // Ensure the user can create a new form (needed to persist a clone)
  // and that they can edit the source form.
  const [createResult, editResult] = (await Promise.allSettled([
    authorization.canCreateForm(),
    authorization.canEditForm(formID, allowDeleted),
  ])) as Array<PromiseSettledResult<{ user: { id: string } }>>;

  if (createResult.status === "rejected") {
    const e = createResult.reason as { user?: { id?: string } };
    logEvent(
      e?.user?.id ?? "unknown",
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToCloneFormNoCreate
    );
    throw createResult.reason;
  }

  if (editResult.status === "rejected") {
    const e = editResult.reason as { user?: { id?: string } };
    logEvent(
      e?.user?.id ?? "unknown",
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToCloneFormNoEdit
    );
    throw editResult.reason;
  }

  // Extract the user from the fulfilled createResult
  const { user } = (createResult as PromiseFulfilledResult<{ user: { id: string } }>).value;

  const template = await prisma.template
    .findUnique({
      where: { id: formID, ttl: allowDeleted ? { not: null } : null },
      include: {
        currentDraftVersion: {
          select: templateVersionSelect,
        },
        currentPublishedVersion: {
          select: templateVersionSelect,
        },
        deliveryOption: true,
        users: { select: { id: true } },
        notificationsUsers: { select: { id: true } },
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!template) {
    logMessage.warn(`[templates][cloneTemplate] Template ${formID} not found`);
    return null;
  }

  const name = locale === "fr" ? `Copie de ${template.name}` : `Copy of ${template.name}`;
  const sourceVersion = getBuilderVersion(template);

  if (!sourceVersion) {
    logMessage.warn(`[templates][cloneTemplate] Template ${formID} has no version to clone`);
    return null;
  }

  // Build the create payload copying allowed fields. Do NOT copy apiServiceAccount or bearerToken.
  const createData: Prisma.TemplateCreateInput = {
    name,
    isPublished: false,
    formPurpose: template.formPurpose,
    publishReason: template.publishReason,
    publishFormType: template.publishFormType,
    publishDesc: template.publishDesc,
    securityAttribute: template.securityAttribute,
    saveAndResume: template.saveAndResume,
    ...(template.notificationsInterval !== undefined && {
      notificationsInterval: template.notificationsInterval,
    }),
    // connect only the current user (owners are not copied when cloning as the form will be a draft form)
    users: {
      connect: [{ id: user.id }],
    },
    // connect current user as a notificationsUser only if they were in the original notificationsUsers list
    ...(template.notificationsUsers &&
      template.notificationsUsers.some((u) => u.id === user.id) && {
        notificationsUsers: {
          connect: [{ id: user.id }],
        },
      }),
    // NOTE: Do NOT copy deliveryOption when cloning - just default to the vault.
  };

  const createdTemplate = await prisma
    .$transaction(async (tx) => {
      const clonedTemplate = await tx.template.create({
        data: createData,
        select: {
          id: true,
        },
      });

      const draftVersion = await tx.templateVersion.create({
        data: {
          templateId: clonedTemplate.id,
          versionNumber: 1,
          status: TEMPLATE_VERSION_STATUS.DRAFT,
          jsonConfig: sourceVersion.jsonConfig as Prisma.JsonObject,
          createdByUserId: user.id,
        },
        select: {
          id: true,
        },
      });

      return tx.template.update({
        where: {
          id: clonedTemplate.id,
        },
        data: {
          currentDraftVersionId: draftVersion.id,
        },
        include: templateRecordInclude,
      });
    })
    .catch((e) => prismaErrors(e, null));

  if (createdTemplate === null) return null;

  logEvent(user.id, { type: "Form", id: formID }, "CreateForm", AuditLogDetails.ClonedForm, {
    newFormID: createdTemplate.id,
  });

  return _parseTemplate(createdTemplate, {
    version: createdTemplate.currentDraftVersion,
    isPublished: false,
  });
}

/**
 * Deletes a form template. The template will stay in the database for 30 days in an archived state until a lambda function deletes it from the database.
 * @param formID ID of the form template
 * @returns A boolean status if operation is sucessful
 */
export async function deleteTemplate(formID: string): Promise<FormRecord | null> {
  const { user } = await authorization.canDeleteForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToDeleteForm
    );
    throw e;
  });

  // Check if the form is draft or not.
  const template = await prisma.template.findFirstOrThrow({
    where: {
      id: formID,
    },
    select: {
      isPublished: true,
    },
  });

  if (!template) throw new TemplateNotFoundError();

  // Only check submissions if the form is published.
  if (template.isPublished) {
    // Ignore cache (last boolean parameter) because we want to make sure we did not get new submissions while in the flow of deleting a form
    const numOfUnprocessedSubmissions = await unprocessedSubmissions(formID, true);
    if (numOfUnprocessedSubmissions) throw new TemplateHasUnprocessedSubmissions();
  }

  // Check and delete any API keys from IDP
  await deleteKey(formID);

  const dateIn30Days = new Date(Date.now() + 2592000000); // 30 days = 60 (seconds) * 60 (minutes) * 24 (hours) * 30 (days) * 1000 (to ms)
  const templateMarkedAsDeleted = await prisma.template
    .update({
      where: {
        id: formID,
      },
      data: {
        ttl: dateIn30Days,
      },
      include: templateRecordInclude,
    })
    .catch((e) => prismaErrors(e, null));

  // There was an error with Prisma, do not delete from Cache.
  if (templateMarkedAsDeleted === null) return templateMarkedAsDeleted;

  logEvent(user.id, { type: "Form", id: formID }, AuditLogEvent.DeleteForm);

  if (formCache.cacheAvailable) formCache.invalidate(formID);

  const deletedVersion = getBuilderVersion(templateMarkedAsDeleted);

  return _parseTemplate(templateMarkedAsDeleted, {
    version: deletedVersion,
    isPublished: deletedVersion?.status === TEMPLATE_VERSION_STATUS.PUBLISHED,
  });
}

/**
 * Restores a form template from the archived state.
 * @param formID ID of the form template
 * @returns A boolean status if operation is sucessful
 */
export async function restoreTemplate(formID: string): Promise<FormRecord | null> {
  const { user } = await authorization.canRestoreForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToUnarchiveForm
    );
    throw e;
  });

  // Check if the form is archived.
  const template = await prisma.template.findFirstOrThrow({
    where: {
      id: formID,
      ttl: { not: null },
    },
    include: templateRecordInclude,
  });

  if (!template) throw new TemplateNotFoundError();

  const templateMarkedToUnarchive = await prisma.template
    .update({
      where: {
        id: formID,
        ttl: { not: null },
      },
      data: {
        ttl: null,
      },
      include: templateRecordInclude,
    })
    .catch((e) => prismaErrors(e, null));

  // There was an error with Prisma, do not delete from Cache.
  if (templateMarkedToUnarchive === null) return templateMarkedToUnarchive;

  logEvent(user.id, { type: "Form", id: formID }, AuditLogEvent.UnarchiveForm);

  if (formCache.cacheAvailable) formCache.invalidate(formID);

  const restoredVersion = getBuilderVersion(templateMarkedToUnarchive);

  return _parseTemplate(templateMarkedToUnarchive, {
    version: restoredVersion,
    isPublished: restoredVersion?.status === TEMPLATE_VERSION_STATUS.PUBLISHED,
  });
}

// Remove and replace this utility with new authorization object in code
export const checkUserHasTemplateOwnership = async (formID: string) => {
  await authorization.canEditForm(formID);
};

/*
 * Extract only the public properties from a form record.
 * The public properties are the ones that are needed to display the form
 * to unauthenticated users. (e.g. when filling out a form)
 * Also sets some of the default values for properties that are not set.
 * @param template A Form Record, containing all the properties
 * @returns a Public Form Record, with only the public properties
 */
export const onlyIncludePublicProperties = (template: FormRecord): PublicFormRecord => {
  return {
    id: template.id,
    updatedAt: template.updatedAt,
    closingDate: template.closingDate,
    closedDetails: template.closedDetails,
    form: template.form,
    isPublished: template.isPublished,
    templateVersionId: template.templateVersionId,
    templateVersionNumber: template.templateVersionNumber,
    securityAttribute: template.securityAttribute,
    saveAndResume: template.saveAndResume,
  };
};

export const updateClosedData = async (
  formID: string,
  closingDate: string | null,
  details?: ClosedDetails
) => {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateClosingDate
    );
    throw e;
  });

  let detailsData: ClosedDetails | null = null;

  if (closingDate !== null && !isValidISODate(String(closingDate))) {
    throw new Error(`Invalid ISO date ${closingDate}`);
  }

  // Add the closed details if they exist
  if (details) {
    detailsData = {};
    detailsData.messageEn = details?.messageEn || "";
    detailsData.messageFr = details?.messageFr || "";
  }

  await prisma.template
    .update({
      where: {
        id: formID,
      },
      data: {
        closingDate,
        closedDetails: detailsData !== null ? (detailsData as Prisma.JsonObject) : Prisma.JsonNull,
      },
      select: {
        id: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (formCache.cacheAvailable) formCache.invalidate(formID);

  if (closingDate) {
    const date = new Date(closingDate);

    logEvent(
      user.id,
      { type: "Form", id: formID },
      "UpdateForm",
      AuditLogDetails.UpdateClosingDate,
      {
        closingDate: date.toISOString(),
      }
    );
  } else {
    logEvent(
      user.id,
      { type: "Form", id: formID },
      "UpdateForm",
      AuditLogDetails.RemoveClosingDate
    );
  }

  return { formID, closingDate };
};

export const updateSecurityAttribute = async (formID: string, securityAttribute: string) => {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateSecurityAttribute
    );
    throw e;
  });

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
        isPublished: false,
      },
      data: { securityAttribute },
      include: templateRecordInclude,
    })
    .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return updatedTemplate;

  if (formCache.cacheAvailable) formCache.invalidate(formID);

  logEvent(
    user.id,
    { type: "Form", id: formID },
    AuditLogEvent.ChangeSecurityAttribute,
    AuditLogDetails.ChangeSecurityAttribute,
    { securityAttribute: securityAttribute ?? "" }
  );

  const version = getBuilderVersion(updatedTemplate);

  return _parseTemplate(updatedTemplate, {
    version,
    isPublished: version?.status === TEMPLATE_VERSION_STATUS.PUBLISHED,
  });
};

export const checkIfClosed = async (formId: string) => {
  try {
    let isPastClosingDate = false;
    let template = null;

    // The form cache stores the public template information
    if (formCache.cacheAvailable) {
      // This value will always be the latest if it exists because
      // the cache is invalidated on change of a template
      const cachedValue = await formCache.check(formId);
      if (cachedValue) {
        template = cachedValue;
      }
    }

    // If the template is not in the cache, we need to fetch it from the database
    if (!template) {
      template = await prisma.template
        .findUnique({
          where: {
            id: formId,
          },
          select: {
            closingDate: true,
            closedDetails: true,
          },
        })
        .catch((e) => prismaErrors(e, null));
    }
    // If it's not in the cache and in the DB then it doesn't exist
    if (!template) {
      throw new Error("Template not found");
    }

    if (template.closingDate) {
      isPastClosingDate = dateHasPast(Date.parse(String(template.closingDate)));
    }

    return {
      isPastClosingDate,
      closedDetails: template.closedDetails as ClosedDetails,
    };
  } catch (e) {
    return null;
  }
};

export const getFormJSONConfig = async (formId: string) => {
  await authorization.canEditForm(formId).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formId },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToGetFormJson
    );
    throw e;
  });

  const result = await prisma.template
    .findUnique({
      where: { id: formId },
      include: templateRecordInclude,
    })
    .catch((e) => prismaErrors(e, null));

  if (!result) {
    throw new Error(`Template not found when getting jsonConfig with formId ${formId}`);
  }

  const version = getBuilderVersion(result);

  if (!version) {
    throw new Error(`Template version not found when getting jsonConfig with formId ${formId}`);
  }

  return parseJsonConfig(version.jsonConfig);
};

/**
 * WARNING:
 * Avoid using this function for any update that would modify the structure of the form
 * e.g. groups, layouts, elements, etc.
 * Doing so would cause an error in the infra pipeline when processing submissions.
 */
export const updateFormJsonConfig = async (formId: string, jsonConfig: FormProperties) => {
  const { user } = await authorization.canEditForm(formId).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formId },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateFormJson
    );
    throw e;
  });

  const validationResult = validateTemplate(jsonConfig);

  if (!validationResult.valid) {
    logMessage.warn(
      `[templates][updateTemplate] Form config is invalid.\nReasons: ${JSON.stringify(
        validationResult.errors
      )}.\nConfig: ${JSON.stringify(jsonConfig)}`
    );
    throw new InvalidFormConfigError();
  }

  const isValid = validateTemplateSize(JSON.stringify(jsonConfig));

  if (!isValid) {
    logMessage.warn(
      `[templates][updateTemplate] Template size exceeds the limit.\nConfig: ${JSON.stringify(
        jsonConfig
      )}`
    );
    throw new InvalidFormConfigError();
  }

  const currentTemplate = await prisma.template.findUnique({
    where: {
      id: formId,
    },
    select: {
      currentDraftVersionId: true,
    },
  });

  if (!currentTemplate?.currentDraftVersionId) {
    throw new TemplateAlreadyPublishedError(
      "Create a new draft version before updating form jsonConfig."
    );
  }
  const currentDraftVersionId = currentTemplate.currentDraftVersionId;

  const updatedTemplate = await prisma
    .$transaction(async (tx) => {
      await tx.templateVersion.update({
        where: {
          id: currentDraftVersionId,
        },
        data: {
          jsonConfig: jsonConfig as Prisma.JsonObject,
        },
      });

      return tx.template.findUnique({
        where: {
          id: formId,
        },
        include: templateRecordInclude,
      });
    })
    .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return updatedTemplate;

  if (formCache.cacheAvailable) formCache.invalidate(formId);

  logEvent(user.id, { type: "Form", id: formId }, "UpdateFormJsonConfig");

  return _parseTemplate(updatedTemplate, {
    version: updatedTemplate.currentDraftVersion,
    isPublished: false,
  });
};
