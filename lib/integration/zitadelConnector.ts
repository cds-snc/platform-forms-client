import {
  createManagementClient,
  createServiceAccountInterceptor,
  ManagementServiceClient,
} from "@zitadel/node/api";
import { checkOne } from "@lib/cache/flags";
import { ServiceAccount } from "@zitadel/node/credentials";
import { getEncryptedAppSetting, getAppSetting } from "@lib/appSettings";
import { logMessage } from "@lib/logger";
import { settingChangeNotifier } from "@lib/appSettings";

let zitadelClient: ManagementServiceClient | null = null;

const recreateZitadelClient = async () => {
  logMessage.info("Recreating Zitadel client");
  zitadelClient = await createZitadelClient();
};

settingChangeNotifier.on("zitadelAdministrationKey", async () => {
  await recreateZitadelClient();
});

settingChangeNotifier.on("zitadelProvider", async () => {
  await recreateZitadelClient();
});

const getZitadelSettings = async () => {
  const startTime = Date.now();
  // if (!process.env.ZITADEL_PROVIDER) throw new Error("No value set for Zitadel Provider");

  // if (!process.env.ZITADEL_ADMINISTRATION_KEY)
  //   throw new Error("Zitadel Adminstration Key is not set");

  // return {
  //   zitadelAdministrationKey: process.env.ZITADEL_ADMINISTRATION_KEY,
  //   zitadelProvider: process.env.ZITADEL_PROVIDER,
  // };

  const getZitadelAdministrationKey = getEncryptedAppSetting("zitadelAdministrationKey");
  const getZitadelProvider = getAppSetting("zitadelProvider");

  const [zitadelAdministrationKey, zitadelProvider] = await Promise.all([
    getZitadelAdministrationKey,
    getZitadelProvider,
  ]);

  if (!zitadelAdministrationKey || !zitadelProvider) {
    throw new Error("Zitadel settings are not properly configured");
  }
  const endTime = Date.now();
  logMessage.info(`Latency in retrieving Zitadel settings: ${endTime - startTime}`);
  return {
    zitadelAdministrationKey,
    zitadelProvider,
  };
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
