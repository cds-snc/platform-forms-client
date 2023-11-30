/**
 * @jest-environment node
 */
import { createMocks } from "node-mocks-http";
import notifyCallback from "../../pages/api/notify-callback";
import { SQSClient } from "@aws-sdk/client-sqs";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { logMessage } from "@lib/logger";

jest.mock("@aws-sdk/client-sqs");
jest.mock("@aws-sdk/client-dynamodb");
jest.mock("@aws-sdk/lib-dynamodb");

const dynamodbDocumentClient = {
  send: jest.fn(),
};

jest.mock("@lib/logger");
const mockLogMessage = jest.mocked(logMessage, { shallow: true });

describe("/api/notify-callbacks", () => {
  beforeAll(() => {
    process.env.GC_NOTIFY_CALLBACK_BEARER_TOKEN = "gc-form-super-secret-bearer-token";
  });

  afterAll(() => {
    delete process.env.GC_NOTIFY_CALLBACK_BEARER_TOKEN;
  });

  it("Should reject GET request", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
    });

    await notifyCallback(req, res);

    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ error: "HTTP Method Forbidden" })
    );
  });

  it("Should reject request without authorization header", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
    });

    await notifyCallback(req, res);

    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ error: "Missing authorization header" })
    );
  });

  it("Should reject request with wrong authorization header", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        authorization: `Bearer `,
      },
    });

    await notifyCallback(req, res);

    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ error: "Invalid authorization header" })
    );
  });

  it("Should reject request if payload does not contain reference attribute", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        authorization: `Bearer ${process.env.GC_NOTIFY_CALLBACK_BEARER_TOKEN}`,
      },
      body: {
        status: "delivered",
      },
    });

    await notifyCallback(req, res);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: "Invalid payload: missing key attributes (reference or status)",
      })
    );
  });

  it("Should reject request if payload does not contain status attribute", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        authorization: `Bearer ${process.env.GC_NOTIFY_CALLBACK_BEARER_TOKEN}`,
      },
      body: {
        reference: "something",
      },
    });

    await notifyCallback(req, res);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: "Invalid payload: missing key attributes (reference or status)",
      })
    );
  });

  it("Should respond with code 200 if payload has a deliveryStatus equal to 'delivered' value", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        authorization: `Bearer ${process.env.GC_NOTIFY_CALLBACK_BEARER_TOKEN}`,
      },
      body: {
        reference: "something",
        status: "delivered",
      },
    });

    await notifyCallback(req, res);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        status: "submission will not be reprocessed because the email was delivered",
      })
    );
  });

  it("Should respond with code 200 if payload has a deliveryStatus equal to 'permanent-failure' value", async () => {
    const sqsClientSpy = jest.spyOn(SQSClient.prototype, "send");

    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        authorization: `Bearer ${process.env.GC_NOTIFY_CALLBACK_BEARER_TOKEN}`,
      },
      body: {
        reference: "something",
        status: "permanent-failure",
      },
    });

    sqsClientSpy
      .mockResolvedValueOnce({
        QueueUrl: "http://queue_url",
      })
      .mockImplementation(() => Promise.resolve());

    DynamoDBDocumentClient.from.mockReturnValue(dynamodbDocumentClient);

    await notifyCallback(req, res);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        status: "submission will not be reprocessed because the email will never be delivered",
      })
    );
    expect(mockLogMessage.warn.mock.calls[0][0]).toBe(
      "Form submission something will never be delivered because of a permanent failure (GC Notify)"
    );
  });

  it("Should respond with code 200 if request is valid", async () => {
    const sqsClientSpy = jest.spyOn(SQSClient.prototype, "send");

    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        authorization: `Bearer ${process.env.GC_NOTIFY_CALLBACK_BEARER_TOKEN}`,
      },
      body: {
        reference: "something",
        status: "temporary-failure",
      },
    });

    sqsClientSpy
      .mockResolvedValueOnce({
        QueueUrl: "http://queue_url",
      })
      .mockImplementation(() => Promise.resolve());

    DynamoDBDocumentClient.from.mockReturnValue(dynamodbDocumentClient);

    await notifyCallback(req, res);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ status: "submission will be reprocessed" })
    );
  });

  it("Should respond with code 200 if payload has a null reference value", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        authorization: `Bearer ${process.env.GC_NOTIFY_CALLBACK_BEARER_TOKEN}`,
      },
      body: {
        reference: null,
        status: "permanent-failure",
      },
    });

    await notifyCallback(req, res);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        status: "submission will not be reprocessed because of missing submission ID",
      })
    );
  });
});
