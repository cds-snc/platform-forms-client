import {
  CognitoIdentityProviderServiceException,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmForgotPasswordCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors, csrfProtected } from "@lib/middleware";

const confirmpassword = async (req: NextApiRequest, res: NextApiResponse) => {
  const { COGNITO_REGION, COGNITO_APP_CLIENT_ID } = process.env;

  if (!req.body.username || !req.body.password || !req.body.confirmationCode) {
    return res.status(400).json({
      message:
        "username, password and confirmation code needs to be provided in the body of the request",
    });
  }

  const params: ConfirmForgotPasswordCommandInput = {
    ClientId: COGNITO_APP_CLIENT_ID,
    ConfirmationCode: req.body.confirmationCode,
    Username: req.body.username,
    Password: req.body.password,
  };

  const cognitoClient = new CognitoIdentityProviderClient({
    region: COGNITO_REGION,
  });

  const forgotPasswordCommand = new ConfirmForgotPasswordCommand(params);

  try {
    // send command to cognito
    const response = await cognitoClient.send(forgotPasswordCommand);
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
  confirmpassword
);
