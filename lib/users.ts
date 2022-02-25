import dbConnector from "@lib/integration/dbConnector";
import executeQuery from "@lib/integration/queryManager";
import { User } from "next-auth";

import { logMessage } from "./logger";

/**
 * Get all users
 * @returns An array of all Users
 */
export const getUsers = async (): Promise<User[]> => {
  const result = await executeQuery(
    await dbConnector(),
    "SELECT id, name, email, admin FROM users"
  );
  return result.rows as User[];
};

/**
 * Modifies the Admin role on a user
 * @param isAdmin
 * @param userID
 * @returns boolean that indicates success for failure
 */
export const adminRole = async (isAdmin: boolean, userID: number): Promise<boolean> => {
  try {
    await executeQuery(await dbConnector(), "UPDATE users SET admin = ($1) WHERE id = ($2)", [
      isAdmin.toString(),
      userID.toString(),
    ]);
  } catch (e) {
    logMessage.error(e as Error);
    return false;
  }
  return true;
};
