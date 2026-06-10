import { checkOne } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";
import { Prisma, prisma, prismaErrors } from "@gcforms/database";
import {
  TemplateRecordForParsing,
  TemplateVersionConfigSnapshot,
  TemplateVersionSnapshot,
} from "../internal/types";
import {
  ClosedDetails,
  FormProperties,
  FormRecord,
  NotificationsInterval,
  SecurityAttribute,
} from "@gcforms/types";

export const isTemplateVersioningEnabled = async () => {
  return checkOne(FeatureFlags.templateVersioning);
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
    isPublished: template.isPublished,
    currentPublishedVersionId: template.currentPublishedVersionId ?? null,
    currentDraftVersionId: template.currentDraftVersionId ?? null,
    versionNumber: version?.versionNumber ?? null,
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

export async function getTemplateVersionState(formID: string): Promise<{
  isPublished: boolean;
  hasDraftVersion: boolean;
  currentPublishedVersionId?: string | null;
  currentDraftVersionId?: string | null;
} | null> {
  const templateVersioningEnabled = await isTemplateVersioningEnabled();

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
    hasDraftVersion: template.isPublished
      ? templateVersioningEnabled && Boolean(template.currentDraftVersionId)
      : Boolean(template.currentDraftVersionId),
    currentPublishedVersionId:
      template.isPublished && !templateVersioningEnabled
        ? null
        : template.currentPublishedVersionId,
    currentDraftVersionId:
      template.isPublished && !templateVersioningEnabled ? null : template.currentDraftVersionId,
  };
}
