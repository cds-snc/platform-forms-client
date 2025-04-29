import { sendEmail } from "@lib/integration/notifyConnector";
import { logMessage } from "@lib/logger";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { getRedisInstance } from "@lib/integration/redisConnector";
import { getOrigin } from "@lib/origin";
import { NotificationsInterval } from "packages/types/src/form-types";

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

    // Check if an email has been sent and if so do nothing
    const marker = await getMarker(formId);
    if (marker) {
      return;
    }

    // No email has been sent, create a new marker if an interval has a falsy value
    const notifcationsInterval = template.formRecord.notifcationsInterval as NotificationsInterval;
    if (!notifcationsInterval) {
      return;
    }
    setMarker(formId, notifcationsInterval);

    // and send an email to each user
    if (!Array.isArray(users) || users.length === 0) {
      throw "template missing users";
    }
    users.forEach(({ email }) =>
      sendEmailNotification(email, formId, String(titleEn), String(titleFr))
    );
  } catch (err) {
    logMessage.error(`sendNotification failed with error: ${err}`);
  }
};

export const setMarker = async (formId: string, notificationsInterval: NotificationsInterval) => {
  const redis = await getRedisInstance();
  // Turn notifications off if a falsy value is passed
  if (!notificationsInterval) {
    await redis.del(`notification:formId:${formId}`);
    logMessage.info(`setMarker: notification:formId:${formId} deleted`);
    return;
  }
  // Update notifications with a ttl
  const ttl = notificationsInterval * 60; // convert from minutes to seconds
  await redis.set(`notification:formId:${formId}`, 1, "EX", ttl);
  logMessage.info(`setMarker: notification:formId:${formId} with ttl ${ttl}`);
};

const getMarker = async (formId: string) => {
  logMessage.info(`getMarker: ${formId}`);
  const redis = await getRedisInstance();
  const marker = await redis.get(`notification:formId:${formId}`);
  return marker;
};

const defaultEmailTemplate = (
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

${formTitleFr} nouvelles réponses

[Ovrir ${formTitleFr}](${HOST}/fr/form-builder/${formId}/responses)
    `;
}; // @TODO language strings

const sendEmailNotification = async (
  email: string,
  formId: string,
  formTitleEn: string,
  formTitleFr: string
) => {
  logMessage.info(`sendEmail: ${email} ${formId} ${formTitleEn} | ${formTitleFr}`);
  const HOST = await getOrigin();
  await sendEmail(email, {
    subject: "New responses | nouvelles réponses", // @TODO language strings
    formResponse: defaultEmailTemplate(HOST, formId, formTitleEn, formTitleFr),
  });
};
