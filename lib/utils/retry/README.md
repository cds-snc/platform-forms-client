# withRetry Utility

A flexible retry utility with exponential backoff for handling transient failures in async operations.

## Installation & Import

The retry utilities are located in `lib/utils/retry/`:

```typescript
// Import individual functions
import { withRetry, withRetryFallback } from '@lib/utils/retry';

// Import with types
import { withRetry, withRetryFallback, type RetryOptions } from '@lib/utils/retry';
```

## Overview

The `withRetry` utility provides robust retry logic for functions that may fail due to temporary issues like network timeouts, server errors, or rate limiting. It includes intelligent error filtering, exponential backoff, and comprehensive callback support.

## Functions

### `withRetry<T>(fn, options)`

Executes a function with retry logic and exponential backoff. Throws an error after all retries are exhausted.

### `withRetryFallback<T>(fn, fallbackValue, options)`

Same as `withRetry` but returns a fallback value instead of throwing when all retries fail.

## Configuration Options

```typescript
interface RetryOptions {
  maxRetries?: number;           // Default: 3
  baseDelay?: number;            // Default: 1000ms
  maxDelay?: number;             // Default: 10000ms
  onRetry?: (attempt: number, error: unknown) => void;
  shouldRetry?: (error: unknown) => boolean;
  onFinalFailure?: (error: unknown, totalAttempts: number) => void;
}
```

### Options Details

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxRetries` | `number` | `3` | Maximum number of retry attempts |
| `baseDelay` | `number` | `1000` | Base delay in milliseconds for exponential backoff |
| `maxDelay` | `number` | `10000` | Maximum delay cap in milliseconds |
| `onRetry` | `function` | `undefined` | Callback fired on each retry attempt |
| `shouldRetry` | `function` | `() => true` | Function to determine if an error should trigger a retry |
| `onFinalFailure` | `function` | `undefined` | Callback fired when all retries are exhausted |

## Exponential Backoff

The utility uses exponential backoff with the formula:
```
delay = Math.min(Math.pow(2, attempt - 1) * baseDelay, maxDelay)
```

**Example delays with default settings:**
- Attempt 1: 1000ms (1s)
- Attempt 2: 2000ms (2s)  
- Attempt 3: 4000ms (4s)
- Attempt 4+: 8000ms (8s, capped at maxDelay)

## Basic Usage

### Simple Retry
```typescript
import { withRetry } from '@lib/utils/retry';

// Basic retry with defaults (3 attempts, 1s base delay)
const data = await withRetry(() => 
  fetch('/api/data').then(res => res.json())
);
```

### Retry with Fallback
```typescript
import { withRetryFallback } from '@lib/utils/retry';

