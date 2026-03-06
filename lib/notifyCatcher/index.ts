import { type Personalisation } from "@gcforms/connectors";
import { getRedisInstance } from "@lib/integration/redisConnector";
import { logMessage } from "@lib/logger";

export const notifyCatcher = async (email: string, personalisation: Personalisation) => {
  try {
    const redis = await getRedisInstance();
    await redis.lpush("notifyEmails", JSON.stringify({ email, personalisation }));
  } catch (e) {
    logMessage.error(`NotifyCatcher failed to catch the email: ${(e as Error).message}`);

    // just log it out
    logMessage.info("Development Notify email sending");
    logMessage.info("To: " + email);
    logMessage.info("Subject: " + personalisation.subject);
    logMessage.info("Body: " + personalisation.formResponse);
  }
};
