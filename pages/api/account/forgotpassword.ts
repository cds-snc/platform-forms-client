import {
  CognitoIdentityProviderServiceException,
  CognitoIdentityProviderClient,
  ForgotPasswordCommandInput,
  ForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors, csrfProtected } from "@lib/middleware";
import { logEvent } from "@lib/auditLogs";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";

const forgotpassword = async (req: NextApiRequest, res: NextApiResponse) => {
  const { COGNITO_REGION, COGNITO_APP_CLIENT_ID } = process.env;

  if (!req.body.username) {
    return res.status(400).json({
      message: "username needs to be provided in the body of the request",
    });
  }

  const params: ForgotPasswordCommandInput = {
    ClientId: COGNITO_APP_CLIENT_ID,
    Username: req.body.username,
  };

  const cognitoClient = new CognitoIdentityProviderClient({
    region: COGNITO_REGION,
  });

  const forgotPasswordCommand = new ForgotPasswordCommand(params);

  try {
    // send command to cognito
    const response = await cognitoClient.send(forgotPasswordCommand);
    logPasswordReset(req.body.username);
    return res.status(response["$metadata"].httpStatusCode as number).send("");
  } catch (err) {
    const cognitoError = err as CognitoIdentityProviderServiceException;
    return res.status(cognitoError["$metadata"].httpStatusCode as number).json({
      message: cognitoError.toString(),
    });
  }
};

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

export default middleware(
  [cors({ allowedMethods: ["POST"] }), csrfProtected(["POST"])],
  forgotpassword
);
