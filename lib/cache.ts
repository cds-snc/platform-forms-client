import Redis from "ioredis";
import {
  CrudTemplateResponse,
  CrudOrganizationResponse,
  PublicFormSchemaProperties,
} from "@lib/types";
import { logMessage } from "./logger";

const cacheAvailable: boolean = process.env.REDIS_URL ? true : false;

// Return a random number between 30 and 60
const randomCacheExpiry = () => Math.floor(Math.random() * 30 + 30);

const getRedisInstance = async (): Promise<Redis.Redis | null> => {
  if (cacheAvailable) {
    // If Redis is configured use it for the formID cache
    return new Redis(process.env.REDIS_URL);
  }
  return null;
};

let redisConnection: Redis.Redis | null = null;
getRedisInstance().then((instance) => (redisConnection = instance));

const checkConnection = async () => {
  if (!cacheAvailable) {
    return null;
  } else if (!redisConnection) {
    redisConnection = await getRedisInstance();
    return redisConnection;
  } else {
    return redisConnection;
  }
};

const checkValue = async (checkParameter: string) => {
  const redis = await checkConnection();
  if (redis) {
    const value = await redis.get(checkParameter);
    if (value) {
      logMessage.info(`Using Cached value for ${checkParameter}`);
      return JSON.parse(value);
    }
  }
  return null;
};

const deleteValue = async (deleteParameter: string) => {
  const redis = await checkConnection();
  if (redis) {
    redis.del(deleteParameter);
    logMessage.info(`Deleting Cached value for ${deleteParameter}`);
  }
};

const modifyValue = async (
  modifyParameter: string,
  template:
    | CrudTemplateResponse
    | (PublicFormSchemaProperties | undefined)[]
    | CrudOrganizationResponse
) => {
  const redis = await checkConnection();
  if (redis) {
    redis.setex(modifyParameter, randomCacheExpiry(), JSON.stringify(template));
    logMessage.info(`Updating Cached value for ${modifyParameter}`);
  }
};

/*
  Forms
*/

const formIDCheck = async (formID: string): Promise<CrudTemplateResponse | null> => {
  return checkValue(`form:config:${formID}`);
};

const formIDDelete = async (formID: string): Promise<void> => {
  return deleteValue(`form:config:${formID}`);
};

const formIDPut = async (formID: string, template: CrudTemplateResponse): Promise<void> => {
  return modifyValue(`form:config:${formID}`, template);
};

const publishedCheck = async (): Promise<(PublicFormSchemaProperties | undefined)[] | null> => {
  return checkValue(`form:published`);
};

const publishedPut = async (
  templates: (PublicFormSchemaProperties | undefined)[]
): Promise<void> => {
  return modifyValue(`form:published`, templates);
};

const unpublishedCheck = async (): Promise<(PublicFormSchemaProperties | undefined)[] | null> => {
  return checkValue(`form:unpublished`);
};

const unpublishedPut = async (
  templates: (PublicFormSchemaProperties | undefined)[]
): Promise<void> => {
  return modifyValue(`form:unpublished`, templates);
};

/*
  Organizations
*/

const organizationIDCheck = async (
  organizationID: string
): Promise<CrudOrganizationResponse | null> => {
  return checkValue(`organizations:${organizationID}`);
};

const organizationIDPut = async (
  organizationID: string,
  organization: CrudOrganizationResponse
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
