import { Client } from "pg";

const dbConnector = (connexion?: string): Client => {
  const connectionString = connexion ?? process.env.DATABASE_URL;
  if (!connectionString || connectionString === undefined)
    throw Error("Invalid db configuration string");
  return new Client({ connectionString });
};
export default dbConnector;
