import { logMessage } from "@lib/logger";
import { getRedisInstance } from "@lib/integration/redisConnector";
import { getOrigin } from "@lib/origin";
import { NotificationsInterval } from "@gcforms/types";
import { serverTranslation } from "@i18n";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { notification } from "./notification";

// TODO rename file to something like newSubmissionsNotification.ts

// Hard coded since only one interval is supported currently
const NOTIFICATIONS_INTERVAL = NotificationsInterval.DAY;

const Status = {
  SINGLE_EMAIL_SENT: "SINGLE_EMAIL_SENT",
  MULTIPLE_EMAIL_SENT: "MULTIPLE_EMAIL_SENT",
} as const;
type Status = (typeof Status)[keyof typeof Status];

// Public facing function to send notifications to all related users on a form submission
export const sendNotifications = async (formId: string, titleEn: string, titleFr: string) => {
  // Avoid sending additional notifications to legacy forms that receive delivery by email.
  const deliveryOption = await _getDeliveryOption(formId);
  if (deliveryOption) {
    return;
  }

  const users = await getNotificationsUsers(formId);

  // Some older forms may not have users, do nothing
  if (!Array.isArray(users) || users.length === 0) {
    return;
  }

  // No users have notifications enabled, do nothing
  const atLeastOneUserEnabled = users.some((user) => user.enabled);
  if (!atLeastOneUserEnabled) {
    return;
  }

  const marker = await getMarker(formId);
  switch (marker) {
    case Status.SINGLE_EMAIL_SENT:
      // Single submissions email sent but not multiple submissions email, send multiple email
      Promise.all([
        sendEmailNotification(users, formId, titleEn, titleFr, true),
        setMarker(formId, Status.MULTIPLE_EMAIL_SENT),
      ]);
      break;
    case Status.MULTIPLE_EMAIL_SENT:
      // Multiple submissions email has been sent, do nothing
      break;
    default:
      // No email has been sent, send single submission email
      Promise.all([
        sendEmailNotification(users, formId, titleEn, titleFr, false),
        setMarker(formId),
      ]);
  }
};

export const getNotificationsUsers = async (formId: string) => {
  const usersAndNotificationsUsers = await prisma.template
    .findUnique({
      where: {
        id: formId,
      },
      select: {
        users: {
          select: {
            id: true,
            email: true,
          },
        },
        notificationsUsers: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  // Can happen with legacy forms that do not have users
  if (!usersAndNotificationsUsers) {
    logMessage.info(`_getNotificationsUsers no users found for formId ${formId}`);
    return null;
  }

  const { users, notificationsUsers } = usersAndNotificationsUsers;

  return users.map((user) => {
    const foundUser = notificationsUsers.find(
      (notificationUser) => notificationUser.id === user.id
    );
    return {
      id: user.id,
      email: user.email,
      enabled: foundUser ? true : false,
    };
  });
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

  // Can happen with legacy forms that do not have a deliveryOption
  if (!template) {
    logMessage.info(`_getDeliveryOption template not found with id ${formId}`);
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

const sendEmailNotification = async (
  users: {
    email: string;
    enabled: boolean;
  }[],
  formId: string,
  formTitleEn: string,
  formTitleFr: string,
  multipleSubmissions: boolean = false
) => {
  try {
    const { t } = await serverTranslation("form-builder");
    const HOST = await getOrigin();

    if (!Array.isArray(users) || users.length === 0) {
      logMessage.error("sendEmailNotificationsToAllUsers missing users");
      return;
    }
    const emails = users.filter(({ enabled }) => enabled).map(({ email }) => email);

    await notification.immediate({
      notificationId: formId,
      emails,
      subject: multipleSubmissions
        ? t("settings.notifications.email.multipleSubmissions.subject")
        : t("settings.notifications.email.singleSubmission.subject"),
      body: multipleSubmissions
        ? await multipleSubmissionsEmailTemplate(HOST, formTitleEn, formTitleFr)
        : await singleSubmissionEmailTemplate(HOST, formTitleEn, formTitleFr),
    });
  } catch (error) {
    logMessage.error(
      `sendEmailNotification failed for formId ${formId} with error: ${(error as Error).message}`
    );
  }
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
