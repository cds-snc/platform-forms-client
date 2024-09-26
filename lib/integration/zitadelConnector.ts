import { createManagementClient, ManagementServiceClient } from "@zitadel/node/api";
import { ServiceAccount } from "@zitadel/node/credentials";
import { getEncryptedAppSetting, getAppSetting } from "@lib/appSettings";
import { logMessage } from "@lib/logger";
import { settingChangeNotifier } from "@lib/appSettings";
import { AuthenticationOptions } from "@zitadel/node/dist/commonjs/credentials/service-account";
import type { CallOptions, ClientMiddleware, ClientMiddlewareCall } from "nice-grpc";
import { Metadata } from "nice-grpc-common";

let zitadelClient: ManagementServiceClient;
let initializtionPromise: Promise<void> | null = null;

const recreateZitadelClient = async () => {
  logMessage.info("Recreating Zitadel client");
  await createZitadelClient();
};

settingChangeNotifier.on("zitadelAdministrationKey", async () => {
  await recreateZitadelClient();
});

settingChangeNotifier.on("zitadelProvider", async () => {
  await recreateZitadelClient();
});

const getZitadelSettings = async () => {
  const getZitadelAdministrationKey = getEncryptedAppSetting("zitadelAdministrationKey");
  const getZitadelProvider = getAppSetting("zitadelProvider");

  const [zitadelAdministrationKey, zitadelProvider] = await Promise.all([
    getZitadelAdministrationKey,
    getZitadelProvider,
  ]);

  if (!zitadelAdministrationKey || !zitadelProvider) {
    throw new Error("Zitadel settings are not properly configured");
  }

  return {
    zitadelAdministrationKey,
    zitadelProvider,
  };
};

const createServiceAccountInterceptor = (
  audience: string,
  serviceAccount: ServiceAccount,
  authOptions?: AuthenticationOptions
): ClientMiddleware => {
  let token: string | undefined;
  // Setting to 0 so the token will always be defined as being in the past and is fetched on the first call
  const expiryDate = new Date(0);

  return async function* <Request, Response>(
    call: ClientMiddlewareCall<Request, Response>,
    options: CallOptions
  ) {
    options.metadata ??= new Metadata();
    if (!options.metadata.has("authorization")) {
      // If the token is not set or the expiry date is in the past, fetch a new token
      if (expiryDate < new Date()) {
        token = await serviceAccount.authenticate(audience, authOptions);
        expiryDate.setTime(new Date().getTime() + 25 * 60 * 1000);
      }
      options.metadata.set("authorization", `Bearer ${token}`);
    }
    return yield* call.next(call.request, options);
  };
};

const createZitadelClient = async () => {
  const { zitadelAdministrationKey, zitadelProvider } = await getZitadelSettings();
  const serviceAccount = ServiceAccount.fromJsonString(zitadelAdministrationKey);
  zitadelClient = createManagementClient(
    zitadelProvider,
    createServiceAccountInterceptor(zitadelProvider, serviceAccount, { apiAccess: true })
  );
};

export const getZitadelClient = async () => {
  if (!initializtionPromise) {
    initializtionPromise = createZitadelClient();
  }
  await initializtionPromise;
  return zitadelClient;
};
