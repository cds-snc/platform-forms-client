import Redis from "ioredis";
import {
  CrudTemplateResponse,
  CrudOrganisationResponse,
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
    | CrudOrganisationResponse
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
  Organisations
*/

const organisationIDCheck = async (
  organisationID: string
): Promise<CrudOrganisationResponse | null> => {
  return checkValue(`organisations:${organisationID}`);
};

const organisationIDPut = async (
  organisationID: string,
  organisation: CrudOrganisationResponse
): Promise<void> => {
  return modifyValue(`organisations:${organisationID}`, organisation);
};

const organisationIDDelete = async (organisationID: string): Promise<void> => {
  return deleteValue(`organisations:${organisationID}`);
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

export const organisationCache = {
  cacheAvailable,
  organisationID: {
    check: organisationIDCheck,
    set: organisationIDPut,
    invalidate: organisationIDDelete,
  },
};
