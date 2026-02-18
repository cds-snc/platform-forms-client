import { resourceFromAttributes, detectResources } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { AWSXRayPropagator } from "@opentelemetry/propagator-aws-xray";
import { awsEcsDetector } from "@opentelemetry/resource-detector-aws";
import { AwsInstrumentation } from "@opentelemetry/instrumentation-aws-sdk";
import { FetchInstrumentation } from "@vercel/otel";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: "gc-forms-app",
}).merge(detectResources({ detectors: [awsEcsDetector] }));

const sdk = new NodeSDK({
  resource,
  spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter()),
  textMapPropagator: new AWSXRayPropagator(),
  instrumentations: [new FetchInstrumentation(), new AwsInstrumentation()],
});

sdk.start();
