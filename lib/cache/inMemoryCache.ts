export class InMemoryCache {
  private cache: Map<string, { value: unknown; expireAt: number }>;
  private defaultTTL: number;
  private maxSize: number;
  constructor(maxSize = 200, defaultTTL = 60) {
    // default TTL is 60 seconds in milliseconds
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    this.maxSize = maxSize;
  }

  private staticSize() {
    while (this.cache.size >= this.maxSize) {
      const iterator = this.cache.entries();
      this.cache.delete(iterator.next().value[0]);
    }
  }

  public set(key: string, value: unknown, ttl = this.defaultTTL) {
    const now = Date.now();
    // convert ttl to milliseconds
    const expireAt = now + ttl * 1000;

    this.staticSize();

    this.cache.set(key, { value, expireAt });

    setTimeout(() => {
      const val = this.cache.get(key);
      if (val && val.expireAt <= Date.now()) {
        this.cache.delete(key);
      }
    }, ttl);
  }

  public get(key: string) {
    const now = Date.now();
    const cachedItem = this.cache.get(key);

    if (cachedItem && cachedItem.expireAt > now) {
      return cachedItem.value;
    } else {
      this.cache.delete(key);
      return null;
    }
  }

  public clear() {
    this.cache.clear();
  }

  public cleanup() {
    const now = Date.now();
    for (const key in this.cache) {
      const cachedItem = this.cache.get(key);
      if (cachedItem && cachedItem.expireAt <= now) {
        this.cache.delete(key);
      }
    }
  }
}
