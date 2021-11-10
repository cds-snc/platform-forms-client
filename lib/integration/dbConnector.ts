import { Pool } from "pg";
import { logMessage } from "../logger";

const dbConnector = async (): Promise<Pool | undefined> => {
  try {
    if (process.env.DATABASE_URL) {
      logMessage.debug("Connexion initialization");
      return new Pool({
        connectionString: process.env.DATABASE_URL,
        idleTimeoutMillis: 30000,
      });
    }
  } catch (error) {
    logMessage.error("Error: unable to init db connexion");
  }
};
export default dbConnector;
