import { createManagementClient, ManagementServiceClient } from "@zitadel/node/dist/api";
import { ServiceAccount } from "@zitadel/node/dist/credentials";
import type { AuthenticationOptions } from "@zitadel/node/dist/credentials/service-account";
import type { CallOptions, ClientMiddleware, ClientMiddlewareCall } from "nice-grpc";
import { Metadata } from "nice-grpc-common";

let zitadelClient: ManagementServiceClient;
let initializtionPromise: Promise<void> | null = null;

const getZitadelSettings = async () => {
  if (!process.env.ZITADEL_PROVIDER) throw new Error("No value set for Zitadel Provider");

  if (!process.env.ZITADEL_ADMINISTRATION_KEY)
    throw new Error("Zitadel Adminstration Key is not set");

  return {
    zitadelAdministrationKey: process.env.ZITADEL_ADMINISTRATION_KEY,
    zitadelProvider: process.env.ZITADEL_PROVIDER,
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
