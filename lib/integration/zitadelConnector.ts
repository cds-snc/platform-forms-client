import { createPrivateKey } from "crypto";
import { SignJWT } from "jose";
import got, { OptionsOfTextResponseBody } from "got";
import { logMessage } from "@lib/logger";

type ZitadelAdministrationKey = {
  userId: string;
  keyId: string;
  key: string;
};

type ZitadelConnectionInformation = {
  url: string;
  trustedDomain: string;
  administrationKey: ZitadelAdministrationKey;
};

let connectionInformationCache: ZitadelConnectionInformation | undefined = undefined;

export function createMachineUser(
  userName: string,
  description: string
): Promise<{ userId: string }> {
  const connectionInformation = getConnectionInformation();
  return getApiManagementAccessToken(connectionInformation).then((accessToken) => {
    return got
      .post(`${connectionInformation.url}/management/v1/users/machine`, {
        ...getDefaultGotRequestOptions(connectionInformation, accessToken),
        json: {
          userName: userName,
          name: userName,
          description: description,
          accessTokenType: "ACCESS_TOKEN_TYPE_JWT",
        },
      })
      .json<{ userId: string }>()
      .then((response) => ({ userId: response.userId }))
      .catch((error) => {
        logMessage.error(error);
        throw new Error(`Failed to create machine user ${userName} in Zitadel`);
      });
  });
}

export function getMachineUser(loginName: string): Promise<{ userId: string } | undefined> {
  const connectionInformation = getConnectionInformation();
  return getApiManagementAccessToken(connectionInformation).then((accessToken) => {
    return got
      .post(`${connectionInformation.url}/v2/users`, {
        ...getDefaultGotRequestOptions(connectionInformation, accessToken),
        json: {
          query: {
            limit: 1,
          },
          queries: [
            {
              loginNameQuery: {
                loginName: loginName,
                method: "TEXT_QUERY_METHOD_EQUALS",
              },
            },
          ],
        },
      })
      .json<{ result?: { userId: string }[] }>()
      .then((response) => {
        if (response.result !== undefined && response.result.length > 0) {
          return { userId: response.result[0].userId };
        } else {
          return undefined;
        }
      })
      .catch((error) => {
        logMessage.error(error);
        throw new Error(`Failed to get machine user by login name ${loginName} in Zitadel`);
      });
  });
}

export function deleteMachineUser(userId: string): Promise<void> {
  const connectionInformation = getConnectionInformation();
  return getApiManagementAccessToken(connectionInformation).then((accessToken) => {
    return got
      .delete(
        `${connectionInformation.url}/v2/users/${userId}`,
        getDefaultGotRequestOptions(connectionInformation, accessToken)
      )
      .then(() => {})
      .catch((error) => {
        logMessage.error(error);
        throw new Error(`Failed to delete machine user ${userId} in Zitadel`);
      });
  });
}

export function createMachineKey(userId: string, publicKey: string): Promise<{ keyId: string }> {
  const connectionInformation = getConnectionInformation();
  return getApiManagementAccessToken(connectionInformation).then((accessToken) => {
    return got
      .post(`${connectionInformation.url}/management/v1/users/${userId}/keys`, {
        ...getDefaultGotRequestOptions(connectionInformation, accessToken),
        json: {
          type: "KEY_TYPE_JSON",
          publicKey: Buffer.from(publicKey).toString("base64"),
        },
      })
      .json<{ keyId: string }>()
      .then((response) => ({ keyId: response.keyId }))
      .catch((error) => {
        logMessage.error(error);
        throw new Error(`Failed to create machine key for user ${userId}`);
      });
  });
}

export function getMachineUserKeyById(userId: string, keyId: string): Promise<{ keyId: string }> {
  const connectionInformation = getConnectionInformation();
  return getApiManagementAccessToken(connectionInformation).then((accessToken) => {
    return got
      .get(`${connectionInformation.url}/management/v1/users/${userId}/keys/${keyId}`, {
        ...getDefaultGotRequestOptions(connectionInformation, accessToken),
      })
      .json<{ key: { id: string } }>()
      .then((response) => ({ keyId: response.key.id }));
  });
}

function getConnectionInformation(): ZitadelConnectionInformation {
  if (connectionInformationCache === undefined) {
    if (!process.env.ZITADEL_URL) throw new Error("No ZITADEL_URL environment variable found");
    if (!process.env.ZITADEL_TRUSTED_DOMAIN)
      throw new Error("No ZITADEL_TRUSTED_DOMAIN environment variable found");
    if (!process.env.ZITADEL_ADMINISTRATION_KEY)
      throw new Error("No ZITADEL_ADMINISTRATION_KEY environment variable found");

    connectionInformationCache = {
      url: process.env.ZITADEL_URL,
      trustedDomain: process.env.ZITADEL_TRUSTED_DOMAIN,
      administrationKey: JSON.parse(process.env.ZITADEL_ADMINISTRATION_KEY),
    };
  }

  return connectionInformationCache;
}

function getApiManagementAccessToken(
  connectionInformation: ZitadelConnectionInformation
): Promise<string> {
  const privateKey = createPrivateKey({
    key: connectionInformation.administrationKey.key,
  });

  const jwtSigner = new SignJWT()
    .setProtectedHeader({
      alg: "RS256",
      kid: connectionInformation.administrationKey.keyId,
    })
    .setIssuedAt()
    .setIssuer(connectionInformation.administrationKey.userId)
    .setSubject(connectionInformation.administrationKey.userId)
    .setAudience(`https://${connectionInformation.trustedDomain}`) // Expected audience for the JWT token is the IdP external domain
    .setExpirationTime("1 minute"); // long enough for the introspection to happen

  return jwtSigner.sign(privateKey).then((jwtSignedToken) => {
    return got
      .post(`${connectionInformation.url}/oauth/v2/token`, {
        http2: true,
        timeout: { request: 5000 },
        headers: {
          Host: connectionInformation.trustedDomain, // This is required by Zitadel to accept requests. See https://zitadel.com/docs/self-hosting/manage/custom-domain#standard-config
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          assertion: jwtSignedToken,
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          scope: "urn:zitadel:iam:org:project:id:zitadel:aud",
        }).toString(),
      })
      .then((response) => {
        return JSON.parse(response.body).access_token;
      });
  });
}

function getDefaultGotRequestOptions(
  connectionInformation: ZitadelConnectionInformation,
  accessToken: string
): OptionsOfTextResponseBody {
  return {
    http2: true,
    timeout: { request: 5000 },
    headers: {
      Host: connectionInformation.trustedDomain, // This is required by Zitadel to accept requests. See https://zitadel.com/docs/self-hosting/manage/custom-domain#standard-config
      Authorization: `Bearer ${accessToken}`,
    },
  };
}
