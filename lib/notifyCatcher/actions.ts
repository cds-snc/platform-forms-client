"use server";
import { getRedisInstance } from "@lib/integration/redisConnector";

export const fetchMessages = async () => {
  const redis = await getRedisInstance();
  const emails = (await redis.get("notifyEmails")) || "[]";
  const notifyEmails = JSON.parse(emails);

  return notifyEmails.reverse();
};

export const resetMessages = async () => {
  const redis = await getRedisInstance();
  await redis.set("notifyEmails", "[]");
};
