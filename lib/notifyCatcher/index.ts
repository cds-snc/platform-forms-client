import { type Personalisation } from "@gcforms/connectors";
import { getRedisInstance } from "@lib/integration/redisConnector";
import { logMessage } from "@lib/logger";

export const notifyCatcher = async (email: string, personalisation: Personalisation) => {
  try {
    const redis = await getRedisInstance();
    await redis.lpush("notifyEmails", JSON.stringify({ email, personalisation }));
  } catch (e) {
    logMessage.info("Development Notify email sending:", "", { email, personalisation });
    logMessage.info("To: " + email);
    logMessage.info("Subject: " + personalisation.subject);
    logMessage.info("Body: " + personalisation.formResponse);
  }
};
