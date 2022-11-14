import {
  CognitoIdentityProviderClient,
  ResendConfirmationCodeCommand,
  ResendConfirmationCodeCommandInput,
  CognitoIdentityProviderServiceException,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors, csrfProtected } from "@lib/middleware";

const resendConfirmationCode = async (req: NextApiRequest, res: NextApiResponse) => {
  const { COGNITO_REGION, COGNITO_APP_CLIENT_ID } = process.env;

  if (!req.body.username) {
    return res.status(400).json({
      message: "username needs to be provided in the body of the request",
    });
  }
  // build command parameters
  const params: ResendConfirmationCodeCommandInput = {
    ClientId: COGNITO_APP_CLIENT_ID,
    Username: req.body.username,
  };

  // instantiate the cognito client
  const cognitoClient = new CognitoIdentityProviderClient({
    region: COGNITO_REGION,
  });

  // instantiate command object
  const resendConfirmationCodeCommand = new ResendConfirmationCodeCommand(params);

  // attempt to execute command on cognito and handle failure
  try {
    const response = await cognitoClient.send(resendConfirmationCodeCommand);
    return res.status(response["$metadata"].httpStatusCode as number).send("");
  } catch (err) {
    const cognitoError = err as CognitoIdentityProviderServiceException;
    return res.status(cognitoError["$metadata"].httpStatusCode as number).json({
      message: cognitoError.toString(),
    });
  }
};

export default middleware(
  [cors({ allowedMethods: ["POST"] }), csrfProtected(["POST"])],
  resendConfirmationCode
);
