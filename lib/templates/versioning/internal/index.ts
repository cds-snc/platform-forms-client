import { FeatureFlags } from "@lib/cache/types";
import { Prisma } from "@gcforms/database";
import {
  TemplateRecordForParsing,
  TemplateVersionConfigSnapshot,
  TemplateVersionSnapshot,
} from "./types";
import {
  ClosedDetails,
  FormProperties,
  FormRecord,
  NotificationsInterval,
  PublicFormRecord,
  SecurityAttribute,
} from "@gcforms/types";

import { authCheckAndThrow } from "@lib/actions/auth";
import { featureFlagAllowedForUser } from "@lib/userFeatureFlags";

export const isTemplateVersioningEnabled = async () => {
  const { session } = await authCheckAndThrow().catch(() => ({ session: null }));

  if (!session?.user) {
    return false;
  }

  const hasAccess = await featureFlagAllowedForUser(
    session.user.id,
    FeatureFlags.templateVersioning
  );

  return hasAccess;
};

export const templateVersionSelect = {
  id: true,
  versionNumber: true,
  status: true,
  jsonConfig: true,
} satisfies Prisma.TemplateVersionSelect;

export const templateRecordInclude = {
  deliveryOption: true,
  currentDraftVersion: {
    select: templateVersionSelect,
  },
  currentPublishedVersion: {
    select: templateVersionSelect,
  },
} satisfies Prisma.TemplateInclude;

export const getTemplateJsonConfigMirrorData = (jsonConfig: Prisma.JsonObject) => {
  return { jsonConfig };
};

// ******************************************
// Internal Module Functions
// ******************************************
export const parseTemplate = (
  template: TemplateRecordForParsing,
  options?: {
    version?: TemplateVersionSnapshot | null;
    isPublished?: boolean;
  }
): FormRecord => {
  const version = options?.version ?? getBuilderVersion(template);

  return {
    id: template.id,
    ...(template.created_at && {
      createdAt: template.created_at?.toString(),
    }),
    ...(template.updated_at && {
      updatedAt: template.updated_at.toString(),
    }),
    name: template.name,
    form: version ? parseJsonConfig(version.jsonConfig) : getResolvedTemplateFormConfig(template),
    isPublished: options?.isPublished ?? template.isPublished,
    currentPublishedVersionId: template.currentPublishedVersionId ?? null,
    currentDraftVersionId: template.currentDraftVersionId ?? null,
    versionNumber: version?.versionNumber ?? null,
    currentPublishedVersion: template.currentPublishedVersion?.versionNumber ?? null,
    currentDraftVersion: template.currentDraftVersion?.versionNumber ?? null,
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

/*
 * Extract only the public properties from a form record.
 * The public properties are the ones that are needed to display the form
 * to unauthenticated users. (e.g. when filling out a form)
 * Also sets some of the default values for properties that are not set.
 * @param template A Form Record, containing all the properties
 * @returns a Public Form Record, with only the public properties
 */
export const mapTemplateToPublicFormRecord = (template: FormRecord): PublicFormRecord => {
  return {
    id: template.id,
    updatedAt: template.updatedAt,
    versionNumber: template.versionNumber,
    closingDate: template.closingDate,
    closedDetails: template.closedDetails,
    form: template.form,
    isPublished: template.isPublished,
    securityAttribute: template.securityAttribute,
    saveAndResume: template.saveAndResume,
  };
};

export const getBuilderVersion = (
  template: Pick<TemplateRecordForParsing, "currentDraftVersion" | "currentPublishedVersion">
) => {
  return template.currentDraftVersion ?? template.currentPublishedVersion ?? null;
};

const parseJsonConfig = (raw: Prisma.JsonValue): FormProperties => {
  if (typeof raw === "string") {
    return JSON.parse(raw) as FormProperties;
  }

  return raw as FormProperties;
};

const getResolvedTemplateFormConfig = (
  template: {
    jsonConfig: Prisma.JsonValue;
    currentDraftVersion?: TemplateVersionConfigSnapshot | null;
    currentPublishedVersion?: TemplateVersionConfigSnapshot | null;
  },
  options?: {
    preferPublished?: boolean;
    allowTemplateFallback?: boolean;
  }
) => {
  return parseJsonConfig(getResolvedTemplateRawConfig(template, options));
};

const getResolvedTemplateRawConfig = (
  template: {
    jsonConfig: Prisma.JsonValue;
    currentDraftVersion?: TemplateVersionConfigSnapshot | null;
    currentPublishedVersion?: TemplateVersionConfigSnapshot | null;
  },
  options?: {
    preferPublished?: boolean;
    allowTemplateFallback?: boolean;
  }
) => {
  const version = options?.preferPublished
    ? (template.currentPublishedVersion ?? template.currentDraftVersion ?? null)
    : (template.currentDraftVersion ?? template.currentPublishedVersion ?? null);

  if (version) {
    return version.jsonConfig;
  }

  return template.jsonConfig;
};
