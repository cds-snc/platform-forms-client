import { middleware, csrfProtected } from "@lib/middleware";
import { requestNew2FAVerificationCode } from "@lib/auth";
import { type NextRequest, NextResponse } from "next/server";

export const POST = middleware([csrfProtected()], async (request: NextRequest) => {
  const { authenticationFlowToken, email }: { authenticationFlowToken?: string; email?: string } =
    await request.json();

  if (!authenticationFlowToken || !email)
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });

  try {
    await requestNew2FAVerificationCode(authenticationFlowToken, email);
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Server failed to send a new verification code." },
      { status: 500 }
    );
  }
});
