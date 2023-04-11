import { createMocks } from "node-mocks-http";
import templates from "@pages/api/templates";
import client from "next-auth/client";
import validFormTemplate from "../data/validFormTemplate.json";
import brokenFormTemplate from "../data/brokenFormTemplate.json";
import { logAdminActivity } from "@lib/adminLogs";

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

jest.mock("@lib/adminLogs", () => ({
  logAdminActivity: jest.fn(),
}));

describe("Test JSON validation scenarios", () => {
  it("Should successfully handle a POST request to create a template", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "a@b.com", name: "Testing Forms", admin: true, id: 1 },
    };
    client.getSession.mockReturnValue(mockSession);

    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        formConfig: validFormTemplate,
      },
    });

    await templates(req, res);

    expect(res.statusCode).toBe(200);
    expect(logAdminActivity).toHaveBeenCalledWith(
      1,
      "Create",
      "UploadForm",
      "Form id: 8 has been uploaded"
    );
  });

  it("Should fail with invalid JSON", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "a@c.com", name: "Delta", image: "c", admin: true },
    };

    client.getSession.mockReturnValueOnce(mockSession);
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        formConfig: brokenFormTemplate,
      },
    });

    await templates(req, res);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData()).error).toContain('instance requires property "form"');
  });

  it("Should successfully handle PUT request", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "forms@cds.ca", name: "forms", admin: true, id: 1 },
    };
    client.getSession.mockReturnValue(mockSession);

    const { req, res } = createMocks({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        formConfig: validFormTemplate,
      },
    });

    await templates(req, res);

    expect(res.statusCode).toBe(200);
    expect(logAdminActivity).toHaveBeenCalledWith(
      1,
      "Update",
      "UpdateForm",
      "Form id: 8 has been updated"
    );
  });

  it("Should successfully handle DELETE request", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "forms@cds.ca", name: "forms", admin: true, id: 1 },
    };
    client.getSession.mockReturnValue(mockSession);

    const { req, res } = createMocks({
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        formID: 1,
      },
    });

    await templates(req, res);

    expect(res.statusCode).toBe(200);
    expect(logAdminActivity).toHaveBeenCalledWith(
      1,
      "Delete",
      "DeleteForm",
      "Form id: 8 has been deleted"
    );
  });
});
