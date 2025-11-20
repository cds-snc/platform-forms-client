// tracing.ts

import { trace, Span, SpanStatusCode, Tracer, Attributes, SpanOptions } from "@opentelemetry/api";

const tracer: Tracer = trace.getTracer("gc-forms-app");

/**
 * A wrapper function to execute a function within a new OpenTelemetry span.
 *
 * @param spanName The name of the span.
 * @param operation The synchronous or asynchronous function to execute within the span.
 * @param options Optional span options (e.g., SpanKind, attributes).
 * @returns The result of the operation.
 */
export async function traceFunction<T>(
  spanName: string,
  operation: (span: Span) => Promise<T> | T,
  options?: SpanOptions & { attributes?: Attributes }
): Promise<T> {
  // startActiveSpan automatically makes the new span the current active context
  // for the duration of the callback function.
  return tracer.startActiveSpan(spanName, options || {}, async (span) => {
    try {
      // Execute the provided operation
      const result = await operation(span);
      // Set status to OK if successful
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      if (error instanceof Error) {
        // Record exception and set status to ERROR if an error occurs
        span.recordException(error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message,
        });
      }
      // Re-throw the error so the caller can handle it
      throw error;
    } finally {
      // Ensure the span is ended in all cases (success or error)
      span.end();
    }
  });
}
