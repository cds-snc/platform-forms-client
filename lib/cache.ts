import { LambdaResponse, FormRecord, PublicFormRecord, Organization } from "@lib/types";
import { logMessage } from "@lib/logger";
import { getRedisInstance } from "./integration/redisConnector";

// If NODE_ENV is in test mode (Jest Tests) do not use the cache
const cacheAvailable: boolean =
  process.env.REDIS_URL && process.env.NODE_ENV !== "test" ? true : false;

// Return a random number between 30 and 60
const randomCacheExpiry = () => Math.floor(Math.random() * 30 + 30);

const checkValue = async (checkParameter: string) => {
  if (cacheAvailable) {
    try {
      const redis = await getRedisInstance();
      const value = await redis.get(checkParameter);
      if (value) {
        logMessage.debug(`Using Cached value for ${checkParameter}`);
        return JSON.parse(value);
      }
    } catch (e) {
      logMessage.error(e as Error);
      throw new Error("Could not connect to cache");
    }
  }

  return null;
};

const deleteValue = async (deleteParameter: string) => {
  if (!cacheAvailable) return;
  try {
    const redis = await getRedisInstance();

    redis.del(deleteParameter);
    logMessage.debug(`Deleting Cached value for ${deleteParameter}`);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};

const modifyValue = async (
  modifyParameter: string,
  template:
    | LambdaResponse<Omit<FormRecord, "bearerToken">>
    | (PublicFormRecord | undefined)[]
    | LambdaResponse<Organization>
) => {
  if (!cacheAvailable) return;
  try {
    const redis = await getRedisInstance();

    redis.setex(modifyParameter, randomCacheExpiry(), JSON.stringify(template));
    logMessage.debug(`Updating Cached value for ${modifyParameter}`);
  } catch (e) {
    logMessage.error(e as Error);
    throw new Error("Could not connect to cache");
  }
};

/*
  Forms
*/

const formIDCheck = async (
  formID: number
): Promise<LambdaResponse<Omit<FormRecord, "bearerToken">> | null> => {
  return checkValue(`form:config:${formID}`);
};

const formIDDelete = async (formID: number): Promise<void> => {
  return deleteValue(`form:config:${formID}`);
};

const formIDPut = async (
  formID: number,
  template: LambdaResponse<Omit<FormRecord, "bearerToken">>
): Promise<void> => {
  return modifyValue(`form:config:${formID}`, template);
};

const publishedCheck = async (): Promise<(PublicFormRecord | undefined)[] | null> => {
  return checkValue(`form:published`);
};

const publishedPut = async (templates: (PublicFormRecord | undefined)[]): Promise<void> => {
  return modifyValue(`form:published`, templates);
};

const unpublishedCheck = async (): Promise<
  (LambdaResponse<Omit<FormRecord, "bearerToken">> | undefined)[] | null
> => {
  return checkValue(`form:unpublished`);
};

const unpublishedPut = async (templates: (PublicFormRecord | undefined)[]): Promise<void> => {
  return modifyValue(`form:unpublished`, templates);
};

/*
  Organizations
*/

const organizationIDCheck = async (
  organizationID: string
): Promise<LambdaResponse<Organization> | null> => {
  return checkValue(`organizations:${organizationID}`);
};

const organizationIDPut = async (
  organizationID: string,
  organization: LambdaResponse<Organization>
): Promise<void> => {
  return modifyValue(`organizations:${organizationID}`, organization);
};

const organizationIDDelete = async (organizationID: string): Promise<void> => {
  return deleteValue(`organizations:${organizationID}`);
};

export const formCache = {
  cacheAvailable,
  formID: {
    check: formIDCheck,
    set: formIDPut,
    invalidate: formIDDelete,
  },
  published: {
    check: publishedCheck,
    set: publishedPut,
  },
  unpublished: {
    check: unpublishedCheck,
    set: unpublishedPut,
  },
};

export const organizationCache = {
  cacheAvailable,
  organizationID: {
    check: organizationIDCheck,
    set: organizationIDPut,
    invalidate: organizationIDDelete,
  },
};
