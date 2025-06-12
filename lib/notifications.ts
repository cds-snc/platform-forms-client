import { sendEmail } from "@lib/integration/notifyConnector";
import { logMessage } from "@lib/logger";
import { getRedisInstance } from "@lib/integration/redisConnector";
import { getOrigin } from "@lib/origin";
import { DeliveryOption, NotificationsInterval } from "@gcforms/types";
import { serverTranslation } from "@i18n";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { logEvent } from "./auditLogs";
import { authorization } from "./privileges";

const Status = {
  SINGLE_EMAIL_SENT: "SINGLE_EMAIL_SENT",
  MULTIPLE_EMAIL_SENT: "MULTIPLE_EMAIL_SENT",
} as const;
type Status = (typeof Status)[keyof typeof Status];

// Sends an email notification when a user has new form submissions
export const sendNotification = async (formId: string, titleEn: string, titleFr: string) => {
  const usersAndNotifications = await _getUsersAndNotificationsInterval(formId);
  if (!usersAndNotifications) {
    logMessage.error(`sendNotification template not found with id ${formId}`);
    return;
  }

  const { users, deliveryOption } = usersAndNotifications;

  // Avoid spamming users with emails by only sending one type of email, either an email
  // delivery or a notification
  if (deliveryOption) {
    return;
  }

  const notificationsInterval = usersAndNotifications.notificationsInterval;
  if (!validateNotificationsInterval(notificationsInterval)) {
    logMessage.error(
      `sendNotification template ${formId} has an invalid notificationsInterval ${notificationsInterval}`
    );
    return;
  }

  // Notifcations are turned off, do nothing
  if (!notificationsInterval) {
    return;
  }

  const marker = await getMarker(formId);
  switch (marker) {
    case Status.SINGLE_EMAIL_SENT:
      // Single submissions email sent but not multiple submissions email, send multiple email
      Promise.all([
        sendEmailNotificationsToAllUsers(users, formId, titleEn, titleFr, true),
        setMarker(formId, notificationsInterval, Status.MULTIPLE_EMAIL_SENT),
      ]);
      break;
    case Status.MULTIPLE_EMAIL_SENT:
      // Multiple submissions email has been sent, do nothing
      break;
    default:
      // No email has been sent, send single submission email
      Promise.all([
        sendEmailNotificationsToAllUsers(users, formId, titleEn, titleFr, false),
        setMarker(formId, notificationsInterval),
      ]);
  }
};

export const removeMarker = async (formId: string) => {
  const redis = await getRedisInstance();
  await redis
    .del(`notification:formId:${formId}`)
    .then(() => logMessage.debug(`removeMarker: notification:formId:${formId} deleted`))
    .catch((err) => logMessage.error(`removeMarker with ${formId} failed to delete ${err}`));
};

