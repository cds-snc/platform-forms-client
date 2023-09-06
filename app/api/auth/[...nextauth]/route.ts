import NextAuth from "next-auth";

import { begin2FAAuthentication, initiateSignIn } from "@lib/auth/";

import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@app/api/auth/authConfig";

if (
  (!process.env.COGNITO_APP_CLIENT_ID ||
    !process.env.COGNITO_REGION ||
    !process.env.COGNITO_USER_POOL_ID) &&
  process.env.APP_ENV !== "test"
)
  throw new Error("Missing Cognito Credentials");

async function handler(req: NextRequest, context: { params: { nextauth: string[] } }) {
  // Listens for the sign-in action for Cognito to initiate the sign in process

  if (context.params.nextauth.includes("signin") && context.params.nextauth.includes("cognito")) {
    const formData = await req.formData();
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();

    if (!username || !password)
      return NextResponse.json(
        { status: "error", error: "Missing username or password" },
        { status: 400 }
      );
    try {
      if (process.env.APP_ENV === "test") {
        const authenticationFlowToken = await begin2FAAuthentication({
          email: username,
          token: "testCognitoToken",
        });
        return NextResponse.json(
          {
            status: "success",
            challengeState: "MFA",
            authenticationFlowToken: authenticationFlowToken,
          },
          { status: 200 }
        );
      }

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
