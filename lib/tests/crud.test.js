import { crudTemplates } from "../integration/crud";
import { getFormByID, getFormByStatus, getSubmissionByID } from "../integration/crud";
import "@aws-sdk/client-lambda";

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

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
          } else if (payload.formID === 1) {
            return Promise.resolve({
              Payload: encoder.encode(
                JSON.stringify({
                  data: {
                    records: [
                      {
                        formID: 1,
                        formConfig: {
                          form: {
                            some: "form",
                          },
                          publishingStatus: true,
                          securityAttribute: "Unclassified",
                          displayAlphaBanner: true,
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
                  data: {
                    records: [
                      {
                        formConfig: {
                          form: { titleEn: "test" },
                          publishingStatus: true,
                          securityAttribute: "Unclassified",
                        },
                      },
                      {
                        formConfig: {
                          form: { titleEn: "test" },
                          publishingStatus: true,
                          securityAttribute: "Unclassified",
                        },
                      },
                      {
                        formConfig: {
                          form: { titleEn: "test" },
                          publishingStatus: false,
                          securityAttribute: "Unclassified",
                        },
                      },
                    ],
                  },
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

describe("Templates and Submissions API", () => {
  test.each([["GET"], ["POST"], ["PUT"], ["DELETE"]])("CRUD Templates", async (method) => {
    const supportedResult = await crudTemplates({ method: method });
    // mocked lambda returns 3 results
    expect(supportedResult.data.records.length).toEqual(3);
  });
  test("Unsupported Method", async () => {
    const unsupportedResult = await crudTemplates({ method: "UNSUPPORTED" });
    expect(unsupportedResult).toEqual(null);
  });
  test("getSubmissionByID returns the submission for a single form", async () => {
    const result = await getSubmissionByID(1);
    expect(result).toEqual({
      vault: true,
    });
  });
  test("getSubmissionByID returns null if multiple records are returned", async () => {
    const result = await getSubmissionByID(2);
    expect(result).toBeNull();
  });
  test("getFormByStatus returns forms with correct status", async () => {
    const result = await getFormByStatus(false);
    expect(result.length).toBe(1);
    expect(result[0]?.formConfig.publishingStatus).toBe(false);
  });
  test("getFormByID returns a single record when id is specified", async () => {
    const result = await getFormByID(1);
    expect(result).toMatchObject({
      formID: 1,
      formConfig: {
        publishingStatus: true,
        displayAlphaBanner: true,
        securityAttribute: "Unclassified",
      },
    });
  });

  test("get submission format", async () => {
    const submission = await getSubmissionByID(1);
    expect(submission).toEqual({ vault: true });
  });
});
