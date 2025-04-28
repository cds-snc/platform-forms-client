import { sendEmail } from "@lib/integration/notifyConnector";
import { logMessage } from "@lib/logger";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { getRedisInstance } from "@lib/integration/redisConnector";
import { getOrigin } from "@lib/origin";

// Self-contained function for sending email notifications for new form submissions
export const sendNotification = async (formId: string) => {
  try {
    logMessage.info(`sendNotification: ${formId}`);

    // Gather template settings
    const template = await getTemplateWithAssociatedUsers(formId);
    logMessage.info(`-----------sendNotification: template ${JSON.stringify(template)}`);
    if (!template) {
      throw new Error(`template not found with id ${formId}`);
    }
    const {
      users,
      formRecord: {
        form: { titleEn, titleFr },
      },
    } = template;
    const emailNotification = 1; // 1440=1 day, 10080=1 week  // @TODO: SET TO 1-min for testing, remove when done // @TODO: need to add in Schema first
    if (!emailNotification) {
      return;
    }
    if (!Array.isArray(users) || users.length === 0) {
      throw "template missing users";
    }
    const email = users[0].email; // TODO: send to all users or just the first one?

    // Check if an email has been sent and if so do nothing
    const marker = await getMarker(formId);
    if (marker) {
      logMessage.info(`sendNotification: marker exists`);
      return;
    }

    // No email has been sent, update redis and send an email
    logMessage.info(`sendNotification: marker does not exist`);
    setMarker(formId, emailNotification);
    sendEmailNotification(email, formId, String(titleEn), String(titleFr));
  } catch (err) {
    // TODO: the error message could be more specific from the function that throws it
    logMessage.error(`sendNotification failed with error: ${err}`);
  }
};

const getMarker = async (formId: string) => {
  logMessage.info(`getMarker: ${formId}`);
  const redis = await getRedisInstance();
  const marker = await redis.get(`notification:formId${formId}`);
  return marker;
};

const setMarker = async (formId: string, emailNotification: number) => {
  const ttl = emailNotification * 60; // convert to seconds
  const redis = await getRedisInstance();
  await redis.set(`notification:formId${formId}`, 1, "EX", ttl);
  logMessage.info(`setMarker: notification:formId${formId} with ttl ${ttl}`);
};

// TODO: French version
const defaultEmailTemplate = (
  HOST: string,
  formId: string,
  formTitleEn: string,
  formTitleFr: string
) => {
  // For notify formatting see: https://documentation.notification.canada.ca/en/send.html#sending-an-email
  return `
${formTitleEn} has new responses.

[Open ${formTitleEn}](${HOST}/form-builder/${formId}/responses)

---

${formTitleFr} nouvelles réponses

[Ovrir ${formTitleFr}](${HOST}/fr/form-builder/${formId}/responses)
    `;
};

const sendEmailNotification = async (
  email: string,
  formId: string,
  formTitleEn: string,
  formTitleFr: string
) => {
  logMessage.info(`sendEmail: ${email} ${formId} ${formTitleEn} | ${formTitleFr}`);
  const HOST = await getOrigin();
  await sendEmail(email, {
    subject: "New responses | nouvelles réponses",
    formResponse: defaultEmailTemplate(HOST, formId, formTitleEn, formTitleFr),
  });
};
