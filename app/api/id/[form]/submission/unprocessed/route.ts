import { AccessControlError } from "@lib/auth/errors";
import { middleware, sessionExists } from "@lib/middleware";
import { NextResponse } from "next/server";
import { unprocessedSubmissions } from "@lib/vault";

// Needed because NextJS attempts to cache the response of this route
export const dynamic = "force-dynamic";

export const GET = middleware([sessionExists()], async (req, props) => {
  try {
    const formId = props.params?.form;

    if (!formId || typeof formId !== "string") {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const result = await unprocessedSubmissions(formId);
    return NextResponse.json({ unprocessedSubmissions: result });
  } catch (err) {
    if (err instanceof AccessControlError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    else
      return NextResponse.json(
        { error: "There was an error. Please try again later." },
        { status: 500 }
      );
  }
});
