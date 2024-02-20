import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, sessionExists, jsonValidator } from "@lib/middleware";
import settingSchema from "@lib/middleware/schemas/settings.schema.json";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { NextResponse } from "next/server";
import { logMessage } from "@lib/logger";
import { createAppSetting, getAllAppSettings } from "@lib/appSettings";

export const GET = middleware([sessionExists()], async (req, props) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const ability = createAbility(session);

    const allSettings = await getAllAppSettings(ability);
    return NextResponse.json(allSettings);
  } catch (err) {
    logMessage.error(err);
    if (err instanceof AccessControlError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    else return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});

export const POST = middleware(
  [sessionExists(), jsonValidator(settingSchema)],
  async (_, props) => {
    try {
      const { session } = props as WithRequired<MiddlewareProps, "session">;
      const ability = createAbility(session);

      const setting = props.body;
      if (!setting.nameEn || !setting.nameFr || !setting.internalId)
        return NextResponse.json({ error: "Malformed Request" }, { status: 400 });

      const createdSetting = await createAppSetting(
        ability,
        setting as {
          internalId: string;
          nameEn: string;
          nameFr: string;
        }
      );
      return NextResponse.json(createdSetting);
    } catch (err) {
      logMessage.error(err);
      if (err instanceof AccessControlError)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      else return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
);
