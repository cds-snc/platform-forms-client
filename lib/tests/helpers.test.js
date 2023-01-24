import mockedAxios from "axios";
import {
  buildFormDataObject,
  rehydrateFormResponses,
  extractFormData,
  submitToAPI,
} from "../helpers";

import { logMessage } from "@lib/logger";
import TestForm from "../../__fixtures__/testData.json";

import { getFormByID } from "../helpers";
import { getCsrfToken } from "next-auth/react";

jest.mock("axios");
jest.mock("next-auth/react");

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
      form: TestForm,
      responses: mockResponses,
    });
    // Includes the Rich Text field for output
    expect(formResponses.length).toBe(8);
    for (const [key, value] of Object.entries(mockResponses)) {
      iterateResponseArray(formResponses, value);
      iterateResponseArray(
        formResponses,
        TestForm.form.elements.filter((q) => {
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

    const formData = buildFormDataObject(TestForm, mockResponses);

    for (const [key, response] of Object.entries(expectedOutput)) {
      expect(response).toEqual(formData[key]);
    }
  });

  test("Rehydrate values", () => {
    const formData = buildFormDataObject(TestForm, mockResponses);

    // Mock Formik by extracting values to JSON
    const dehydrated = {};
    for (const [key, value] of Object.entries(formData)) {
      dehydrated[key] = value;
    }

    const rehydrated = rehydrateFormResponses({
      form: TestForm,
      responses: dehydrated,
    });

    expect(mockResponses).toMatchObject(rehydrated);
  });
});

describe("Submit and Template helpers", () => {
  let mockedConsoleError;
  beforeEach(() => {
    mockedConsoleError = jest.spyOn(logMessage, "error");
    mockedConsoleError.mockImplementation(() => {});
    getCsrfToken.mockResolvedValue("csrfTokenSecretValue");
  });
  afterEach(() => {
    mockedConsoleError.mockRestore();
  });
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
        formRecord: TestForm,
        language: "en",
        router: mockedRouter,
      },
    });
    expect(mockedAxios.mock.calls.length).toBe(1);
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/submit", method: "POST" })
    );
    expect(mockedAxios.mock.calls[0][0].headers["Content-Language"]).toBe("en");
    expect(mockedAxios.mock.calls[0][0].data).toEqual(buildFormDataObject(TestForm, mockResponses));
    expect(mockedRouter.push).toBeCalledTimes(1);
    expect(mockedRouter.push).toBeCalledWith(
      expect.objectContaining({
        pathname: "/en/id/test0form00000id000asdf11/confirmation",
      })
    );
  });
  test("getFormByID returns form when ID is specified", async () => {
    mockedAxios.mockResolvedValue({
      status: 200,
      data: {
        data: [
          {
            id: "test0form00000id000asdf11",
            elements: { test: "test" },
            securityAttribute: "Unclassified",
          },
        ],
      },
    });
    const form = await getFormByID("test0form00000id000asdf11");
    expect(mockedAxios.mock.calls.length).toBe(1);
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/templates/test0form00000id000asdf11", method: "GET" })
    );
    expect(form.id).toEqual("test0form00000id000asdf11");
    expect(form.securityAttribute).toEqual("Unclassified");
  });
  test("getFormByID handles error when it occurs", async () => {
    mockedAxios.mockImplementationOnce(() => {
      throw new Error("some error");
    });

    await getFormByID("1");

    expect(mockedConsoleError.mock.calls.length).toBe(1);
    expect(mockedAxios.mock.calls.length).toBe(1);
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/templates/1", method: "GET" })
    );
    expect(mockedConsoleError.mock.calls[0][0]).toEqual(new Error("some error"));
  });
  test("Get form by ID returns null when no records returned", async () => {
    mockedAxios.mockRejectedValue({
      status: 400,
      data: {
        data: {
          records: [],
        },
      },
    });
    const form = await getFormByID("1");
    expect(mockedAxios.mock.calls.length).toBe(1);
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/templates/1", method: "GET" })
    );
    expect(form).toEqual(undefined);
  });

  test("API Error", async () => {
    mockedAxios.mockRejectedValue({
      status: 502,
      data: { received: false },
    });
    const mockedRouter = {
      push: jest.fn(() => {}),
    };
    const mockedFormikBag = {
      setStatus: jest.fn(() => {}),
      props: {
        formRecord: TestForm,
        language: "en",
        router: mockedRouter,
      },
    };
    const mockedLogger = jest.spyOn(logMessage, "error");
    await submitToAPI(mockResponses, mockedFormikBag);
    expect(mockedAxios.mock.calls.length).toBe(1);
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/submit", method: "POST" })
    );
    expect(mockedRouter.push).toBeCalledTimes(0);
    expect(mockedLogger).toBeCalledTimes(1);
    expect(mockedFormikBag.setStatus).toBeCalledTimes(1);
    expect(mockedFormikBag.setStatus).toBeCalledWith("Error");
  });
});
