import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the dependencies first
vi.mock('../../integration/redisConnector');
vi.mock('../../logger');

// Import after mocking
import { recordFailure, getFailureMetrics, clearFailures } from './failureTracker';
import { getRedisInstance } from '../../integration/redisConnector';
import { logMessage } from '../../logger';

describe('FailureTracker (Simplified)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRedis: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Setup mock Redis instance
    mockRedis = {
      zadd: vi.fn().mockResolvedValue(1),
      zcard: vi.fn().mockResolvedValue(0),
      zcount: vi.fn().mockResolvedValue(0),
      zremrangebyscore: vi.fn().mockResolvedValue(0),
      expire: vi.fn().mockResolvedValue(1),
      del: vi.fn().mockResolvedValue(1),
      get: vi.fn().mockResolvedValue(null), // For cooldown checking
      set: vi.fn().mockResolvedValue('OK'), // For setting last alert time
    };

    // Mock getRedisInstance to return our mock
    vi.mocked(getRedisInstance).mockResolvedValue(mockRedis as never);
  });

  describe('recordFailure', () => {
    it('should record a failure in Redis', async () => {
      await recordFailure('hCaptcha', new Error('Test error'));

      expect(mockRedis.zadd).toHaveBeenCalledWith(
        'failures:hCaptcha',
        expect.any(Number),
        expect.stringMatching(/^f_\d+$/)
      );
    });

    it('should clean up old failures', async () => {
      await recordFailure('hCaptcha', new Error('Test error'));

      expect(mockRedis.zremrangebyscore).toHaveBeenCalledWith(
        'failures:hCaptcha',
        '-inf',
        expect.any(Number)
      );
    });

    it('should set expiry for automatic cleanup', async () => {
      await recordFailure('hCaptcha', new Error('Test error'));

      expect(mockRedis.expire).toHaveBeenCalledWith(
        'failures:hCaptcha',
        600 // 5 minutes * 60 seconds * 2
      );
    });

    it('should generate Severity 2 alert when threshold is reached', async () => {
      // Mock 5 failures in the window (default threshold)
      mockRedis.zcount
        .mockResolvedValueOnce(5) // Initial failure count check
        .mockResolvedValueOnce(1); // Alert count check (below Severity 1 threshold)

      await recordFailure('hCaptcha', new Error('Test error'));

      expect(logMessage.error).toHaveBeenCalledWith(
        expect.stringContaining('SEVERITY 2 ALERT: hCaptcha service failures - 5 failures in 5 minutes. Latest error: Test error')
      );
    });

    it('should generate Severity 1 alert when alert threshold is reached', async () => {
      // Mock failures triggering Severity 2, then mock 3 severity 2 alerts in window
      mockRedis.zcount
        .mockResolvedValueOnce(5) // Initial failure count check
        .mockResolvedValueOnce(3); // Alert count check

      await recordFailure('hCaptcha', new Error('Test error'));

      expect(logMessage.error).toHaveBeenCalledWith(
        expect.stringContaining('SEVERITY 1 ALERT: hCaptcha service critical failure pattern - 3 Severity 2 alerts in 60 minutes')
      );
    });

    it('should respect custom thresholds', async () => {
      // Mock 3 failures to hit custom threshold, but only 1 alert (below Severity 1 threshold)
      mockRedis.zcount
        .mockResolvedValueOnce(3) // Just hit the custom threshold
        .mockResolvedValueOnce(1); // Alert count below Severity 1 threshold

      await recordFailure('hCaptcha', new Error('Test error'), {
        failureThreshold: 3,
        failureWindow: 10,
      });

      expect(logMessage.error).toHaveBeenCalledWith(
        expect.stringContaining('SEVERITY 2 ALERT: hCaptcha service failures - 3 failures in 10 minutes. Latest error: Test error')
      );
    });
  });

  describe('getFailureMetrics', () => {
    it('should return current failure metrics', async () => {
      mockRedis.zcount
        .mockResolvedValueOnce(4) // Current failures
        .mockResolvedValueOnce(2); // Current severity 2 alerts

      const metrics = await getFailureMetrics('hCaptcha');

      expect(metrics).toEqual({
        currentFailures: 4,
        currentSeverity2Alerts: 2,
        service: 'hCaptcha',
      });
    });

    it('should return zero metrics when no data exists', async () => {
      mockRedis.zcount
        .mockResolvedValueOnce(0) // No failures
        .mockResolvedValueOnce(0); // No alerts

      const metrics = await getFailureMetrics('hCaptcha');

      expect(metrics).toEqual({
        currentFailures: 0,
        currentSeverity2Alerts: 0,
        service: 'hCaptcha',
      });
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.zcount.mockRejectedValue(new Error('Redis connection failed'));

      const metrics = await getFailureMetrics('hCaptcha');

      expect(metrics).toEqual({
        currentFailures: 0,
        currentSeverity2Alerts: 0,
        service: 'hCaptcha',
      });

      expect(logMessage.error).toHaveBeenCalledWith(
        'FailureTracker: Metrics error for hCaptcha',
        expect.any(Error)
      );
    });
  });

  describe('clearFailures', () => {
    it('should clear all failure data for a service', async () => {
      await clearFailures('hCaptcha');

      expect(mockRedis.del).toHaveBeenCalledWith('failures:hCaptcha');
      expect(mockRedis.del).toHaveBeenCalledWith('severity2:hCaptcha');
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis connection failed'));

      // Should not throw
      await expect(clearFailures('hCaptcha')).resolves.not.toThrow();

      expect(logMessage.error).toHaveBeenCalledWith(
        'FailureTracker: Clear error for hCaptcha',
        expect.any(Error)
      );
    });
  });

  describe('error handling', () => {
    it('should handle Redis errors gracefully in recordFailure', async () => {
      mockRedis.zadd.mockRejectedValue(new Error('Redis connection failed'));

      // Should not throw
      await expect(recordFailure('hCaptcha', new Error('Test error'))).resolves.not.toThrow();
      
      expect(logMessage.error).toHaveBeenCalledWith(
        'FailureTracker: Redis error for hCaptcha',
        expect.any(Error)
      );
    });
  });

  describe('cooldown functionality', () => {
    it('should not generate Severity 2 alert when within cooldown period', async () => {
      // Mock that an alert was sent 5 minutes ago (5 * 60 * 1000 ms)
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      mockRedis.get.mockResolvedValue(fiveMinutesAgo.toString());
      
      // Mock 5 failures to trigger threshold
      mockRedis.zcount.mockResolvedValue(5);

      await recordFailure('hCaptcha', new Error('Test error'), {
        severity2Cooldown: 15, // 15 minute cooldown
      });

      // Should not generate Severity 2 alert due to cooldown
      expect(logMessage.error).not.toHaveBeenCalledWith(
        expect.stringContaining('SEVERITY 2 ALERT'),
        expect.any(Object)
      );
    });

    it('should generate Severity 2 alert when cooldown period has expired', async () => {
      // Mock that an alert was sent 20 minutes ago (beyond 15 minute cooldown)
      const twentyMinutesAgo = Date.now() - (20 * 60 * 1000);
      mockRedis.get.mockResolvedValue(twentyMinutesAgo.toString());
      
      // Mock 5 failures to trigger threshold, but only 1 alert (below Severity 1 threshold)
      mockRedis.zcount
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(1); // Alert count below Severity 1 threshold

      await recordFailure('hCaptcha', new Error('Test error'), {
        severity2Cooldown: 15, // 15 minute cooldown
      });

      // Should generate Severity 2 alert since cooldown has expired
      expect(logMessage.error).toHaveBeenCalledWith(
        expect.stringContaining('SEVERITY 2 ALERT: hCaptcha service failures - 5 failures in 5 minutes. Latest error: Test error')
      );
    });

    it('should generate Severity 2 alert when no previous alert exists', async () => {
      // Mock no previous alert
      mockRedis.get.mockResolvedValue(null);
      
      // Mock 5 failures to trigger threshold, but only 1 alert (below Severity 1 threshold)
      mockRedis.zcount
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(1); // Alert count below Severity 1 threshold

      await recordFailure('hCaptcha', new Error('Test error'), {
        severity2Cooldown: 15,
      });

      // Should generate Severity 2 alert since no previous alert exists
      expect(logMessage.error).toHaveBeenCalledWith(
        expect.stringContaining('SEVERITY 2 ALERT: hCaptcha service failures - 5 failures in 5 minutes. Latest error: Test error')
      );
    });
  });
});
