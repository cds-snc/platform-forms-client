import mockedAxios from "axios";
import {
  submitToAPI,
  extractFormData,
  rehydrateFormResponses,
  buildFormDataObject,
  crudTemplates,
  getFormByID,
  getSubmissionByID,
  getFormByStatus,
} from "../dataLayer";
import { logMessage } from "../logger";
import testForm from "./testData";

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

const mockResponses = {
  1: "test response", // TextField
  2: "test response 2", // TextArea
  4: "Manitoba", // DropDown
  5: "Student", // Radio
  6: [], // CheckBox
  7: [
    // DynamicRow (TextField, TextField, TextField, CheckBox)
    {
      0: "Doe",
      1: "John",
      2: "CDS",
      3: ["No"],
    },
    {
      0: "Seat",
      1: "Love",
      2: "CHMC",
      3: ["Yes", "Other"],
    },
  ],
  8: "", // TextField
};

describe("Extract Form data", () => {
  test("Parses data", () => {
    const formResponses = extractFormData({
      form: testForm,
      responses: mockResponses,
    });
    expect(formResponses.length).toBe(7);
    for (const [key, value] of Object.entries(mockResponses)) {
      iterateResponseArray(formResponses, value);
      iterateResponseArray(
        formResponses,
        testForm.elements.filter((q) => {
          q.id === key ? q.properties.titleEn : false;
        })
      );
    }

    function iterateResponseArray(response, value) {
      if (Array.isArray(value)) {
        value.map((item) => {
          iterateResponseArray(response, item);
        });
      } else if (typeof value === "object") {
        Object.entries(value).forEach(([, value]) => {
          iterateResponseArray(response, value);
        });
      } else {
        if (value === "") {
          expect(response).toContainEqual(expect.stringContaining("No Response"));
        } else {
          expect(response).toContainEqual(expect.stringContaining(value));
        }
      }
    }
  });

  test("Build form data object", () => {
    const expectedOutput = {
      1: "test response",
      2: "test response 2",
      4: "Manitoba",
      5: "Student",
      6: '{"value":[]}',
      "7-0-0": "Doe",
      "7-0-1": "John",
      "7-0-2": "CDS",
      "7-0-3": '{"value":["No"]}',
      "7-1-0": "Seat",
      "7-1-1": "Love",
      "7-1-2": "CHMC",
      "7-1-3": '{"value":["Yes","Other"]}',
      8: "",
    };

    const formData = buildFormDataObject(testForm, mockResponses);

    for (const [key, response] of Object.entries(expectedOutput)) {
      expect(response).toEqual(formData.get(key));
    }
  });

  test("Rehydrate values", () => {
    const formData = buildFormDataObject(testForm, mockResponses);

    // Mock Formik by extracting values to JSON
    const dehydrated = {};
    for (const [key, value] of formData.entries()) {
      dehydrated[key] = value;
    }

    const rehydrated = rehydrateFormResponses({
      form: testForm,
      responses: dehydrated,
    });

    expect(mockResponses).toMatchObject(rehydrated);
  });
});

describe("Submit Form data", () => {
  test("Submit Succeeds", async () => {
    mockedAxios.mockResolvedValue({
      status: 200,
      data: { received: true },
    });
    const mockedRouter = {
      push: jest.fn(() => {}),
    };
    await submitToAPI(mockResponses, {
      props: {
        formConfig: testForm,
        language: "en",
        router: mockedRouter,
      },
    });
    expect(mockedRouter.push)
      .toBeCalledTimes(1)
      .toBeCalledWith(
        expect.objectContaining({
          pathname: "/en/id/1/confirmation",
          query: {
            htmlEmail: null,
            referrerUrl: expect.any(String),
            pageText: expect.any(String),
          },
        }),
        expect.objectContaining({ pathname: "/en/id/1/confirmation" })
      );
  });

  test("API Error", async () => {
    mockedAxios.mockResolvedValue({
      status: 502,
      data: { received: false },
    });
    const mockedRouter = {
      push: jest.fn(() => {}),
    };
    const mockedFormikBag = {
      setStatus: jest.fn(() => {}),
      props: {
        formConfig: testForm,
        language: "en",
        router: mockedRouter,
      },
    };
    const mockedLogger = jest.spyOn(logMessage, "error");
    await submitToAPI(mockResponses, mockedFormikBag);
    expect(mockedRouter.push).toBeCalledTimes(0);
    expect(mockedLogger).toBeCalledTimes(1);
    expect(mockedFormikBag.setStatus).toBeCalledTimes(1).toBeCalledWith("Error");
  });
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
