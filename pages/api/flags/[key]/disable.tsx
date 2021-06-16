import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { disableFlag, checkAll } from "@lib/flags";

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const session = await getSession({ req });
  if (session) {
    const key = req.query.key as string;
    await disableFlag(key);
    const flags = await checkAll();
    res.status(200).json(flags);
  } else {
    res.status(403).send("Forbidden");
  }
};
