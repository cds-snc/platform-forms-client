# Retry Utilities

This module provides comprehensive retry utilities with failure tracking and intelligent alerting.

## Components

### withRetry
Retry a function with exponential backoff.

```typescript
import { withRetry } from '@lib/utils/retry';

const result = await withRetry(
  () => apiCall(),
  {
    attempts: 3,
    delay: 1000,
    backoffMultiplier: 2,
    shouldRetry: (error) => error.status >= 500
  }
);
```

### Failure Tracker
Two-level alerting system for monitoring service failures:

- **Severity 2 Alerts**: Triggered when failure threshold is reached within a time window
- **Severity 1 Alerts**: Triggered when multiple Severity 2 alerts occur within a larger time window

#### Configuration Options

```typescript
interface FailureTrackerOptions {
  // Severity 2 alert thresholds
  failureWindow?: number; // Time window for failures in minutes (default: 5)
  failureThreshold?: number; // Failures needed for Severity 2 alert (default: 5)
  severity2Cooldown?: number; // Cooldown after Severity 2 alert in minutes (default: 15)
  
  // Severity 1 alert thresholds  
  alertWindow?: number; // Time window for Severity 2 alerts in minutes (default: 60)
  alertThreshold?: number; // Severity 2 alerts needed for Severity 1 (default: 3)
}
```

#### Cooldown Functionality

To prevent alert spam, the system includes a configurable cooldown period after Severity 2 alerts:

- **Default**: 15 minutes
- **Customizable**: Set `severity2Cooldown` option in minutes
- **Behavior**: No Severity 2 alerts will be generated within the cooldown period after the last alert

Example with custom cooldown:

```typescript
import { recordFailure } from '@lib/utils/retry';

await recordFailure('myService', error, {
  failureThreshold: 3,
  severity2Cooldown: 5, // 5 minute cooldown
});
```

#### Usage Example

```typescript
import { recordFailure, getFailureMetrics } from '@lib/utils/retry';

// Record a failure
await recordFailure('hCaptcha', error, {
  failureThreshold: 3, // Lower threshold for critical services
  severity2Cooldown: 1, // Short cooldown for rapid alerting
});

// Get current metrics
const metrics = await getFailureMetrics('hCaptcha');
console.log(`Failures in last 5 minutes: ${metrics.failureCount}`);
```

## Integration with hCaptcha

The hCaptcha validation automatically uses the failure tracker:

```typescript
// In lib/validation/hCaptcha.ts
await recordFailure("hCaptcha", error, {
  severity2Cooldown: 1, // 1 minute cooldown for hCaptcha alerts
});
```

## Testing

The module includes comprehensive tests (23 tests total):
- 8 tests for retry logic
- 15 tests for failure tracking including cooldown functionality

Run tests:
```bash
npm run test -- lib/utils/retry
```