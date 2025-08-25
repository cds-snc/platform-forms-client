import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { FetchInstrumentation } from "@vercel/otel";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { IncomingMessage } from "http";

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: "gc-forms-app",
});

const sdk = new NodeSDK({
  resource,
  spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter()),
  instrumentations: [
    new FetchInstrumentation(),
    new HttpInstrumentation({
      enabled: true,
      ignoreIncomingRequestHook: (request: IncomingMessage) => {
        const ignorePatterns = [
          /^\/_next\//, // starts with /_next/
          /^\/img\//, // starts with /img/
          /^\/static\//, // starts with /static/
          /\?_rsc=/, // contains ?_rsc=
        ];

        const url = request.url;

        if (typeof url === "string" && ignorePatterns.some((pattern) => pattern.test(url))) {
          return true;
        }

        return false;
      },
    }),
  ],
});

sdk.start();
