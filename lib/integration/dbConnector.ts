import { Client } from "pg";
import { logMessage } from "../logger";

export const dbConnector = async (): Promise<Client> => {
  const connectionString: string | undefined = process.env.DATABASE_URL;
  if (connectionString) {
    logMessage.debug("Connexion initialization");
    const client = new Client({ connectionString });
    //Attempt a connexion
    await client.connect();
    return client;
  }
  throw new Error("connexion error");
  // connect by using rds client like so
  //new RDSDataClient({ region: REGION });
};
export default dbConnector;
