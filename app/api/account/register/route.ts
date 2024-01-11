import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  SignUpCommandInput,
  CognitoIdentityProviderServiceException,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextResponse } from "next/server";
import { middleware, csrfProtected } from "@lib/middleware";
import { isValidGovEmail } from "@lib/validation";
import { sanitizeEmailAddressForCognito } from "@lib/auth";

interface APIProps {
  username?: string;
  password?: string;
  name?: string;
}

export const POST = middleware([csrfProtected()], async (req, props) => {
  const { COGNITO_REGION, COGNITO_APP_CLIENT_ID } = process.env;

  const { username, password, name }: APIProps = props.body;

  // craft registration params for the SignUpCommand
  if (!username || !password || !name) {
    return NextResponse.json(
      { message: "username and password need to be provided in the body of the request" },
      { status: 400 }
    );
  }

  // Ensure email is part of acceptable domain list
  if (!isValidGovEmail(username)) {
    return NextResponse.json({ message: "username does not meet requirements" }, { status: 400 });
  }

  const sanitizedUsername = sanitizeEmailAddressForCognito(username);

  const params: SignUpCommandInput = {
    ClientId: COGNITO_APP_CLIENT_ID,
    Password: password,
    Username: sanitizedUsername,
    UserAttributes: [
      {
        Name: "name",
        Value: name,
      },
    ],
  };

  // instantiate the cognito client object. cognito is region specific and so a region must be specified
  const cognitoClient = new CognitoIdentityProviderClient({
    region: COGNITO_REGION,
  });

  // instantiate the signup command object
  const signUpCommand = new SignUpCommand(params);

  try {
    // attempt to send invoke cognito with the signup command with the user
    const response = await cognitoClient.send(signUpCommand);

    // forward the status code of the cognito response and send an empty body
    return NextResponse.json({}, { status: response["$metadata"].httpStatusCode as number });
  } catch (err) {
    // if there is an error, forward the status code and the error message as the body
    const cognitoError = err as CognitoIdentityProviderServiceException;
    return NextResponse.json(
      { message: cognitoError.toString() },
      { status: cognitoError["$metadata"].httpStatusCode as number }
    );
  }
});
