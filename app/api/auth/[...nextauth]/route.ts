import NextAuth from "next-auth";

import { begin2FAAuthentication, initiateSignIn } from "@lib/auth/";

import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@app/api/auth/authConfig";
import { logMessage } from "@lib/logger";

if (
  (!process.env.COGNITO_APP_CLIENT_ID ||
    !process.env.COGNITO_REGION ||
    !process.env.COGNITO_USER_POOL_ID) &&
  process.env.APP_ENV !== "test"
)
  throw new Error("Missing Cognito Credentials");

async function handler(req: NextRequest, context: never) {
  // Listens for the sign-in action for Cognito to initiate the sign in process

  logMessage.debug(
    `Next Auth Search Params ${JSON.stringify(req.nextUrl.searchParams.get("nextauth"))}`
  );
  logMessage.debug(`Next Auth Path: ${req.nextUrl.pathname}`);
  if (
    req.nextUrl.searchParams.get("nextauth")?.includes("signin") &&
    req.nextUrl.searchParams.get("nextauth")?.includes("cognito")
  ) {
    const { username, password } = await req.json();

    if (!username || !password)
      return NextResponse.json(
        { status: "error", error: "Missing username or password" },
        { status: 400 }
      );

    if (process.env.APP_ENV === "test") {
      return NextResponse.json(
        {
          status: "success",
          challengeState: "MFA",
          authenticationFlowToken: "0000-1111-2222-3333",
        },
        { status: 200 }
      );
    }

    try {
      const cognitoToken = await initiateSignIn({
        username: username,
        password: password,
      });

      if (cognitoToken) {
        const authenticationFlowToken = await begin2FAAuthentication(cognitoToken);

        return NextResponse.json(
          {
            status: "success",
            challengeState: "MFA",
            authenticationFlowToken: authenticationFlowToken,
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          {
            status: "error",
            error: "Cognito authentication failed",
            reason: "Missing Cognito token",
          },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        {
          status: "error",
          error: "Cognito authentication failed",
          reason: (error as Error).message,
        },
        { status: 401 }
      );
    }
  }

  return NextAuth(req, context, authOptions);
}
export { handler as GET, handler as POST };
