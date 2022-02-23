import { NextApiRequest, NextApiResponse } from "next";
import { isAdmin } from "@lib/auth";
import { enableFlag, checkAll } from "@lib/flags";

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const session = await isAdmin({ req });
  if (session) {
    const key = req.query.key as string;
    await enableFlag(key);
    const flags = await checkAll();
    res.status(200).json(flags);
  } else {
    res.status(403).send("Forbidden");
  }
};
