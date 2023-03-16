import { AccessControlError } from "@lib/privileges";
import { middleware, cors, sessionExists } from "@lib/middleware";
import { MiddlewareProps } from "@lib/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@lib/integration/prismaConnector";
import { logMessage } from "@lib/logger";

const settings = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { session }: MiddlewareProps
) => {
  try {
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    if (req.method === "GET") {
      const data = await prisma.settings.findFirst({
        select: { brandingRequestForm: true },
      });

      return res.status(200).json(data);
    }

    const { brandingRequestForm } = req.body;

    const recordID = await prisma.settings.findFirst({
      select: { id: true },
    });

    if (recordID) {
      const result = await prisma.settings.update({
        where: { id: recordID.id },
        data: { brandingRequestForm: brandingRequestForm },
      });

      return res.status(200).json(result);
    }

    const result = await prisma.settings.create({
      data: { brandingRequestForm: req.body.brandingRequestForm },
    });

    res.status(201).json(result);
  } catch (err) {
    logMessage.error(err);
    if (err instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    else return res.status(500).json({ error: "Malformed API Request" });
  }
};

export default middleware([cors({ allowedMethods: ["POST", "GET"] }), sessionExists()], settings);
