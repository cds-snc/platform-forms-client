import { logMessage } from "@lib/logger";
import { QueryResult, Client } from "pg";

const executeQuery = async (
  client: Client,
  sql: string,
  params?: string[]
): Promise<QueryResult> => {
  try {
    if (!sql) throw new Error("Empty or invalid sql passed as a parameter");
    return await client.query(sql, params);
  } catch (error: unknown) {
    logMessage.error(`{"error: "${error}"}`);
    throw new Error(error as string);
  }
};

export default executeQuery;
