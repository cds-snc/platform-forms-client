import { NextApiRequest, NextApiResponse } from "next";
import { removeFlag, checkAll } from "@lib/flags";

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const key = req.query.key as string;
  await removeFlag(key);
  const flags = await checkAll();
  res.status(200).json(flags);
};
