import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  ConfirmSignUpCommandInput,
  CognitoIdentityProviderServiceException,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors, csrfProtected } from "@lib/middleware";

const { COGNITO_REGION, COGNITO_APP_CLIENT_ID } = process.env;

const confirm = async (req: NextApiRequest, res: NextApiResponse) => {
  // build parameters for the confirm sign up command
  const parmas: ConfirmSignUpCommandInput = {
    ClientId: COGNITO_APP_CLIENT_ID,
    Username: req.body.username,
    ConfirmationCode: req.body.confirmationCode,
  };

  // instantiate the cognito client
  const cognitoClient = new CognitoIdentityProviderClient({
    region: COGNITO_REGION,
  });

  // instantiate the confirm sign up command object
  const confirmSignUpCommand = new ConfirmSignUpCommand(parmas);

  try {
    // send command to cognito
    const response = await cognitoClient.send(confirmSignUpCommand);
    return res.status(response["$metadata"].httpStatusCode as number).send("");
  } catch (err) {
    const cognitoError = err as CognitoIdentityProviderServiceException;
    return res.status(cognitoError["$metadata"].httpStatusCode as number).json({
      message: cognitoError.toString(),
    });
  }
};

export default middleware([cors({ allowedMethods: ["POST"] }), csrfProtected(["POST"])], confirm);
