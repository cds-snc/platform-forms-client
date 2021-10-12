import { createMocks } from "node-mocks-http";
import templates from "../pages/api/templates";
import client from "next-auth/client";
import validFormTemplate from "./validFormTemplate.json";
import brokenFormTemplate from "./brokenFormTemplate.json";

import fetchMock from "jest-fetch-mock";

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

jest.mock("next-auth/client");

jest.mock("@aws-sdk/client-lambda", () => {
  return {
    LambdaClient: jest.fn(() => {
      return {
        send: jest.fn((command) => {
          const encoder = new TextEncoder(),
            decoder = new TextDecoder();
          const payload = JSON.parse(decoder.decode(command.Payload));
          const supported = ["GET", "UPDATE", "INSERT", "DELETE"];

          if (supported.indexOf(payload.method) === -1) {
            return Promise.resolve({
              FunctionError: "Unsupported",
            });
          } else if (payload.formID === "1") {
            return Promise.resolve({
              Payload: encoder.encode(
                JSON.stringify({
                  data: {
                    records: [
                      {
                        formConfig: {
                          submission: {
                            vault: true,
                          },
                        },
                      },
                    ],
                  },
                })
              ),
            });
          } else {
            return Promise.resolve({
              Payload: encoder.encode(
                JSON.stringify({
                  data: { records: [{ formID: 8 }] },
                })
              ),
            });
          }
        }),
      };
    }),
    InvokeCommand: jest.fn((payload) => {
      return payload;
    }),
  };
});

describe("Test JSON validation scenarios", () => {
  beforeEach(() => {
    fetchMock.enableMocks();
  });
  it("Should pass with valid JSON", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "a@b.com", name: "Testing Forms", image: "null" },
    };

    client.getSession.mockReturnValueOnce([mockSession, false]);

    fetchMock.mockResponseOnce(JSON.stringify({ testing: 300 }));
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        formConfig: validFormTemplate,
        method: "INSERT",
      }),
    });

    await templates(req, res);

    expect(res.statusCode).toBe(200);
  });

  it("Should fail with invalid JSON", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "a", name: "Delta", image: "c" },
    };

    client.getSession.mockReturnValueOnce([mockSession, false]);

    fetchMock.mockResponseOnce(JSON.stringify({ testing: 300 }));
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        formConfig: brokenFormTemplate,
        method: "INSERT",
      }),
    });

    await templates(req, res);
    expect(res.statusCode).toBe(400);
  });
});
