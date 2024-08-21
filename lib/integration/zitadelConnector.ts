import {
  createManagementClient,
  createServiceAccountInterceptor,
  ManagementServiceClient,
} from "@zitadel/node/api";

import { checkOne } from "@lib/cache/flags";
import { ServiceAccount } from "@zitadel/node/credentials";

let zitadelClient: ManagementServiceClient | null = null;

const getZitadelSettings = async () => {
  if (!process.env.ZITADEL_PROVIDER) throw new Error("No value set for Zitadel Provider");

  if (!process.env.ZITADEL_ADMINISTRATION_KEY)
    throw new Error("Zitadel Adminstration Key is not set");

  return {
    zitadelAdministrationKey: process.env.ZITADEL_ADMINISTRATION_KEY,
    zitadelProvider: process.env.ZITADEL_PROVIDER,
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
