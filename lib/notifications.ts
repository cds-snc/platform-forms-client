import { sendEmail } from "@lib/integration/notifyConnector";
import { logMessage } from "@lib/logger";
import { getRedisInstance } from "@lib/integration/redisConnector";
import { getOrigin } from "@lib/origin";
import { NotificationsInterval } from "@gcforms/types";
import { serverTranslation } from "@i18n";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { logEvent } from "./auditLogs";
import { authorization } from "./privileges";

// TODO replace prisma calls in file with focussed reusable functions
// getNotificationUser
// getNotificationsUsers
// getDeliveryOption

// Most functions do not include an auth check since the request may be triggered from a
// non-signed-in user, e.g. sending notifications on a form submission.

const Status = {
  SINGLE_EMAIL_SENT: "SINGLE_EMAIL_SENT",
  MULTIPLE_EMAIL_SENT: "MULTIPLE_EMAIL_SENT",
} as const;
type Status = (typeof Status)[keyof typeof Status];

/**
 * Adds or removes the session user from the notificationsUsers list for a form. Users in
 * the notificationsUsers list will receive email notifications when a form has new submissions.
 */
export const updateNotificationsUser = async (formId: string, enabled: boolean) => {
  const { user: sessionUser } = await authorization.canEditForm(formId).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formId },
      "AccessDenied",
      "Attempted to update notifications interval for Form"
    );
    throw e;
  });

  const template = await prisma.template
    .findFirst({
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

  if (template === null) {
    logMessage.warn(
      `Can not notifications setting for user with id ${sessionUser.id}
       on template ${formId}. Template does not exist`
    );
    return null;
  }

  // A user can only update their own notifications settings
  const userToUpdate = template.users.find((u) => u.id === sessionUser.id);
  if (!userToUpdate) {
    logMessage.warn(
      `Can not find notifications setting for user with id ${sessionUser.id}
       on template ${formId}. User does not exist`
    );
    return null;
  }

  await prisma.template
    .update({
      where: {
        id: formId,
      },
      data: {
        notificationsUsers: {
          ...(enabled ? { connect: userToUpdate } : { disconnect: { id: userToUpdate.id } }),
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  logMessage.info(
    `saveNotificationsSettings updated notifications settings for user with email ${
      sessionUser.email
    } on template ${formId} to ${enabled ? "enabled" : "disabled"}`
  );

  logEvent(
    sessionUser.id,
    { type: "Form", id: formId },
    "UpdateNotificationsSettings",
    `User :${sessionUser.id} updated notifications setting on form ${formId} to ${
      enabled ? "enabled" : "disabled"
    }`
  );
};

/**
 * Sends an email notification when a user has new form submissions
 */
export const sendNotification = async (formId: string, titleEn: string, titleFr: string) => {
  const notificationsSettings = await _getNotificationsSettings(formId);
  if (!notificationsSettings) {
    logMessage.error(`sendNotification template not found with id ${formId}`);
    return;
  }

  const { users, notificationsInterval, deliveryOption } = notificationsSettings;

  // Avoid spamming users with emails by only sending one type of email, either an email
  // delivery or a notification. For legacy published forms that snuck in a delivery option.
  if (deliveryOption) {
    return;
  }

  // const notificationsInterval = usersAndNotifications.notificationsInterval;
  if (!validateNotificationsInterval(notificationsInterval)) {
    logMessage.error(
      `sendNotification template ${formId} has an invalid notificationsInterval ${notificationsInterval}`
    );
    return;
  }

  // set to 1440 instead of returning
  // Notifications are turned off for this form, do nothing. This should never happen with the current
  // logic that looks at each user's setting and uses this for how frequent to send emails.
  if (!notificationsInterval) {
    logMessage.debug(
      `sendNotification template ${formId} has notificationsInterval set to OFF, not sending notifications`
    );
    return;
  }

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

// const getNotificationsUsers

/**
 * Creates or updates an existing marker in Redis. Note to remove a marker, use removeMarker
 */
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

const validateNotificationsInterval = (
  notificationsInterval: number | null | undefined
): notificationsInterval is NotificationsInterval => {
  return Object.values(NotificationsInterval).includes(
    notificationsInterval as NotificationsInterval
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
    enabled: boolean;
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
  users.forEach(
    ({ email, enabled }) =>
      enabled && sendEmailNotification(email, formId, formTitleEn, formTitleFr, multipleSubmissions)
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

// TODO Update to be a unique feature and only needs to get notificationsUsers, not users
const _getNotificationsSettings = async (formId: string) => {
  const notificationsSettings = await prisma.template
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
        notificationsInterval: true, // todo hard code
        deliveryOption: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!notificationsSettings) {
    logMessage.warn(`getNotificationsSettings template not found with id ${formId}`);
    return null;
  }

  const { users, notificationsUsers, notificationsInterval, deliveryOption } =
    notificationsSettings;

  const allUsersWithSettings = users.map((user) => {
    const found = notificationsUsers.find((notificationUser) => notificationUser.id === user.id);
    return {
      id: user.id,
      email: user.email,
      enabled: found ? true : false,
    };
  });

  return {
    users: allUsersWithSettings,
    notificationsInterval,
    deliveryOption,
  };
};
