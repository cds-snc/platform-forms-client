import Redis from "ioredis";
import { CrudTemplateResponse, PublicFormSchemaProperties } from "@lib/types";

const cacheAvailable: boolean = process.env.REDIS_URL ? true : false;

// Return a random number between 30 and 60
const randomCacheExpiry = () => Math.floor(Math.random() * 30 + 30);

const getRedisInstance = async (): Promise<Redis.Redis | null> => {
  if (cacheAvailable) {
    // If Redis is configured use it for the formID cache
    return new Redis(6379, process.env.REDIS_URL);
  }
  return null;
};

let redisConnection: Redis.Redis | null = null;
getRedisInstance().then((instance) => (redisConnection = instance));

const checkConnection = async () => {
  if (!cacheAvailable) {
    return null;
  } else if (!redisConnection) {
    return await getRedisInstance().then((instance) => {
      redisConnection = instance;
      return instance;
    });
  } else {
    return redisConnection;
  }
};

const formIDCheck = async (formID: string): Promise<CrudTemplateResponse | null> => {
  return await checkConnection().then(async (redis) => {
    if (redis) {
      const value = await redis.get(`form:config:${formID}`);
      return value ? JSON.parse(value) : null;
    }
    return null;
  });
};

const formIDDelete = async (formID: string): Promise<void> => {
  return await checkConnection().then(async (redis) => {
    if (redis) {
      await redis.del(`form:config:${formID}`);
    }
  });
};

const formIDPut = async (formID: string, template: CrudTemplateResponse): Promise<void> => {
  return await checkConnection().then(async (redis) => {
    if (redis) {
      await redis.setex(`form:config:${formID}`, randomCacheExpiry(), JSON.stringify(template));
    }
  });
};

const publishedCheck = async (): Promise<(PublicFormSchemaProperties | undefined)[] | null> => {
  return await checkConnection().then(async (redis) => {
    if (redis) {
      const value = await redis.get(`form:published`);
      return value ? JSON.parse(value) : null;
    }
    return null;
  });
};

const publishedPut = async (
  templates: (PublicFormSchemaProperties | undefined)[]
): Promise<void> => {
  return await checkConnection().then(async (redis) => {
    if (redis) {
      await redis.setex(`form:published`, randomCacheExpiry(), JSON.stringify(templates));
    }
  });
};

const unpublishedCheck = async (): Promise<(PublicFormSchemaProperties | undefined)[] | null> => {
  return await checkConnection().then(async (redis) => {
    if (redis) {
      const value = await redis.get(`form:published`);
      return value ? JSON.parse(value) : null;
    }
    return null;
  });
};

const unpublishedPut = async (
  templates: (PublicFormSchemaProperties | undefined)[]
): Promise<void> => {
  return await checkConnection().then(async (redis) => {
    if (redis) {
      await redis.setex(`form:published`, randomCacheExpiry(), JSON.stringify(templates));
    }
  });
};

export default {
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
