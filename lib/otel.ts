import { type Span, trace } from "@opentelemetry/api";
import { SpanKind } from "@opentelemetry/api";

export async function otel<T>(
  fnName: string,
  fn: (...args: never[]) => Promise<T>,
  ...props: never[]
): Promise<T> {
  const tracer = trace.getTracer(fnName);
  return tracer.startActiveSpan(fnName, { kind: SpanKind.SERVER }, async (span: Span) => {
    try {
      return await fn(...props);
    } finally {
      span.end();
    }
  });
}
