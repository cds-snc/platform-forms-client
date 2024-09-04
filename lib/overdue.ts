import { getRedisInstance } from "@lib/integration/redisConnector";
import { logMessage } from "@lib/logger";

export const getOverdueTemplateIds = async (templateIds: string[]): Promise<string[]> => {
  const KEY = "overdue:responses:template-ids";

  try {
    const redis = await getRedisInstance();
    const overdue = await redis.get(KEY);

    if (overdue) {
      const overdueData = JSON.parse(overdue);
      logMessage.info(`OVERDUE cached overdueData: ${overdue}`);
      return templateIds.filter((id) => overdueData.formIds.includes(id));
    }
  } catch (e) {
    const error = e as Error;
    logMessage.info(`OVERDUE error: ${error.message}`);
  }
  return [];
};
