import { logMessage } from "@lib/logger";
import { getRedisInstance } from "@lib/integration/redisConnector";

export interface FailureTrackerOptions {
  keyPrefix?: string; // Redis key prefix (default: 'api_failures')
  windowSizeMs?: number; // Time window in milliseconds (default: 5 minutes)
  maxFailures?: number; // Max failures before alerting (default: 5)
  alertCooldownMs?: number; // Cooldown between alerts (default: 15 minutes)
}

export interface FailureMetrics {
  totalFailures: number;
  windowFailures: number;
  firstFailureTime: number | null;
  lastFailureTime: number | null;
  alertCount: number;
  lastAlertTime: number | null;
}

const DEFAULT_OPTIONS: Required<FailureTrackerOptions> = {
  keyPrefix: "failure_tracker",
  windowSizeMs: 5 * 60 * 1000, // 5 minutes
  maxFailures: 5,
  alertCooldownMs: 15 * 60 * 1000, // 15 minutes
};

/**
 * Record a failure for the specified service
 */
export const recordFailure = async (
  serviceName: string,
  error: unknown,
  options: FailureTrackerOptions = {}
): Promise<void> => {
  const config = { ...DEFAULT_OPTIONS, ...options };

  try {
    const redis = await getRedisInstance();
    const now = Date.now();
    const failureKey = `${config.keyPrefix}:${serviceName}:failures`;
    const metaKey = `${config.keyPrefix}:${serviceName}:meta`;

    // Add failure timestamp to sorted set (score = timestamp)
    await redis.zadd(failureKey, now, `failure_${now}_${Math.random()}`);

    // Set expiry on failure key (cleanup old data)
    await redis.expire(failureKey, Math.ceil(config.windowSizeMs / 1000) * 2);

    // Update metadata
    const failureData = {
      lastFailure: now.toString(),
      lastError: serializeError(error),
    };

    await redis.hmset(metaKey, failureData);
    await redis.expire(metaKey, Math.ceil(config.windowSizeMs / 1000) * 2);

    // Check if we should alert
    const metrics = await getMetrics(serviceName, options);
    await checkAndAlert(serviceName, metrics, error, options);
  } catch (redisError) {
    logMessage.error(
      `FailureTracker: Redis error while recording failure for ${serviceName}`,
      redisError
    );
  }
};

/**
 * Get failure metrics for a service
 */
export const getMetrics = async (
  serviceName: string,
  options: FailureTrackerOptions = {}
): Promise<FailureMetrics> => {
  const config = { ...DEFAULT_OPTIONS, ...options };

  try {
    const redis = await getRedisInstance();
    const now = Date.now();
    const windowStart = now - config.windowSizeMs;

    const failureKey = `${config.keyPrefix}:${serviceName}:failures`;
    const metaKey = `${config.keyPrefix}:${serviceName}:meta`;
    const alertKey = `${config.keyPrefix}:${serviceName}:alert_count`;

    // Clean up old failures outside the window
    await redis.zremrangebyscore(failureKey, "-inf", windowStart);

    // Get failure counts
    const [totalFailures, windowFailures, metadata, alertCount] = await Promise.all([
      redis.zcard(failureKey),
      redis.zcount(failureKey, windowStart, "+inf"),
      redis.hmget(metaKey, "lastFailure", "lastAlert"),
      redis.get(alertKey).then((count) => parseInt(count || "0", 10)),
    ]);

    // Get first failure time in window
    const firstFailureInWindow = await redis.zrange(failureKey, 0, 0, "WITHSCORES");
    const firstFailureTime =
      firstFailureInWindow.length > 1 ? parseInt(firstFailureInWindow[1], 10) : null;

    return {
      totalFailures,
      windowFailures,
      firstFailureTime,
      lastFailureTime: metadata[0] ? parseInt(metadata[0], 10) : null,
      alertCount,
      lastAlertTime: metadata[1] ? parseInt(metadata[1], 10) : null,
    };
  } catch (redisError) {
    logMessage.error(`FailureTracker: Redis error getting metrics for ${serviceName}:`, redisError);
    return {
      totalFailures: 0,
      windowFailures: 0,
      firstFailureTime: null,
      lastFailureTime: null,
      alertCount: 0,
      lastAlertTime: null,
    };
  }
};

/**
 * Clear all failure data for a service (useful for testing or manual resets)
 */
export const clearFailures = async (
  serviceName: string,
  options: FailureTrackerOptions = {}
): Promise<void> => {
  const config = { ...DEFAULT_OPTIONS, ...options };

  try {
    const redis = await getRedisInstance();
    const failureKey = `${config.keyPrefix}:${serviceName}:failures`;
    const metaKey = `${config.keyPrefix}:${serviceName}:meta`;
    const alertKey = `${config.keyPrefix}:${serviceName}:alert_count`;

    await Promise.all([redis.del(failureKey), redis.del(metaKey), redis.del(alertKey)]);

    logMessage.info(`FailureTracker: Cleared all failure data for ${serviceName}`);
  } catch (redisError) {
    logMessage.error(
      `FailureTracker: Redis error clearing failures for ${serviceName}:`,
      redisError
    );
  }
};

/**
 * Check if we should alert and send alert if needed
 */
const checkAndAlert = async (
  serviceName: string,
  metrics: FailureMetrics,
  error: unknown,
  options: FailureTrackerOptions = {}
): Promise<void> => {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // Check if we've exceeded failure threshold in the current window
  if (metrics.windowFailures < config.maxFailures) {
    return;
  }

  const now = Date.now();
  const timeSinceLastAlert = metrics.lastAlertTime ? now - metrics.lastAlertTime : Infinity;

  if (timeSinceLastAlert < config.alertCooldownMs) {
    return; // Still in cooldown period
  }

  try {
    const redis = await getRedisInstance();

    // Record alert
    const alertKey = `${config.keyPrefix}:${serviceName}:alert_count`;
    const metaKey = `${config.keyPrefix}:${serviceName}:meta`;

    await redis.incr(alertKey);
    await redis.hset(metaKey, "lastAlert", now.toString());
    await redis.expire(alertKey, Math.ceil(config.alertCooldownMs / 1000));

    // Send alert
    await sendAlert(serviceName, metrics, error);
  } catch (redisError) {
    logMessage.error(`FailureTracker: Redis error recording alert for ${serviceName}:`, redisError);
  }
};

/**
 * Send alert about high failure rate
 */
const sendAlert = async (
  serviceName: string,
  metrics: FailureMetrics,
  error: Error | unknown
): Promise<void> => {
  const alertMessage = `🚨 High failure rate detected for ${serviceName}
    - Window failures: ${metrics.windowFailures}
    - Total failures: ${metrics.totalFailures}
    - Alert count: ${metrics.alertCount + 1}
    - Latest error: ${error instanceof Error ? error.name : "Unknown"}: ${error instanceof Error ? error.message : String(error)}
    - First failure: ${
      metrics.firstFailureTime ? new Date(metrics.firstFailureTime).toISOString() : "Unknown"
    }
    - Last failure: ${
      metrics.lastFailureTime ? new Date(metrics.lastFailureTime).toISOString() : "Unknown"
    }`;

  logMessage.error(alertMessage);
};

/**
 * Serialize error object for storage
 */
const serializeError = (error: unknown): string => {
  if (error instanceof Error) {
    return JSON.stringify({
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  }
  return String(error);
};