// Creates or updates an existing marker in Redis. Note to remove a marker, use removeMarker
const setMarker = async (
  formId: string,
  notificationsInterval: NotificationsInterval,
  status: Status = Status.SINGLE_EMAIL_SENT
) => {
  if (!notificationsInterval || !validateNotificationsInterval(notificationsInterval)) {
    logMessage.error(`setMarker has an invalid notificationsInterval for formId ${formId}`);
    return;
  }
  const ttl = notificationsInterval * 60; // convert from minutes to seconds
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

const sendEmailNotificationsToAllUsers = async (
  users: {
    email: string;
  }[],
  formId: string,
  formTitleEn: string,
  formTitleFr: string,
  multipleSubmissions: boolean = false
) => {
  if (!Array.isArray(users) || users.length === 0) {
    logMessage.error("sendEmailNotificationsToAllUsers missing users");
    return;
  }
  users.forEach(({ email }) =>
    sendEmailNotification(email, formId, formTitleEn, formTitleFr, multipleSubmissions)
  );
};

const sendEmailNotification = async (
  email: string,
  formId: string,
  formTitleEn: string,
  formTitleFr: string,
  multipleSubmissions: boolean = false
) => {
  const { t } = await serverTranslation("form-builder");
  const HOST = await getOrigin();
  await sendEmail(
    email,
    {
      subject: multipleSubmissions
        ? t("settings.notifications.email.multipleSubmissions.subject")
        : t("settings.notifications.email.singleSubmission.subject"),
      formResponse: multipleSubmissions
        ? await multipleSubmissionsEmailTemplate(HOST, formTitleEn, formTitleFr)
        : await singleSubmissionEmailTemplate(HOST, formTitleEn, formTitleFr),
    },
    "notification"
  )
    .then(() =>
      logMessage.debug(
        `sendEmailNotification sent email to ${email} with formId ${formId} for type ${
          multipleSubmissions ? "multiple email" : "single email"
        }`
      )
    )
    .catch(() =>
      logMessage.error(`sendEmailNotification failed to send email ${email} with formId ${formId}`)
    );
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

export const validateNotificationsInterval = (
  notificationsInterval: number | null | undefined
): notificationsInterval is NotificationsInterval => {
  return Object.values(NotificationsInterval).includes(
    notificationsInterval as NotificationsInterval
  );
};

const _getUsersAndNotificationsInterval = async (
  formID: string
): Promise<{
  notificationsInterval: number | null | undefined;
  users: { email: string }[];
  deliveryOption: DeliveryOption | null;
} | null> => {
  const usersAndNotificationsInterval = await prisma.template
    .findUnique({
      where: {
        id: formID,
      },
      select: {
        notificationsInterval: true,
        deliveryOption: true,
        users: {
          select: {
            email: true,
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!usersAndNotificationsInterval) return null;

  return {
    users: usersAndNotificationsInterval.users,
    notificationsInterval: usersAndNotificationsInterval.notificationsInterval,
    deliveryOption: usersAndNotificationsInterval.deliveryOption as DeliveryOption,
  };
};

export const updateNotificationsSetting = async (
  formId: string,
  notificationsInterval: NotificationsInterval
) => {
  const { user } = await authorization.canEditForm(formId).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formId },
      "AccessDenied",
      "Attempted to update notifications interval for Form"
    );
    throw e;
  });

  if (!validateNotificationsInterval(notificationsInterval)) {
    throw new Error(`Invalid notifications interval: ${notificationsInterval}`);
  }

  await prisma.template
    .update({
      where: {
        id: formId,
      },
      data: {
        notificationsInterval,
      },
    })
    .catch((e) => prismaErrors(e, null));

  logEvent(
    user.id,
    { type: "Form", id: formId },
    "UpdateNotificationsInterval",
    `User :${user.id} updated notifications interval on form ${formId} to ${notificationsInterval}`
  );
};

export const getNotificationsUsers = async (
  formId: string
): Promise<{ email: string; enabled: boolean }[] | null> => {
  // No auth check since this may be requested from a non-signed-in user
  // e.g. sending notifications on a form submission
  const usersAndNotifications = await _getUsersAndNotificationsUsers(formId);
  if (!usersAndNotifications) {
    logMessage.error(`getNotificationsUsers template not found with id ${formId}`);
    return null;
  }

  const { users, notificationsUsers } = usersAndNotifications;
  return users.map((user) => {
    const found = notificationsUsers.find((nUser) => nUser.email === user.email);
    return {
      email: user.email,
      enabled: found ? true : false,
    };
  });
};

const _getUsersAndNotificationsUsers = async (
  formId: string
): Promise<{ users: { email: string }[]; notificationsUsers: { email: string }[] } | null> => {
  // No auth check since this may be requested from a non-signed-in user
  // e.g. sending notifications on a form submission
  return prisma.template
    .findUnique({
      where: {
        id: formId,
      },
      select: {
        users: {
          select: {
            email: true,
          },
        },
        notificationsUsers: {
          select: {
            email: true,
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));
};
