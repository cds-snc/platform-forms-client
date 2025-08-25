import { logMessage } from "@lib/logger";
import { getRedisInstance } from "@lib/integration/redisConnector";

export interface FailureTrackerOptions {
  // Severity 2 alert thresholds
  failureWindow?: number; // Time window for failures in minutes (default: 5)
  failureThreshold?: number; // Failures needed for Severity 2 alert (default: 5)
  severity2Cooldown?: number; // Cooldown after Severity 2 alert in minutes (default: 15)

  // Severity 1 alert thresholds
  alertWindow?: number; // Time window for Severity 2 alerts in minutes (default: 60)
  alertThreshold?: number; // Severity 2 alerts needed for Severity 1 (default: 3)
}

const DEFAULT_OPTIONS: Required<FailureTrackerOptions> = {
  failureWindow: 5, // 5 minutes
  failureThreshold: 5, // 5 failures
  severity2Cooldown: 15, // 15 minutes
  alertWindow: 60, // 1 hour
  alertThreshold: 3, // 3 severity 2 alerts
};

/**
 * Record a failure and check for alert conditions
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

    // Keys for tracking failures
    const failureKey = `failures:${serviceName}`;

    // Record the failure with current timestamp
    await redis.zadd(failureKey, now, `f_${now}`);

    // Clean up old failures outside the window
    const failureWindowMs = config.failureWindow * 60 * 1000;
    const failureWindowStart = now - failureWindowMs;
    await redis.zremrangebyscore(failureKey, "-inf", failureWindowStart);

    // Set expiry for automatic cleanup (2x window for safety)
    await redis.expire(failureKey, config.failureWindow * 60 * 2);

    // Check failure count in current window
    const failureCount = await redis.zcount(failureKey, failureWindowStart, "+inf");

    // If we've hit the failure threshold, check cooldown and generate Severity 2 alert
    if (failureCount >= config.failureThreshold) {
      await checkAndGenerateSeverity2Alert(serviceName, failureCount, config, error);
    }
  } catch (redisError) {
    logMessage.error(`FailureTracker: Redis error for ${serviceName}`, redisError);
  }
};

/**
 * Check cooldown period and generate Severity 2 alert if appropriate
 */
const checkAndGenerateSeverity2Alert = async (
  serviceName: string,
  failureCount: number,
  config: Required<FailureTrackerOptions>,
  error: unknown
): Promise<void> => {
  try {
    const redis = await getRedisInstance();
    const now = Date.now();
    const lastAlertKey = `last_alert:${serviceName}`;

    // Check when the last Severity 2 alert was sent
    const lastAlertTime = await redis.get(lastAlertKey);

    if (lastAlertTime) {
      const timeSinceLastAlert = now - parseInt(lastAlertTime, 10);
      const cooldownMs = config.severity2Cooldown * 60 * 1000;

      if (timeSinceLastAlert < cooldownMs) {
        // Still in cooldown period, don't generate alert
        return;
      }
    }

    // Generate Severity 2 alert and record the time
    await generateAlert(serviceName, failureCount, config, error);

    // Update last alert time and set expiry
    await redis.set(lastAlertKey, now.toString());
    await redis.expire(lastAlertKey, config.severity2Cooldown * 60 * 2); // 2x cooldown for safety
  } catch (redisError) {
    logMessage.error(`FailureTracker: Cooldown check error for ${serviceName}`, redisError);
  }
};

/**
 * Generate a Severity 2 alert and check for Severity 1 escalation
 */
const generateAlert = async (
  serviceName: string,
  failureCount: number,
  config: Required<FailureTrackerOptions>,
  error: unknown
): Promise<void> => {
  try {
    const redis = await getRedisInstance();
    const now = Date.now();
    const alertKey = `severity2:${serviceName}`;

    // Set up time windows
    const alertWindowMs = config.alertWindow * 60 * 1000;
    const alertWindowStart = now - alertWindowMs;

    // Record this Severity 2 alert first
    await redis.zadd(alertKey, now, `alert_${now}`);

    // Clean up old alerts outside the alert window
    await redis.zremrangebyscore(alertKey, "-inf", alertWindowStart);

    // Set expiry for automatic cleanup
    await redis.expire(alertKey, config.alertWindow * 60 * 2);

    // Check if we need to escalate to Severity 1 first
    const alertCount = await redis.zcount(alertKey, alertWindowStart, "+inf");

    if (alertCount >= config.alertThreshold) {
      // Generate Severity 1 alert instead of Severity 2
      logMessage.error(
        `🔴 SEVERITY 1 ALERT: ${serviceName} service critical failure pattern - ${alertCount} Severity 2 alerts in ${config.alertWindow} minutes`
      );
      return; // Don't log Severity 2 when escalating to Severity 1
    }

    // Log Severity 2 alert (only if not escalating to Severity 1)
    const errorMessage = error instanceof Error ? error.message : String(error);
    logMessage.error(
      `🟡 SEVERITY 2 ALERT: ${serviceName} service failures - ${failureCount} failures in ${config.failureWindow} minutes. Latest error: ${errorMessage}`
    );
  } catch (redisError) {
    logMessage.error(`FailureTracker: Alert generation error for ${serviceName}`, redisError);
  }
};

/**
 * Get current failure metrics for monitoring/debugging
 */
export const getFailureMetrics = async (
  serviceName: string,
  options: FailureTrackerOptions = {}
): Promise<{
  currentFailures: number;
  currentSeverity2Alerts: number;
  service: string;
}> => {
  const config = { ...DEFAULT_OPTIONS, ...options };

  try {
    const redis = await getRedisInstance();
    const now = Date.now();

    const failureKey = `failures:${serviceName}`;
    const alertKey = `severity2:${serviceName}`;

    const failureWindowStart = now - config.failureWindow * 60 * 1000;
    const alertWindowStart = now - config.alertWindow * 60 * 1000;

    const [currentFailures, currentSeverity2Alerts] = await Promise.all([
      redis.zcount(failureKey, failureWindowStart, "+inf"),
      redis.zcount(alertKey, alertWindowStart, "+inf"),
    ]);

    return {
      currentFailures,
      currentSeverity2Alerts,
      service: serviceName,
    };
  } catch (redisError) {
    logMessage.error(`FailureTracker: Metrics error for ${serviceName}`, redisError);
    return {
      currentFailures: 0,
      currentSeverity2Alerts: 0,
      service: serviceName,
    };
  }
};

/**
 * Clear all failure data for a service (for testing/manual reset)
 */
export const clearFailures = async (serviceName: string): Promise<void> => {
  try {
    const redis = await getRedisInstance();
    await Promise.all([
      redis.del(`failures:${serviceName}`),
      redis.del(`severity2:${serviceName}`),
    ]);
  } catch (redisError) {
    logMessage.error(`FailureTracker: Clear error for ${serviceName}`, redisError);
  }
};
