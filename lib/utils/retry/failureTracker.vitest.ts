import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the dependencies first
vi.mock('../../integration/redisConnector');
vi.mock('../../logger');

// Import after mocking
import { recordFailure, getMetrics, clearFailures } from './failureTracker';
import { getRedisInstance } from '../../integration/redisConnector';
import { logMessage } from '../../logger';

describe('FailureTracker', () => {
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
      hmget: vi.fn().mockResolvedValue([null, null]),
      hmset: vi.fn().mockResolvedValue('OK'),
      hset: vi.fn().mockResolvedValue(1),
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue('OK'),
      incr: vi.fn().mockResolvedValue(1),
      zrange: vi.fn().mockResolvedValue([]),
      del: vi.fn().mockResolvedValue(1),
    };

    // Mock getRedisInstance to return our mock
    vi.mocked(getRedisInstance).mockResolvedValue(mockRedis as never);
  });

  describe('recordFailure', () => {
    it('should record a failure in Redis', async () => {
      await recordFailure('test-service', new Error('Test error'));

      expect(mockRedis.zadd).toHaveBeenCalledWith(
        'api_failures:test-service:failures',
        expect.any(Number),
        expect.stringMatching(/^failure_\d+_[\d.]+$/)
      );
    });

    it('should clean up old failures when recording new ones', async () => {
      await recordFailure('test-service', new Error('Test error'));

      expect(mockRedis.expire).toHaveBeenCalledWith(
        'api_failures:test-service:failures',
        expect.any(Number)
      );
    });

    it('should log and track alert when failure threshold is exceeded', async () => {
      // Mock Redis to return threshold-exceeding values
      mockRedis.zcard.mockResolvedValue(6); // Exceeds default threshold of 5
      mockRedis.zcount.mockResolvedValue(6);
      mockRedis.hmget.mockResolvedValue([null, null]); // No previous alert
      mockRedis.incr.mockResolvedValue(1);

      await recordFailure('test-service', new Error('Test error'));

      expect(logMessage.error).toHaveBeenCalledWith(
        expect.stringContaining('High failure rate detected for test-service')
      );
    });

    it('should not alert again within cooldown period', async () => {
      const recentAlertTime = Date.now() - 5 * 60 * 1000; // 5 minutes ago
      
      mockRedis.zcard.mockResolvedValue(6);
      mockRedis.zcount.mockResolvedValue(6);
      mockRedis.hmget.mockResolvedValue([null, recentAlertTime.toString()]);

      await recordFailure('test-service', new Error('Test error'));

      expect(logMessage.error).not.toHaveBeenCalled();
    });

    it('should respect custom thresholds', async () => {
      mockRedis.zcard.mockResolvedValue(8);
      mockRedis.zcount.mockResolvedValue(8);
      mockRedis.hmget.mockResolvedValue([null, null]);
      mockRedis.incr.mockResolvedValue(1);

      await recordFailure('test-service', new Error('Test error'), {}, {
        maxFailures: 7,
        windowSizeMs: 30 * 60 * 1000
      });

      expect(logMessage.error).toHaveBeenCalledWith(
        expect.stringContaining('High failure rate detected for test-service')
      );
    });
  });

  describe('getMetrics', () => {
    it('should return failure metrics', async () => {
      mockRedis.zcard.mockResolvedValue(5);
      mockRedis.zcount.mockResolvedValue(3);
      mockRedis.hmget.mockResolvedValue([Date.now().toString(), null]);
      mockRedis.get.mockResolvedValue('2');
      mockRedis.zrange.mockResolvedValue(['failure_123', Date.now().toString()]);

      const metrics = await getMetrics('test-service');

      expect(metrics).toEqual({
        totalFailures: 5,
        windowFailures: 3,
        firstFailureTime: expect.any(Number),
        lastFailureTime: expect.any(Number),
        alertCount: 2,
        lastAlertTime: null
      });
    });

    it('should return null for failure times when no failures exist', async () => {
      mockRedis.zcard.mockResolvedValue(0);
      mockRedis.zcount.mockResolvedValue(0);
      mockRedis.hmget.mockResolvedValue([null, null]);
      mockRedis.get.mockResolvedValue(null);
      mockRedis.zrange.mockResolvedValue([]);

      const metrics = await getMetrics('test-service');

      expect(metrics).toEqual({
        totalFailures: 0,
        windowFailures: 0,
        firstFailureTime: null,
        lastFailureTime: null,
        alertCount: 0,
        lastAlertTime: null
      });
    });

    it('should respect custom options', async () => {
      mockRedis.zcard.mockResolvedValue(5);
      mockRedis.zcount.mockResolvedValue(3);
      mockRedis.hmget.mockResolvedValue([Date.now().toString(), null]);
      mockRedis.get.mockResolvedValue('0');
      mockRedis.zrange.mockResolvedValue(['failure_123', Date.now().toString()]);

      const customOptions = { windowSizeMs: 30 * 60 * 1000 }; // 30 minutes
      await getMetrics('test-service', customOptions);

      // Verify the zcount was called with correct time range
      const thirtyMinutesAgo = expect.any(Number);
      expect(mockRedis.zcount).toHaveBeenCalledWith(
        'api_failures:test-service:failures',
        thirtyMinutesAgo,
        '+inf'
      );
    });
  });

  describe('clearFailures', () => {
    it('should clear all failure data for a service', async () => {
      await clearFailures('test-service');

      expect(mockRedis.del).toHaveBeenCalledWith(
        'api_failures:test-service:failures'
      );
      expect(mockRedis.del).toHaveBeenCalledWith(
        'api_failures:test-service:meta'
      );
      expect(mockRedis.del).toHaveBeenCalledWith(
        'api_failures:test-service:alert_count'
      );
    });
  });

  describe('error handling', () => {
    it('should handle Redis errors gracefully in recordFailure', async () => {
      mockRedis.zadd.mockRejectedValue(new Error('Redis connection failed'));

      // Should not throw, just log the error
      await expect(recordFailure('test-service', new Error('Test error'))).resolves.not.toThrow();
      
      // Should log the error
      expect(logMessage.error).toHaveBeenCalledWith(
        'FailureTracker: Redis error while recording failure for test-service',
        expect.any(Error)
      );
    });

    it('should handle Redis errors gracefully in getMetrics', async () => {
      mockRedis.zcard.mockRejectedValue(new Error('Redis connection failed'));

      const metrics = await getMetrics('test-service');
      
      // Should return default metrics on error
      expect(metrics).toEqual({
        totalFailures: 0,
        windowFailures: 0,
        firstFailureTime: null,
        lastFailureTime: null,
        alertCount: 0,
        lastAlertTime: null,
      });
    });

    it('should handle Redis errors gracefully in clearFailures', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis connection failed'));

      // Should not throw, just log the error
      await expect(clearFailures('test-service')).resolves.not.toThrow();
    });
  });
});
