import { AccessControlError } from "@lib/privileges";
import { middleware, cors, sessionExists } from "@lib/middleware";
import { MiddlewareProps } from "@lib/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@lib/integration/prismaConnector";

const settings = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { session }: MiddlewareProps
) => {
  try {
    if (!session) return res.status(401).json({ error: "Unauthorized" });
    // get branding request form settings
    const data = await prisma.settings.findFirst({
      select: {
        brandingRequestForm: true,
      },
    });

    /*
    const result = await prisma.settings.create({
      data: {
        brandingRequestForm: "123",
      },
      select: {
        id: true,
      },
    });
    */

    return res.status(200).json(data);
  } catch (err) {
    if (err instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    else return res.status(500).json({ error: "Malformed API Request" });
  }
};

export default middleware([cors({ allowedMethods: ["POST"] }), sessionExists()], settings);
