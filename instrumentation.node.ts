import { resourceFromAttributes, detectResources } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { AWSXRayPropagator } from "@opentelemetry/propagator-aws-xray";
import { awsEcsDetector } from "@opentelemetry/resource-detector-aws";
import { AwsInstrumentation } from "@opentelemetry/instrumentation-aws-sdk";
import { FetchInstrumentation } from "@vercel/otel";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { IncomingMessage } from "http";

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: "gc-forms-app",
}).merge(detectResources({ detectors: [awsEcsDetector] }));

const sdk = new NodeSDK({
  resource,
  spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter()),
  textMapPropagator: new AWSXRayPropagator(),
  instrumentations: [
    new FetchInstrumentation(),
    new HttpInstrumentation({
      enabled: true,
      ignoreIncomingRequestHook: (request: IncomingMessage) => {
        const ignorePatterns = [
          /^\/_next\//, // starts with /_next/
          /^\/__nextjs_\//, // starts with /__nextjs_/
          /^\/img\//, // starts with /img/
          /^\/static\//, // starts with /static/
          /\?_rsc=/, // contains ?_rsc=
          /^\/favicon.ico/, // starts with favicon.ico
        ];

        const url = request.url;

        if (typeof url === "string" && ignorePatterns.some((pattern) => pattern.test(url))) {
          return true;
        }

        return false;
      },
    }),
    new AwsInstrumentation(),
  ],
});

sdk.start();
