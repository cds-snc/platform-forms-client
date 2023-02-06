import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  SignUpCommandInput,
  CognitoIdentityProviderServiceException,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors, csrfProtected } from "@lib/middleware";
import { isValidGovEmail } from "@lib/validation";

const register = async (req: NextApiRequest, res: NextApiResponse) => {
  const { COGNITO_REGION, COGNITO_APP_CLIENT_ID } = process.env;

  // craft registration params for the SignUpCommand
  if (!req.body.username || !req.body.password || !req.body.name) {
    return res.status(400).json({
      message: "username and password need to be provided in the body of the request",
    });
  }

  // Ensure email is part of acceptable domain list
  if (!isValidGovEmail(req.body.username)) {
    return res.status(400).json({
      message: "username does not meet requirements",
    });
  }
  const params: SignUpCommandInput = {
    ClientId: COGNITO_APP_CLIENT_ID,
    Password: req.body.password,
    Username: req.body.username,
    UserAttributes: [
      {
        Name: "name",
        Value: req.body.name,
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
    return res.status(response["$metadata"].httpStatusCode as number).send("");
  } catch (err) {
    // if there is an error, forward the status code and the error message as the body
    const cognitoError = err as CognitoIdentityProviderServiceException;
    return res
      .status(cognitoError["$metadata"].httpStatusCode as number)
      .json({ message: cognitoError.toString() });
  }
};

// only allow CSRF protected POST requests
export default middleware([cors({ allowedMethods: ["POST"] }), csrfProtected(["POST"])], register);
