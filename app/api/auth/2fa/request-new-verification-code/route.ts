import { middleware, csrfProtected } from "@lib/middleware";
import { requestNew2FAVerificationCode } from "@lib/auth";
import { type NextRequest, NextResponse } from "next/server";
import { Missing2FASession } from "@lib/auth/cognito";

export const POST = middleware([csrfProtected()], async (request: NextRequest, props) => {
  const { authenticationFlowToken, email }: { authenticationFlowToken?: string; email?: string } =
    props.body;

  if (!authenticationFlowToken || !email)
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });

  try {
    await requestNew2FAVerificationCode(authenticationFlowToken, email);
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    if (error instanceof Missing2FASession) {
      return NextResponse.json({ error: "Missing 2FA session" }, { status: 401 });
    } else {
      return NextResponse.json(
        { error: "Server failed to send a new verification code." },
        { status: 500 }
      );
    }
  }
});
