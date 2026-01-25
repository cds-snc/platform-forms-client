"use server";
import { getRedisInstance } from "@lib/integration/redisConnector";

export const fetchMessages = async () => {
  const redis = await getRedisInstance();
  const emails = await redis.lrange("notifyEmails", 0, -1);
  return emails.map((email) => JSON.parse(email));
};

export const resetMessages = async () => {
  const redis = await getRedisInstance();
  await redis.del("notifyEmails");
};

export const deleteMessageByIndex = async (index: number) => {
  const redis = await getRedisInstance();
  const emails = await redis.lrange("notifyEmails", 0, -1);
  if (index >= 0 && index < emails.length) {
    // Remove the specific item by setting it to a placeholder, then removing all occurrences
    const placeholder = "__DELETE_PLACEHOLDER__" + Date.now();
    await redis.lset("notifyEmails", index, placeholder);
    await redis.lrem("notifyEmails", 1, placeholder);
  }
};
