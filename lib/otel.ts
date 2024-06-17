"use server";

import { type Span, trace } from "@opentelemetry/api";

export async function otel<T>(
  fnName: string,
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  fn: (...args: any[]) => Promise<T>,
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  ...props: any[]
): Promise<T> {
  const tracer = trace.getTracer(fnName);
  return tracer.startActiveSpan(fnName, async (span: Span) => {
    try {
      return await fn(...props);
    } finally {
      span.end();
    }
  });
}
