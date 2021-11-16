import { logMessage } from "../logger";
import { QueryArrayResult, Client } from "pg";

const queryManager = {
  async executeQuery(
    client: Client,
    sql: string,
    params: [string]
  ): Promise<QueryArrayResult<unknown[]>> {
    try {
      if (!sql) throw new Error("Empty or invalid sql passed as a parameter");
      //Establish a connexion
      await client.connect();
      return await client.query(sql, params);
    } catch (error: unknown) {
      logMessage.error(`{"error: "${error}"}`);
      throw new Error(error as string);
    }
  },

  getResult(data: QueryArrayResult): unknown[][] {
    if (data.rowCount > 0) {
      return data.rows.map((record) => {
        return record;
      });
    }
    return [];
  },
};
export default queryManager;
