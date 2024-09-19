import { getRedisInstance } from "@lib/integration/redisConnector";
import { logMessage } from "@lib/logger";

export const notifyCatcher = async (
  email: string,
  personalisation: Record<string, string | Record<string, string>>
) => {
  const redis = await getRedisInstance();
  const emails = (await redis.get("notifyEmails")) || "[]";
  const notifyEmails = JSON.parse(emails);
  notifyEmails.push({ email, personalisation });
  await redis.set("notifyEmails", JSON.stringify(notifyEmails));

  logMessage.info("Development Notify email sending:", "", { email, personalisation });
  logMessage.info("To: " + email);
  logMessage.info("Subject: " + personalisation.subject);
  logMessage.info("Body: " + personalisation.formResponse);
};
