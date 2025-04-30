import { sendEmail } from "@lib/integration/notifyConnector";
import { logMessage } from "@lib/logger";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { getRedisInstance } from "@lib/integration/redisConnector";
import { getOrigin } from "@lib/origin";
import { NotificationsInterval } from "packages/types/src/form-types";

export const Status = {
  SENT: "sent",
  UNSENT: "unsent",
} as const;
export type Status = (typeof Status)[keyof typeof Status];

// Self-contained function for sending email notifications when a user has new form submissions
export const sendNotification = async (formId: string) => {
  try {
    const template = await getTemplateWithAssociatedUsers(formId);
    if (!template) {
      throw new Error(`template not found with id ${formId}`);
    }
    const {
      users,
      formRecord: {
        form: { titleEn, titleFr },
      },
    } = template;

    // Notifcations are turned off, do nothing
    const notifcationsInterval = template.formRecord.notifcationsInterval as NotificationsInterval;
    if (!notifcationsInterval) {
      return;
    }

    // Initial email for single submission and multiple submissions has been sent, do nothing
    const marker = await getMarker(formId);
    if (marker && marker === Status.SENT) {
      return;
    }

    // Initial email but not multiple submissions has been sent, send multiple submissions email
    if (marker && marker === Status.UNSENT) {
      sendEmailNotificationsToAllUsers(users, formId, String(titleEn), String(titleFr), true);
      setMarker(formId, notifcationsInterval, Status.SENT);
      return;
    }

    // No email has been sent, send single submission email
    sendEmailNotificationsToAllUsers(users, formId, String(titleEn), String(titleFr), false);
    setMarker(formId, notifcationsInterval);
  } catch (err) {
    logMessage.error(`sendNotification failed with error: ${err}`);
  }
};

export const setMarker = async (
  formId: string,
  notificationsInterval: NotificationsInterval,
  status: Status = Status.UNSENT
) => {
  const redis = await getRedisInstance();

  if (!notificationsInterval) {
    await redis.del(`notification:formId:${formId}`);
    logMessage.info(`setMarker: notification:formId:${formId} deleted`);
    return;
  }

  const ttl = notificationsInterval * 60; // convert from minutes to seconds
  await redis.set(`notification:formId:${formId}`, status, "EX", ttl);
  logMessage.info(
    `setMarker: notification:formId:${formId} with ttl ${ttl} ${
      status === Status.SENT ? " marked as sent" : "created"
    }`
  );
};

const getMarker = async (formId: string) => {
  logMessage.info(`getMarker: ${formId}`);
  const redis = await getRedisInstance();
  const marker = await redis.get(`notification:formId:${formId}`);
  return marker;
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
    throw "template missing users";
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
  const emailBody = multipleSubmissions
    ? multipleSubmissionsEmailTemplate(HOST, formId, formTitleEn, formTitleFr)
    : singleSubmissionEmailTemplate(HOST, formId, formTitleEn, formTitleFr);
  await sendEmail(email, {
    subject: multipleSubmissions
      ? "New responses | nouvelles réponses"
      : "Has one new response | A une nouvelle réponse",
    formResponse: emailBody,
  });
  logMessage.info(`sendEmail: ${email} ${formId} ${formTitleEn} | ${formTitleFr}`);
};

const singleSubmissionEmailTemplate = (
  HOST: string,
  formId: string,
  formTitleEn: string,
  formTitleFr: string
) => {
  // For Notify formatting see: https://documentation.notification.canada.ca/en/send.html#sending-an-email
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
  // For Notify formatting see: https://documentation.notification.canada.ca/en/send.html#sending-an-email
  return `
${formTitleEn} has new responses.

[Open ${formTitleEn}](${HOST}/form-builder/${formId}/responses)

---

${formTitleFr} a de nouvelles réponses

[Ovrir ${formTitleFr}](${HOST}/fr/form-builder/${formId}/responses)
    `;
};
