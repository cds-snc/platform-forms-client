import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, cors, sessionExists, jsonValidator } from "@lib/middleware";
import settingSchema from "@lib/middleware/schemas/settings.schema.json";
import { MiddlewareProps, WithRequired } from "@lib/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { logMessage } from "@lib/logger";
import { createAppSetting, getAllAppSettings } from "@lib/appSettings";

const settings = async (req: NextApiRequest, res: NextApiResponse, props: MiddlewareProps) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const ability = createAbility(session);

    switch (req.method) {
      case "GET": {
        const allSettings = await getAllAppSettings(ability);
        return res.status(200).json(allSettings);
      }

      case "POST": {
        const setting = req.body;
        if (!setting.nameEn || !setting.nameFr || !setting.internalId)
          return res.status(400).json({ error: "Malformed Request" });

        const createdSetting = await createAppSetting(ability, setting);
        return res.status(201).json(createdSetting);
      }
    }
  } catch (err) {
    logMessage.error(err);
    if (err instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    else return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default middleware(
  [cors({ allowedMethods: ["GET", "POST"] }), sessionExists(), jsonValidator(settingSchema)],
  settings
);
