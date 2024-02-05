import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, sessionExists, jsonValidator } from "@lib/middleware";
import settingSchema from "@lib/middleware/schemas/settings.schema.json";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { logMessage } from "@lib/logger";
import { getAppSetting, updateAppSetting, deleteAppSetting } from "@lib/appSettings";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: { params: Record<string, string> }) => {
  try {
    const internalId = params?.internalId;
    if (typeof internalId === "undefined" || Array.isArray(internalId))
      return NextResponse.json({ error: "Malformed Request" }, { status: 400 });

    const setting = await getAppSetting(internalId);
    return NextResponse.json({ setting });
  } catch (err) {
    logMessage.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const PUT = middleware(
  [sessionExists(), jsonValidator(settingSchema)],
  async (req, props) => {
    try {
      const internalId = props.params?.internalId;
      if (typeof internalId === "undefined" || Array.isArray(internalId))
        return NextResponse.json({ error: "Malformed Request" }, { status: 400 });
      const { session } = props as WithRequired<MiddlewareProps, "session">;
      const ability = createAbility(session);

      const setting = props.body;
      if (!setting.nameEn || !setting.nameFr || !setting.internalId)
        return NextResponse.json({ error: "Malformed Request" }, { status: 400 });

      const updatedSetting = await updateAppSetting(ability, internalId, setting);
      return NextResponse.json(updatedSetting);
    } catch (err) {
      logMessage.error(err);
      if (err instanceof AccessControlError)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      else return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
);

export const DELETE = middleware([sessionExists()], async (req, props) => {
  try {
    const internalId = props.params?.internalId;
    if (typeof internalId === "undefined" || Array.isArray(internalId))
      return NextResponse.json({ error: "Malformed Request" }, { status: 400 });
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const ability = createAbility(session);
    await deleteAppSetting(ability, internalId);
    return NextResponse.json("ok");
  } catch (err) {
    logMessage.error(err);
    if (err instanceof AccessControlError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    else return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
