import { Client } from "pg";
import { logMessage } from "../logger";
import { parse } from "pg-connection-string";

export const dbConnector = async (): Promise<Client> => {
  if (process.env.DATABASE_URL /** if local or cypress */) {
    logMessage.debug("Connexion initialization");
    const dbConfig = parse(process.env.DATABASE_URL);
    const client = new Client({ ...dbConfig });
    // etablishing a connexion
    await client.connect();
    return client;
  }
  throw new Error("connexion error");
  // connect by using rds client like so
  //new RDSDataClient({ region: REGION });
};
