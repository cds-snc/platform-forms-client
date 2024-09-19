"use server";
import { getRedisInstance } from "@lib/integration/redisConnector";

export const fetchMessages = async () => {
  const redis = await getRedisInstance();
  const emails = await redis.lrange("notifyEmails", 0, -1);
  return emails.map((email) => JSON.parse(email)).reverse();
};

export const resetMessages = async () => {
  const redis = await getRedisInstance();
  await redis.del("notifyEmails");
};
