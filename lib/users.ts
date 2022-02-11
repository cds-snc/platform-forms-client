import dbConnector from "@lib/integration/dbConnector";
import executeQuery from "@lib/integration/queryManager";
import { User } from "@lib/types";

export const getUsers = async (): Promise<User[]> => {
  const result = await executeQuery(
    await dbConnector(),
    "SELECT id, name, email, admin FROM users"
  );
  return result.rows as User[];
};
