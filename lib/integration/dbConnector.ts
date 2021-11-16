import { Client } from "pg";

const dbConnector = (connexion?: string): Client => {
  const connectionString = connexion ?? process.env.DATABASE_URL;
  if (!connectionString || connectionString === undefined)
    throw Error("Invalid db configuration string");
  const client = new Client({ connectionString });
  return client;
};
export default dbConnector;
