import { createPrivateKey } from "crypto";
import { SignJWT } from "jose";
import got from "got";
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
let apiManagementAccessTokenCache: { token: string; timestamp: number } | undefined = undefined;

const zitadelApiManagementGotInstance = got.extend({
  hooks: {
    beforeRequest: [
      async (options) => {
        const connectionInformation = getConnectionInformation();
        const apiManagementAccessToken = await getApiManagementAccessToken(connectionInformation);

        options.http2 = true;
        options.timeout = { request: 5000 };
        options.headers["Host"] = connectionInformation.trustedDomain; // This is required by Zitadel to accept requests. See https://zitadel.com/docs/self-hosting/manage/custom-domain#standard-config
        options.headers["Authorization"] = `Bearer ${apiManagementAccessToken}`;
        options.retry.limit = 1;
        options.retry.errorCodes = ["ETIMEDOUT"];
      },
    ],
    beforeError: [
      (error) => {
        /**
         * Clear API management access token in case it is not valid while it should have been.
         * In practice this should never happen but if for some unknown reasons the token is revoked
         * we will not be blocking API features in the application for up to 25 minutes (cache TTL).
         */
        if (error.response?.statusCode === 401) {
          apiManagementAccessTokenCache = undefined;
        }
        return error;
      },
    ],
  },
});

export async function createMachineUser(
  userName: string,
  description: string
): Promise<{ userId: string }> {
  const connectionInformation = getConnectionInformation();

  try {
    const response = await zitadelApiManagementGotInstance
      .post(`${connectionInformation.url}/management/v1/users/machine`, {
        json: {
          userName: userName,
          name: userName,
          description: description,
          accessTokenType: "ACCESS_TOKEN_TYPE_JWT",
        },
      })
      .json<{ userId: string }>();

    return { userId: response.userId };
  } catch (error) {
    logMessage.error(error);
    throw new Error(`Failed to create machine user ${userName} in Zitadel`);
  }
}

export async function getMachineUser(loginName: string): Promise<{ userId: string } | undefined> {
  const connectionInformation = getConnectionInformation();

  try {
    const response = await zitadelApiManagementGotInstance
      .post(`${connectionInformation.url}/v2/users`, {
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
      .json<{ result?: { userId: string }[] }>();

    if (response.result !== undefined && response.result.length > 0) {
      return { userId: response.result[0].userId };
    } else {
      return undefined;
    }
  } catch (error) {
    logMessage.error(error);
    throw new Error(`Failed to get machine user by login name ${loginName} in Zitadel`);
  }
}

export async function deleteMachineUser(userId: string): Promise<void> {
  const connectionInformation = getConnectionInformation();

  try {
    await zitadelApiManagementGotInstance.delete(`${connectionInformation.url}/v2/users/${userId}`);
  } catch (error) {
    logMessage.error(error);
    throw new Error(`Failed to delete machine user ${userId} in Zitadel`);
  }
}

export async function createMachineKey(
  userId: string,
  publicKey: string
): Promise<{ keyId: string }> {
  const connectionInformation = getConnectionInformation();

  try {
    const response = await zitadelApiManagementGotInstance
      .post(`${connectionInformation.url}/management/v1/users/${userId}/keys`, {
        json: {
          type: "KEY_TYPE_JSON",
          publicKey: Buffer.from(publicKey).toString("base64"),
        },
      })
      .json<{ keyId: string }>();

    return { keyId: response.keyId };
  } catch (error) {
    logMessage.error(error);
    throw new Error(`Failed to create machine key for user ${userId}`);
  }
}

export async function deleteMachineKey(userId: string, keyId: string): Promise<void> {
  const connectionInformation = getConnectionInformation();

  try {
    await zitadelApiManagementGotInstance.delete(
      `${connectionInformation.url}/management/v1/users/${userId}/keys/${keyId}`
    );
  } catch (error) {
    logMessage.error(error);
    throw new Error(`Failed to delete machine key for user ${userId}`);
  }
}

export async function getMachineUserKeyById(
  userId: string,
  keyId: string
): Promise<{ keyId: string } | undefined> {
  const connectionInformation = getConnectionInformation();

  try {
    const response = await zitadelApiManagementGotInstance
      .get(`${connectionInformation.url}/management/v1/users/${userId}/keys/${keyId}`)
      .json<{ key: { id: string } }>();

    return { keyId: response.key.id };
  } catch (error) {
    logMessage.error(error);
    return undefined;
  }
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

async function getApiManagementAccessToken(
  connectionInformation: ZitadelConnectionInformation
): Promise<string> {
  /**
   * Cache is invalidated after 25 minutes while the actual token is valid for 30 minutes.
   * This is done to avoid having to wait for a Zitadel API request to fail because the token is invalid.
   */
  if (
    apiManagementAccessTokenCache !== undefined &&
    Date.now() - apiManagementAccessTokenCache.timestamp < 1500000 // 25 minutes in milliseconds
  ) {
    return apiManagementAccessTokenCache.token;
  }

  const apiManagementAccessToken = await generateApiManagementAccessToken(connectionInformation);

  apiManagementAccessTokenCache = { token: apiManagementAccessToken, timestamp: Date.now() };

  return apiManagementAccessTokenCache.token;
}

async function generateApiManagementAccessToken(
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

  const jwtSignedToken = await jwtSigner.sign(privateKey);

  const response = await got.post(`${connectionInformation.url}/oauth/v2/token`, {
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
  });

  return JSON.parse(response.body).access_token;
}
