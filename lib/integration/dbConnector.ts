import { Client } from "pg";

const dbConnector = (connection?: string): Client => {
  const connectionString = connection ?? process.env.DATABASE_URL;
  if (!connectionString || connectionString === undefined)
    throw Error("Invalid db configuration string");
  const client = new Client({ connectionString });
  client.connect();
  return client;
};
export default dbConnector;
