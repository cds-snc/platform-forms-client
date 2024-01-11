import {
  CognitoIdentityProviderServiceException,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmForgotPasswordCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextResponse } from "next/server";
import { middleware, csrfProtected } from "@lib/middleware";
import { sanitizeEmailAddressForCognito } from "@lib/auth";

interface APIProps {
  username?: string;
  password?: string;
  confirmationCode?: string;
}

export const POST = middleware([csrfProtected()], async (req, props) => {
  const { COGNITO_REGION, COGNITO_APP_CLIENT_ID } = process.env;

  const { username, password, confirmationCode }: APIProps = props.body;

  if (!username || !password || !confirmationCode) {
    return NextResponse.json(
      {
        message:
          "username, password and security code needs to be provided in the body of the request",
      },
      {
        status: 400,
      }
    );
  }

  const sanitizedUsername = sanitizeEmailAddressForCognito(username);

  const params: ConfirmForgotPasswordCommandInput = {
    ClientId: COGNITO_APP_CLIENT_ID,
    ConfirmationCode: confirmationCode,
    Username: sanitizedUsername,
    Password: password,
  };

  const cognitoClient = new CognitoIdentityProviderClient({
    region: COGNITO_REGION,
  });

  const forgotPasswordCommand = new ConfirmForgotPasswordCommand(params);

  try {
    // send command to cognito
    const response = await cognitoClient.send(forgotPasswordCommand);

    return NextResponse.json({}, { status: response["$metadata"].httpStatusCode as number });
  } catch (err) {
    const cognitoError = err as CognitoIdentityProviderServiceException;

    return NextResponse.json(
      { message: cognitoError.toString() },
      { status: cognitoError["$metadata"].httpStatusCode as number }
    );
  }
});
