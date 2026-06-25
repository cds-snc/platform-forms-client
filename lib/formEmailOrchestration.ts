import { logMessage } from "@lib/logger";
import { getRedisInstance } from "@lib/integration/redisConnector";
import { getOrigin } from "@lib/origin";
import { NotificationsInterval } from "@gcforms/types";
import { serverTranslation } from "@i18n";
import { prisma, prismaErrors } from "@gcforms/database";
import { sendEmail } from "@lib/integration/notifyConnector";

// Hard coded since only one interval is supported currently
const NOTIFICATIONS_INTERVAL = NotificationsInterval.DAY;

const Status = {
  SINGLE_EMAIL_SENT: "SINGLE_EMAIL_SENT",
  MULTIPLE_EMAIL_SENT: "MULTIPLE_EMAIL_SENT",
} as const;
type Status = (typeof Status)[keyof typeof Status];

export type NotificationEmailType = "FIRST_EMAIL" | "SECOND_EMAIL";

// Determines whether to send email submission udpates.
// Note: this does not includ notifications feature check. This is checking if form
// meets the criteria to be sent emails (either by notifications or directly via GC Notify)
export const isFormEligibleForEmails = async (formId: string): Promise<boolean> => {
  // Avoid legacy forms that receive delivery by email
  const deliveryOption = await _getDeliveryOption(formId);
  if (deliveryOption) {
    return false;
  }

  const users = await getNotificationsUsersForForm(formId);

  // Avoid some older forms may not have users
  if (!Array.isArray(users) || users.length === 0) {
    return false;
  }

  // Avoid forms that have no users have notifications enabled
  const atLeastOneUserEnabled = users.some((user) => user.enabled);
  if (!atLeastOneUserEnabled) {
    return false;
  }

  return true;
};

export const updateNotificationMarker = async (
  formId: string
): Promise<NotificationEmailType | null> => {
  const marker = await getMarker(formId);
  switch (marker ?? "") {
    case Status.SINGLE_EMAIL_SENT:
      // First email already sent — advance marker and signal second email
      await setMarker(formId, Status.MULTIPLE_EMAIL_SENT);
      return "SECOND_EMAIL";
    case Status.MULTIPLE_EMAIL_SENT:
      // Both emails already sent for this interval, do nothing
      return null;
    default:
      // No email sent yet — advance marker and signal first email
      await setMarker(formId);
      return "FIRST_EMAIL";
  }
};

/**
 * Prepares the email data for a form submission notification.
 * Returns the recipient emails and personalisation content, or null if nothing should be sent.
 *
 * Note: should be awaited before fire-and-forget sendEmail so that any prep
 * failure does not surface inside processFormData.
 */
export const prepareFormSubmissionEmail = async (
  formId: string,
  formTitleEn: string,
  formTitleFr: string,
  emailType: NotificationEmailType
): Promise<{ emails: string[]; subject: string; formResponse: string } | null> => {
  try {
    const users = await getNotificationsUsersForForm(formId);
    if (!Array.isArray(users) || users.length === 0) return null;

    const emails = users.filter(({ enabled }) => enabled).map(({ email }) => email);
    if (emails.length === 0) return null;

    const multipleSubmissions = emailType === "SECOND_EMAIL";
    const { t } = await serverTranslation("form-builder");
    const HOST = await getOrigin();

    return {
      emails,
      subject: multipleSubmissions
        ? t("settings.notifications.email.multipleSubmissions.subject")
        : t("settings.notifications.email.singleSubmission.subject"),
      formResponse: multipleSubmissions
        ? await multipleSubmissionsEmailTemplate(HOST, formTitleEn, formTitleFr)
        : await singleSubmissionEmailTemplate(HOST, formTitleEn, formTitleFr),
    };
  } catch (error) {
    logMessage.warn(
      `prepareFormSubmissionEmail failed for form ${formId}: ${(error as Error).message}`
    );
    return null;
  }
};

/**
 * Returns whether the given user has notifications enabled for the given form
 *
 * @param formId
 * @param userId
 * @returns
 */
