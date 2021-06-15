import { NextApiRequest, NextApiResponse } from "next";
import { checkOne, checkAll, createFlag, removeFlag } from "@lib/flags";

// Flags initial state values

const initialFlags: Record<string, boolean> = {
  sandbox: false,
  vault: false,
  googleAnalytics: false,
  unpublishedForms: false,
};

const initiateFlags = async () => {
  console.log("Running flag initiation");
  let currentFlags = await checkAll();
  // Remove flags that are no longer in use
  for (const key in currentFlags) {
    if (typeof initialFlags[key] === "undefined" || initialFlags[key] === null) {
      console.log(`Removing flag: ${key} from flag registry`);
      await removeFlag(key);
    }
  }
  // Create missing flags
  // Refresh keys
  currentFlags = await checkAll();
  for (const key in initialFlags) {
    if (typeof currentFlags[key] === "undefined" || currentFlags[key] === null) {
      console.log(`Creating flag: ${key} with value ${initialFlags[key]}`);
      await createFlag(key, initialFlags[key]);
    }
  }
};

initiateFlags();

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const key = req.query.key as string;
  const status = await checkOne(key);
  res.status(200).json(status);
};
