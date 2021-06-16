import { NextApiRequest, NextApiResponse } from "next";
import { checkAll } from "@lib/flags";

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const flags = await checkAll();
  res.status(200).json(flags);
};