export const getUserNotificationSettingsForForm = async (formId: string, userId: string) => {
  const template = await prisma.template
    .findFirst({
      where: {
        id: formId,
      },
      select: {
        notificationsUsers: {
          where: {
            id: userId,
          },
          select: {
            id: true,
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  return !!template?.notificationsUsers.length;
};

/**
 * Returns a list of users associated with the form and their notification settings
 *
 * @param formId
 * @returns
 */
export const getNotificationsUsersForForm = async (formId: string) => {
  const template = await prisma.template
    .findUnique({
      where: {
        id: formId,
      },
      select: {
        users: {
          select: {
            id: true,
            email: true,
            notificationsTemplates: {
              where: {
                id: formId,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!template) {
    logMessage.debug(`_getNotificationsUsers no users found for formId ${formId}`);
    return null;
  }

  return template.users.map((user) => ({
    id: user.id,
    email: user.email,
    enabled: user.notificationsTemplates.length > 0,
  }));
};

const _getDeliveryOption = async (formId: string) => {
  const template = await prisma.template
    .findUnique({
      where: {
        id: formId,
      },
      select: {
        deliveryOption: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!template) {
    logMessage.debug(`_getDeliveryOption template not found with id ${formId}`);
    return null;
  }

  return template.deliveryOption;
};

const setMarker = async (formId: string, status: Status = Status.SINGLE_EMAIL_SENT) => {
  const ttl = NOTIFICATIONS_INTERVAL * 60; // convert from minutes to seconds
  const redis = await getRedisInstance();
  await redis
    .set(`notification:formId:${formId}`, status, "EX", ttl)
    .then(() =>
      logMessage.debug(
        `setMarker: notification:formId:${formId} set with ttl ${ttl} and marked ${status}`
      )
    )
    .catch((err) =>
      logMessage.error(`setMarker: notification:formId:${formId} failed to set ${err}`)
    );
};

const getMarker = async (formId: string) => {
  const redis = await getRedisInstance();
  return redis
    .get(`notification:formId:${formId}`)
    .catch((err) => logMessage.error(`getMarker: ${err}`));
};

const singleSubmissionEmailTemplate = async (
  HOST: string,
  formTitleEn: string,
  formTitleFr: string
) => {
  const { t: t_en } = await serverTranslation("form-builder", { lang: "en" });
  const { t: t_fr } = await serverTranslation("form-builder", { lang: "fr" });
  return `
${t_en("settings.notifications.email.singleSubmission.paragraph1")}
${formTitleEn}

**[${t_en("settings.notifications.email.singleSubmission.paragraph2")}](${HOST}/auth/login)**

*${t_en("settings.notifications.email.singleSubmission.paragraph3")}*

---

${t_fr("settings.notifications.email.singleSubmission.paragraph1")}
${formTitleFr}

**[${t_fr("settings.notifications.email.singleSubmission.paragraph2")}](${HOST}/auth/login)**

*${t_fr("settings.notifications.email.singleSubmission.paragraph3")}*
    `;
};

const multipleSubmissionsEmailTemplate = async (
  HOST: string,
  formTitleEn: string,
  formTitleFr: string
) => {
  const { t: t_en } = await serverTranslation("form-builder", { lang: "en" });
  const { t: t_fr } = await serverTranslation("form-builder", { lang: "fr" });
  return `
  ${t_en("settings.notifications.email.multipleSubmissions.paragraph1")}
  ${formTitleEn}
  
  **[${t_en("settings.notifications.email.multipleSubmissions.paragraph2")}](${HOST}/auth/login)**
  
  *${t_en("settings.notifications.email.multipleSubmissions.paragraph3")}*
  
  ---
  
  ${t_fr("settings.notifications.email.multipleSubmissions.paragraph1")}
  ${formTitleFr}
  
  **[${t_fr("settings.notifications.email.multipleSubmissions.paragraph2")}](${HOST}/auth/login)**
  
  *${t_fr("settings.notifications.email.multipleSubmissions.paragraph3")}*
    `;
};

const archivedFormEmailTemplate = async (
  HOST: string,
  formTitleEn: string,
  formTitleFr: string,
  actionEmail: string
) => {
  const { t: t_en } = await serverTranslation("form-builder", { lang: "en" });
  const { t: t_fr } = await serverTranslation("form-builder", { lang: "fr" });
  return `
  ${t_en("settings.notifications.email.archivedForm.paragraph1")}
  ${formTitleEn}
  ${t_en("settings.notifications.email.archivedForm.paragraph2")}
  ${actionEmail}
  
  **[${t_en("settings.notifications.email.archivedForm.paragraph3")}](${HOST}/auth/login)**
  
  *${t_en("settings.notifications.email.archivedForm.paragraph4")}*
  
  ---
  
  ${t_fr("settings.notifications.email.archivedForm.paragraph1")}
  ${formTitleFr}
  ${t_fr("settings.notifications.email.archivedForm.paragraph2")}
  ${actionEmail}
  
  **[${t_fr("settings.notifications.email.archivedForm.paragraph3")}](${HOST}/auth/login)**
  
  *${t_fr("settings.notifications.email.archivedForm.paragraph4")}*
    `;
};

interface Session {
  user: {
    email: string;
  };
}

// Public facing function to send notifications to all related users on a form archival
export const sendArchivedFormNotifications = async (
  session: Session,
  formId: string,
  titleEn: string,
  titleFr: string,
  templateUsers: { email: string }[]
): Promise<void> => {
  // Some older forms may not have users, do nothing
  if (!Array.isArray(templateUsers) || templateUsers.length === 0) {
    return;
  }

  try {
    const { t } = await serverTranslation("form-builder");
    const HOST = await getOrigin();
    const subject = t("settings.notifications.email.archivedForm.subject");
    const body = await archivedFormEmailTemplate(HOST, titleEn, titleFr, session.user.email);

    templateUsers.forEach((user) => {
      sendEmail(user.email, { subject, formResponse: body }, "sendArchivedFormNotifications");
    });
  } catch (error) {
    logMessage.warn(
      `sendArchivedFormNotifications failed for archived form ${formId} with error: ${(error as Error).message}`
    );
  }
};
