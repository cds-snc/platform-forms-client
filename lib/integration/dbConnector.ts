import { Client } from "pg";

const dbConnector = async (connection?: string): Promise<Client> => {
  const connectionString = connection ?? process.env.DATABASE_URL;
  if (!connectionString || connectionString === undefined)
    throw Error("Invalid db configuration string");
  const client = new Client({ connectionString });
  await client.connect();
  return client;
};
export default dbConnector;
