import { logMessage } from "../logger";
import { QueryArrayResult, Client } from "pg";

const executeQuery = async (
  client: Client,
  sql: string,
  params: [string]
): Promise<QueryArrayResult<unknown[]>> => {
  try {
    if (!sql) throw new Error("Empty or invalid sql passed as a parameter");
    return await client.query(sql, params);
  } catch (error: unknown) {
    logMessage.error(`{"error: "${error}"}`);
    throw new Error(error as string);
  }
};

export default executeQuery;
