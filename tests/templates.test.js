import { createMocks } from "node-mocks-http";
import templates from "@pages/api/templates";
import client from "next-auth/client";
import validFormTemplate from "./data/validFormTemplate.json";
import brokenFormTemplate from "./data/brokenFormTemplate.json";

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

jest.mock("next-auth/client");

jest.mock("@aws-sdk/client-lambda", () => {
  return {
    LambdaClient: jest.fn(() => {
      return {
        send: jest.fn((command) => {
          const encoder = new TextEncoder();
          const decoder = new TextDecoder();
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
  it("Should pass with valid JSON", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "a@b.com", name: "Testing Forms", image: "null", admin: true },
    };

    client.getSession.mockReturnValueOnce(mockSession);
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        formConfig: validFormTemplate,
        method: "INSERT",
      },
    });

    await templates(req, res);

    expect(res.statusCode).toBe(200);
  });

  it("Should fail with invalid JSON", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "a", name: "Delta", image: "c", admin: true },
    };

    client.getSession.mockReturnValueOnce([mockSession, false]);
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        formConfig: brokenFormTemplate,
        method: "INSERT",
      },
    });

    await templates(req, res);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData()).error).toEqual('instance requires property "form"');
  });
});
