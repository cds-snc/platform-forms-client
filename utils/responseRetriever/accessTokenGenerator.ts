import { createPrivateKey } from "node:crypto";
import { SignJWT } from "jose";
import axios from "axios";
import type { PrivateApiKey } from "./types.js";

export function generateAccessToken(
  identityProviderUrl: string,
  projectIdentifier: string,
  privateApiKey: PrivateApiKey
): Promise<string> {
  const privateKey = createPrivateKey({ key: privateApiKey.key });

  const jsonWebTokenSigner = new SignJWT()
    .setProtectedHeader({ alg: "RS256", kid: privateApiKey.keyId })
    .setIssuedAt()
    .setIssuer(privateApiKey.userId)
    .setSubject(privateApiKey.userId)
    .setAudience(identityProviderUrl)
    .setExpirationTime("1 minute");

  return jsonWebTokenSigner
    .sign(privateKey)
    .then((signedJsonWebToken) =>
      axios.post(
        `${identityProviderUrl}/oauth/v2/token`,
        {
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: signedJsonWebToken,
          scope: `openid profile urn:zitadel:iam:org:project:id:${projectIdentifier}:aud`,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
    )
    .then((response) => response.data.access_token as string)
    .catch((error) => {
      throw new Error("Failed to generate access token", { cause: error });
    });
}
