import { NextApiRequest, NextApiResponse } from "next";
import { disableFlag, checkAll } from "@lib/flags";

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const key = req.query.key as string;
  await disableFlag(key);
  const flags = await checkAll();
  res.status(200).json(flags);
};
