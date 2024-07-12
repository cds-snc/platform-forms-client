import {
  createManagementClient,
  createServiceAccountInterceptor,
  ManagementServiceClient,
} from "@zitadel/node/api";
import { decryptSetting, getAppSetting } from "@lib/appSettings";
import { checkOne } from "@lib/cache/flags";
import { ServiceAccount } from "@zitadel/node/credentials";

let zitadelClient: ManagementServiceClient | null = null;

const getZitadelSettings = async () => {
  const [encryptedAdministrationKey, zitadelProvider] = await Promise.all([
    getAppSetting("zitadelAdministrationKey"),
    getAppSetting("zitadelProvider"),
  ]);

  if (!zitadelProvider) throw new Error("No value set for Zitadel Provider Setting");

  if (!encryptedAdministrationKey)
    throw new Error("No value set for Zitadel Administration Setting");

  const zitadelAdministrationKey = decryptSetting(encryptedAdministrationKey);

  if (!zitadelAdministrationKey)
    throw new Error("Zitadel Adminstration Setting is not a valid JSON String");

  return { zitadelAdministrationKey, zitadelProvider };
};

const createZitadelClient = async () => {
  const zitadelActive = await checkOne("zitadelAuth");
  if (!zitadelActive) {
    throw new Error("Zitadel is not currently enabled as a feature flag");
  }
  const { zitadelAdministrationKey, zitadelProvider } = await getZitadelSettings();
  const serviceAccount = ServiceAccount.fromJsonString(zitadelAdministrationKey);
  return createManagementClient(
    zitadelProvider,
    createServiceAccountInterceptor(zitadelProvider, serviceAccount, { apiAccess: true })
  );
};

export const getZitadelClient = async () => {
  if (!zitadelClient) {
    zitadelClient = await createZitadelClient();
  }
  return zitadelClient;
};

// If zitadelAuth is enabled, create the client before any function is called
checkOne("zitadelAuth").then(async (zitadelActive) => {
  if (zitadelActive) {
    // No need to set the client to the variable, as it is already set in the function
    await getZitadelClient();
  }
});
