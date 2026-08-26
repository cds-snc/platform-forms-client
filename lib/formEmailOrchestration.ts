import { logMessage } from "@lib/logger";
import { getRedisInstance } from "@lib/integration/redisConnector";
import { getOrigin } from "@lib/origin";
import { serverTranslation } from "@i18n";
import { prisma, prismaErrors } from "@gcforms/database";
import { sendDefaultEmail } from "@lib/integration/notifyConnector";

const Status = {
  SINGLE_EMAIL_SENT: "SINGLE_EMAIL_SENT",
  MULTIPLE_EMAIL_SENT: "MULTIPLE_EMAIL_SENT",
} as const;
type Status = (typeof Status)[keyof typeof Status];

export type NotificationEmailType = "FIRST_EMAIL" | "SECOND_EMAIL";

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

/**
 * Determines whether to send email submission updates based on template state.
 *
 * Returns the form's configured notification interval in minutes if eligible, false otherwise.
 * A return of false means notifications are either disabled or the form is not set up for them.
 */
export const getFormNotificationInterval = async (formId: string): Promise<number | false> => {
  const template = await prisma.template
    .findUnique({
      where: { id: formId },
      select: {
        deliveryOption: true,
        notificationsInterval: true,
        users: {
          select: {
            id: true,
            notificationsTemplates: {
              where: { id: formId },
              select: { id: true },
            },
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  // Avoid legacy forms that receive delivery by email
  if (!template || template.deliveryOption) return false;

  // Respect the per-form interval setting — null means notifications are turned off
  if (!template.notificationsInterval) return false;

  // Avoid some older forms that may not have users
  if (!template.users.length) return false;

  // Avoid forms where no user has notifications enabled
  if (!template.users.some((user) => user.notificationsTemplates.length > 0)) return false;

  return template.notificationsInterval;
};

export const updateNotificationMarker = async (
  formId: string,
  interval: number
): Promise<NotificationEmailType | null> => {
  const key = `notification:formId:${formId}`;
  const ttl = interval * 60; // convert from minutes to seconds
  const redis = await getRedisInstance();

  // The SET NX bit is atomic and helps prevent a race condition where two simultaneous submissions
  // could both trigger a first email
  const wasSet = await redis.set(key, Status.SINGLE_EMAIL_SENT, "EX", ttl, "NX");
  if (wasSet === "OK") {
    logMessage.debug(`updateNotificationMarker: formId ${formId} transitioned to FIRST_EMAIL`);
    return "FIRST_EMAIL";
  }

  const current = await redis.get(key);
  if (current === Status.SINGLE_EMAIL_SENT) {
    await redis.set(key, Status.MULTIPLE_EMAIL_SENT, "EX", ttl);
    logMessage.debug(`updateNotificationMarker: formId ${formId} transitioned to SECOND_EMAIL`);
    return "SECOND_EMAIL";
  }

  if (current === Status.MULTIPLE_EMAIL_SENT) {
    logMessage.debug(`updateNotificationMarker: formId ${formId} — interval limit reached`);
    return null;
  }

  // Unexpected or stale value (e.g. empty string from a bad previous write) - reset to a likely state
  logMessage.warn(
    `updateNotificationMarker: unexpected marker value "${current}" for formId ${formId}, resetting`
  );
  await redis.set(key, Status.SINGLE_EMAIL_SENT, "EX", ttl);
  return "FIRST_EMAIL";
};

/**
 * Prepares the email data for a form submission notification.
 * Returns the recipient emails and personalisation content, or null if nothing should be sent.
 */
export const prepareFormSubmissionEmail = async (
  formId: string,
  formTitleEn: string,
  formTitleFr: string,
  emailType: NotificationEmailType
): Promise<{ emails: string[]; subject: string; formResponse: string } | null> => {
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
};

// Public facing function to send notifications to all related users on a form archival
export const sendArchivedFormNotifications = async (
  emailOfUserInitiatingAction: string,
  formInformation: { title: { en: string; fr: string }; ownersEmailAddresses: string[] }
): Promise<void> => {
  // Some older forms may not have users, do nothing
  if (formInformation.ownersEmailAddresses.length === 0) {
    return;
  }

  const { t } = await serverTranslation("form-builder");
  const { t: t_en } = await serverTranslation("form-builder", { lang: "en" });
  const { t: t_fr } = await serverTranslation("form-builder", { lang: "fr" });

  const HOST = await getOrigin();
  const subject = t("settings.notifications.email.archivedForm.subject");
  const body = `
${t_en("settings.notifications.email.archivedForm.paragraph1")}
${formInformation.title.en}
${t_en("settings.notifications.email.archivedForm.paragraph2")}
${emailOfUserInitiatingAction}

**[${t_en("settings.notifications.email.archivedForm.paragraph3")}](${HOST}/auth/login)**

*${t_en("settings.notifications.email.archivedForm.paragraph4")}*

---

${t_fr("settings.notifications.email.archivedForm.paragraph1")}
${formInformation.title.fr}
${t_fr("settings.notifications.email.archivedForm.paragraph2")}
${emailOfUserInitiatingAction}

**[${t_fr("settings.notifications.email.archivedForm.paragraph3")}](${HOST}/auth/login)**

*${t_fr("settings.notifications.email.archivedForm.paragraph4")}*
    `;

  await sendDefaultEmail({
    to: formInformation.ownersEmailAddresses,
    subject,
    body,
  });
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