// Returns fallback value if all retries fail
const userData = await withRetryFallback(
  () => fetchUserProfile(userId),
  { name: 'Guest', id: null }, // fallback value
  { maxRetries: 2 }
);
```

## Advanced Usage

### Custom Retry Configuration
```typescript
const result = await withRetry(
  () => apiCall(),
  {
    maxRetries: 5,
    baseDelay: 500,     // Start with 500ms
    maxDelay: 30000,    // Cap at 30 seconds
  }
);
```

### Intelligent Error Filtering
```typescript
// Only retry server errors (5xx), not client errors (4xx)
const result = await withRetry(
  () => axios.post('/api/submit', data),
  {
    shouldRetry: (error) => {
      const axiosError = error as any;
      // Retry server errors but fail fast on client errors
      return axiosError.response?.status >= 500;
    }
  }
);
```

### Custom Logging and Monitoring
```typescript
const result = await withRetryFallback(
  () => criticalApiCall(),
  null,
  {
    maxRetries: 3,
    onRetry: (attempt, error) => {
      console.warn(`Attempt ${attempt} failed:`, error);
      // Could send to monitoring service
      // metrics.increment('api.retry', { attempt });
    },
    onFinalFailure: (error, totalAttempts) => {
      console.error(`All ${totalAttempts} attempts failed:`, error);
      // Could trigger alerts
      // alerting.sendAlert('Critical API failure', { error, totalAttempts });
    }
  }
);
```

## Common Patterns

### Axios HTTP Requests
```typescript
// Only retry network errors and 5xx responses
const apiCall = () => withRetry(
  () => axios.get('/api/endpoint'),
  {
    shouldRetry: (error) => {
      const err = error as any;
      return !err.response || err.response.status >= 500;
    }
  }
);
```

### Database Operations
```typescript
// Retry connection errors but not constraint violations
const dbOperation = () => withRetry(
  () => database.query('SELECT * FROM users'),
  {
    shouldRetry: (error) => {
      const err = error as any;
      return err.code === 'CONNECTION_ERROR' || err.code === 'TIMEOUT';
    }
  }
);
```

### External Service Integration
```typescript
// Graceful degradation with fallback
const weatherData = await withRetryFallback(
  () => weatherAPI.getCurrentWeather(location),
  { temperature: null, condition: 'unavailable' },
  {
    maxRetries: 2,
    baseDelay: 2000,
    shouldRetry: (error) => {
      const err = error as any;
      // Don't retry authentication or quota errors
      return ![401, 403, 429].includes(err.response?.status);
    }
  }
);
```

## Error Handling Best Practices

### 1. Fail Fast on Permanent Errors
```typescript
shouldRetry: (error) => {
  const err = error as any;
  const status = err.response?.status;
  
  // Don't retry these permanent errors
  if ([400, 401, 403, 404, 422].includes(status)) {
    return false;
  }
  
  // Retry network errors and 5xx responses
  return !status || status >= 500;
}
```

### 2. Comprehensive Monitoring
```typescript
{
  onRetry: (attempt, error) => {
    logger.warn(`Retry attempt ${attempt}`, { 
      error: error.message,
      function: 'apiCall',
      timestamp: new Date()
    });
  },
  onFinalFailure: (error, totalAttempts) => {
    logger.error(`Operation failed after ${totalAttempts} attempts`, {
      error: error.message,
      stack: error.stack,
      function: 'apiCall'
    });
    
    // Send to error tracking service
    errorTracker.captureException(error, {
      tags: { operation: 'apiCall', totalAttempts }
    });
  }
}
```

### 3. Rate Limiting Awareness
```typescript
{
  shouldRetry: (error) => {
    const err = error as any;
    
    // Don't retry rate limit errors immediately
    if (err.response?.status === 429) {
      return false;
    }
    
    return err.response?.status >= 500;
  },
  baseDelay: 5000, // Longer delays for rate-limited services
  maxDelay: 60000  // Up to 1 minute between retries
}
```

## TypeScript Support

The utility is fully typed with TypeScript generics:

```typescript
// Type is inferred from the function return type
const user: UserProfile = await withRetry(() => fetchUser(id));

// Explicit typing for complex scenarios
const result: ApiResponse<UserData> = await withRetryFallback<ApiResponse<UserData>>(
  () => complexApiCall(),
  { success: false, data: null, error: 'Service unavailable' }
);
```

## Testing

The utility includes comprehensive test coverage. Example test patterns:

```typescript
// Mock function with controlled failures
const mockFn = vi
  .fn()
  .mockRejectedValueOnce(new Error('attempt 1'))
  .mockRejectedValueOnce(new Error('attempt 2'))
  .mockResolvedValue('success');

// Test retry behavior
const result = await withRetry(mockFn);
expect(result).toBe('success');
expect(mockFn).toHaveBeenCalledTimes(3);
```

## Performance Considerations

- **Memory**: Each retry creates a new Promise and timer
- **Delay calculation**: Exponential backoff prevents overwhelming services
- **Max delay cap**: Prevents excessively long waits
- **shouldRetry**: Use to avoid unnecessary retries on permanent errors

## Migration Guide

### From manual retry loops:
```typescript
// Before
let attempts = 0;
while (attempts < 3) {
  try {
    return await apiCall();
  } catch (error) {
    attempts++;
    if (attempts >= 3) throw error;
    await sleep(1000 * attempts);
  }
}

// After
return await withRetry(() => apiCall(), { maxRetries: 3 });
```

### From try-catch with fallbacks:
```typescript
// Before
try {
  return await apiCall();
} catch (error) {
  console.error('API failed:', error);
  return defaultValue;
}

// After
return await withRetryFallback(
  () => apiCall(),
  defaultValue,
  { 
    onFinalFailure: (error) => console.error('API failed:', error)
  }
);
```
