import { sendEmail } from "@lib/integration/notifyConnector";
import { logMessage } from "@lib/logger";
import { getUsersAndNotificationsInterval } from "@lib/templates";
import { getRedisInstance } from "@lib/integration/redisConnector";
import { getOrigin } from "@lib/origin";
import { NotificationsInterval } from "packages/types/src/form-types";

export const Status = {
  SINGLE_EMAIL_SENT: "SINGLE_EMAIL_SENT",
  MULTIPLE_EMAIL_SENT: "MULTIPLE_EMAIL_SENT",
} as const;
export type Status = (typeof Status)[keyof typeof Status];

// Sends an email notification when a user has new form submissions
export const sendNotification = async (formId: string, titleEn: string, titleFr: string) => {
  const usersAndNotifications = await getUsersAndNotificationsInterval(formId);
  if (!usersAndNotifications) {
    logMessage.error(`sendNotification template not found with id ${formId}`);
    return;
  }

  const { users } = usersAndNotifications;
  const notifcationsInterval = usersAndNotifications.notifcationsInterval as NotificationsInterval;

  if (!notifcationsInterval) {
    // Notifcations are turned off, do nothing
    return;
  }

  const marker = await getMarker(formId);
  switch (marker) {
    case Status.SINGLE_EMAIL_SENT:
      // Single submissions email sent but not multiple submissions email, send multiple email
      Promise.all([
        sendEmailNotificationsToAllUsers(users, formId, titleEn, titleFr, true),
        setMarker(formId, notifcationsInterval, Status.MULTIPLE_EMAIL_SENT),
      ]);
      break;
    case Status.MULTIPLE_EMAIL_SENT:
      // Multiple submissions email has been sent, do nothing
      break;
    default:
      // No email has been sent, send single submission email
      Promise.all([
        sendEmailNotificationsToAllUsers(users, formId, titleEn, titleFr, false),
        setMarker(formId, notifcationsInterval),
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

const setMarker = async (
  formId: string,
  notificationsInterval: NotificationsInterval,
  status: Status = Status.SINGLE_EMAIL_SENT
) => {
  if (!notificationsInterval) {
    logMessage.error(`setMarker missing notificationsInterval for formId ${formId}`);
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
    id: string;
    name: string | null;
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
  const HOST = await getOrigin();
  await sendEmail(email, {
    subject: multipleSubmissions
      ? "New responses | nouvelles réponses"
      : "Has one new response | A une nouvelle réponse",
    formResponse: multipleSubmissions
      ? multipleSubmissionsEmailTemplate(HOST, formId, formTitleEn, formTitleFr)
      : singleSubmissionEmailTemplate(HOST, formId, formTitleEn, formTitleFr),
  })
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

const singleSubmissionEmailTemplate = (
  HOST: string,
  formId: string,
  formTitleEn: string,
  formTitleFr: string
) => {
  return `
${formTitleEn} has one new response.

[Open ${formTitleEn}](${HOST}/form-builder/${formId}/responses)

---

${formTitleFr} a une nouvelle réponse.

[Ovrir ${formTitleFr}](${HOST}/fr/form-builder/${formId}/responses)
    `;
};

const multipleSubmissionsEmailTemplate = (
  HOST: string,
  formId: string,
  formTitleEn: string,
  formTitleFr: string
) => {
  return `
${formTitleEn} has new responses.

[Open ${formTitleEn}](${HOST}/form-builder/${formId}/responses)

---

${formTitleFr} a de nouvelles réponses

[Ovrir ${formTitleFr}](${HOST}/fr/form-builder/${formId}/responses)
    `;
};
