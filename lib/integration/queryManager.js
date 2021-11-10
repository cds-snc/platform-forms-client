import { dbConnector } from "./dbConnector";
import { logMessage } from "../logger";

export const executeQuery = async (sql, params) => {
  const client = await dbConnector().connect();
  return await client
    .query(sql, params)
    .then((data) => {
      return { ...data };
    })
    .catch((error) => {
      logMessage.error(`{"status": "error", "error": "${formatError(error)}"}`);
      throw new Error(error);
    })
    .finally(() => {
      client.release();
    });
};
const formatError = (err) => {
  return typeof err === "object" ? JSON.stringify(err) : err;
};
