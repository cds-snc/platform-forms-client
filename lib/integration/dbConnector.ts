import { Client } from "pg";

const dbConnector = (connection?: string): Client => {
  const connectionString = connection ?? process.env.DATABASE_URL;
  if (!connectionString || connectionString === undefined)
    throw Error("Invalid db configuration string");
  return new Client({ connectionString });
};
export default dbConnector;
