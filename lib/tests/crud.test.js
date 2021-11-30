import { crudTemplates } from "../integration/crud";
import mockedAxios from "axios";

import { getFormByID, getFormByStatus, getSubmissionByID } from "../integration/helpers";

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

jest.mock("axios");
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
                  data: {
                    records: [
                      {
                        formConfig: {
                          form: { titleEn: "test" },
                          publishingStatus: true,
                        },
                      },
                      {
                        formConfig: {
                          form: { titleEn: "test" },
                          publishingStatus: true,
                        },
                      },
                      {
                        formConfig: {
                          form: { titleEn: "test" },
                          publishingStatus: false,
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
  test.each([["GET"], ["INSERT"], ["UPDATE"], ["DELETE"]])("CRUD Templates", async (method) => {
    const supportedResult = await crudTemplates({ method: method });
    // mocked lambda returns 3 results
    expect(supportedResult.data.records.length).toEqual(3);
  });
  test("Unsupported Method", async () => {
    const unsupportedResult = await crudTemplates({ method: "UNSUPPORTED" });
    expect(unsupportedResult).toEqual(null);
  });
  test.each([
    ["UPDATE", { data: {} }],
    ["DELETE", { data: {} }],
    ["UNSUPPORTED", { data: {} }],
  ])("Cypress mode", async (method, result) => {
    process.env.CYPRESS = true;
    let data = await crudTemplates({ method: method });
    expect(data).toEqual(result);
  });

  test.each([
    [true, 2],
    [false, 1],
  ])("Get form by status", async (published, results) => {
    mockedAxios.mockResolvedValue({
      status: 200,
      data: {
        data: {
          records: [
            {
              formID: "1",
              formConfig: {
                publishingStatus: true,
              },
            },
            {
              formID: "2",
              formConfig: {
                publishingStatus: true,
              },
            },
            {
              formID: "3",
              formConfig: {
                publishingStatus: false,
              },
            },
          ],
        },
      },
    });
    const forms = await getFormByStatus(published);
    expect(forms.length).toEqual(results);
  });
  test("Get form by ID", async () => {
    mockedAxios.mockResolvedValue({
      status: 200,
      data: {
        data: {
          records: [
            {
              formID: "1",
              formConfig: {
                form: { test: "test" },
                publishingStatus: true,
              },
            },
          ],
        },
      },
    });
    const form = await getFormByID("1");

    expect(form.formID).toEqual("1");
    expect(form.publishingStatus).toBe(true);
  });
  test("Get form by ID returns null when no records returned", async () => {
    mockedAxios.mockResolvedValue({
      status: 200,
      data: {
        data: {
          records: [],
        },
      },
    });
    const form = await getFormByID("1");
    expect(form).toEqual(null);
  });

  test("get submission format", async () => {
    const submission = await getSubmissionByID("1");
    expect(submission).toEqual({ vault: true });
  });
});
