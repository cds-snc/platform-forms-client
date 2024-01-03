import {
  CognitoIdentityProviderServiceException,
  CognitoIdentityProviderClient,
  ForgotPasswordCommandInput,
  ForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextResponse } from "next/server";
import { middleware, csrfProtected } from "@lib/middleware";
import { logEvent } from "@lib/auditLogs";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { sanitizeEmailAddressForCognito } from "@lib/auth";

const logPasswordReset = async (email: string) => {
  const user = await prisma.user
    .findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
      },
    })
    .catch((e) => prismaErrors(e, null));
  logEvent(user?.id ?? "unknown", { type: "User", id: user?.id ?? "unknown" }, "UserPasswordReset");
};

interface APIProps {
  username?: string;
}

export const POST = middleware([csrfProtected()], async (req) => {
  const { COGNITO_REGION, COGNITO_APP_CLIENT_ID } = process.env;

  const { username }: APIProps = await req.json();

  if (!username) {
    return NextResponse.json(
      { message: "username needs to be provided in the body of the request" },
      { status: 400 }
    );
  }

  const sanitizedUsername = sanitizeEmailAddressForCognito(username);

  const params: ForgotPasswordCommandInput = {
    ClientId: COGNITO_APP_CLIENT_ID,
    Username: sanitizedUsername,
  };

  const cognitoClient = new CognitoIdentityProviderClient({
    region: COGNITO_REGION,
  });

  const forgotPasswordCommand = new ForgotPasswordCommand(params);

  try {
    // send command to cognito
    const response = await cognitoClient.send(forgotPasswordCommand);
    logPasswordReset(sanitizedUsername);

    return NextResponse.json({}, { status: response["$metadata"].httpStatusCode as number });
  } catch (err) {
    const cognitoError = err as CognitoIdentityProviderServiceException;
    return NextResponse.json(
      { message: cognitoError.toString() },
      { status: cognitoError["$metadata"].httpStatusCode as number }
    );
  }
});
