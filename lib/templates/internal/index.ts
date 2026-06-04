import { Prisma } from "@gcforms/database";
import { authorization } from "../../privileges";
import { checkOne } from "@lib/cache/flags";
import { FormRecord, FormProperties, SecurityAttribute, ClosedDetails } from "@lib/types";
import { NotificationsInterval } from "@gcforms/types";

export const checkFlag = async (flag: string) => {
  return (await Promise.all([checkOne(flag), authorization.canAccessBetaComponents(flag)])).reduce(
    (prev, curr) => prev || curr
  );
};

// ******************************************
// Internal Module Functions
// ******************************************
export const parseTemplate = (template: {
  id: string;
  created_at?: Date;
  updated_at?: Date;
  name: string;
  jsonConfig: Prisma.JsonValue;
  isPublished: boolean;
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
}): FormRecord => {
  return {
    id: template.id,
    ...(template.created_at && {
      createdAt: template.created_at?.toString(),
    }),
    ...(template.updated_at && {
      updatedAt: template.updated_at.toString(),
    }),
    name: template.name,
    form: template.jsonConfig as FormProperties,
    isPublished: template.isPublished,
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
