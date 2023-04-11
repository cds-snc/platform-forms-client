import { NextApiRequest, NextApiResponse } from "next";
import { checkOne } from "@lib/flags";

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const key = req.query.key as string;
  const status = await checkOne(key);
  res.status(200).json({ status });
};
