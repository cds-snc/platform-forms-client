import { logMessage } from "../logger";
import dbConnector from "./dbConnector";
import { QueryArrayResult } from "pg";

const queryManager = {
  async executeQuery(sql: string, params: [string]): Promise<QueryArrayResult<unknown[]>> {
    try {
      // Get a client
      const client = dbConnector();
      //Stablish a connexion
      await client.connect();
      if (!sql) throw new Error("Invalid query param");

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
