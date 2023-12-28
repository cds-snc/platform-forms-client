import { NextApiRequest, NextApiResponse } from "next";
import { checkOne } from "@lib/cache/flags";
import { middleware, cors } from "@lib/middleware";

const allowedMethods = ["GET"];

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const key = req.query.key as string;
  const status = await checkOne(key);
  res.status(200).json({ status });
};

export default middleware([cors({ allowedMethods })], handler);
