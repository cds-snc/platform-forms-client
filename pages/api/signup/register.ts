import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  SignUpCommandInput,
  CognitoIdentityProviderServiceException,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors, csrfProtected } from "@lib/middleware";

const { COGNITO_REGION, COGNITO_APP_CLIENT_ID } = process.env;

const register = async (req: NextApiRequest, res: NextApiResponse) => {
  // craft registration params for the SignUpCommand
  const params: SignUpCommandInput = {
    ClientId: COGNITO_APP_CLIENT_ID,
    Password: req.body.password,
    Username: req.body.username,
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
