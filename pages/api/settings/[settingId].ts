import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, cors, sessionExists, jsonValidator } from "@lib/middleware";
import settingSchema from "@lib/middleware/schemas/settings.schema.json";
import { MiddlewareProps } from "@lib/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { logMessage } from "@lib/logger";
import { getAppSetting, updateAppSetting, deleteAppSetting } from "@lib/appSettings";

const settings = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { session }: MiddlewareProps
) => {
  try {
    const internalId = req.query.settingId;
    if (typeof internalId === "undefined" || Array.isArray(internalId))
      return res.status(400).json({ error: "Malformed Request" });

    if (!session || req.method === "GET") {
      const setting = await getAppSetting(internalId);
      return res.status(200).json(setting);
    }

    const ability = createAbility(session);

    switch (req.method) {
      case "PUT": {
        const setting = req.body;
        if (!setting.nameEn || !setting.nameFr || !setting.internalId)
          return res.status(400).json({ error: "Malformed Request" });

        const updatedSetting = await updateAppSetting(ability, internalId, setting);
        return res.status(200).json(updatedSetting);
      }
      case "DELETE": {
        await deleteAppSetting(ability, internalId);
        return res.status(200).send("ok");
      }
    }
  } catch (err) {
    logMessage.error(err);
    if (err instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    else return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default middleware(
  [
    cors({ allowedMethods: ["GET", "PUT", "DELETE"] }),
    sessionExists(["PUT", "DELETE"]),
    jsonValidator(settingSchema, { noValidateMethods: ["DELETE"] }),
  ],
  settings
);
