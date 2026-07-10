import { Prisma } from "@gcforms/database";

export const TEMPLATE_VERSION_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  SUPERSEDED: "SUPERSEDED",
} as const;

type TemplateVersionStatus = (typeof TEMPLATE_VERSION_STATUS)[keyof typeof TEMPLATE_VERSION_STATUS];

export type TemplateVersionSnapshot = {
  id: string;
  versionNumber: number;
  currentDraftVersion?: number | null;
  currentPublishedVersion?: number | null;
  status: TemplateVersionStatus;
  jsonConfig: Prisma.JsonValue;
};

export type TemplateVersionConfigSnapshot = {
  jsonConfig: Prisma.JsonValue;
};

export type TemplateRecordForParsing = {
  id: string;
  created_at?: Date;
  updated_at?: Date;
  name: string;
  jsonConfig: Prisma.JsonValue;
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
