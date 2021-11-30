import mockedAxios from "axios";
import {
  buildFormDataObject,
  rehydrateFormResponses,
  extractFormData,
  submitToAPI,
} from "../integration/helpers";

import { logMessage } from "../logger";
import TestForm from "./testData";

jest.mock("axios");

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
        TestForm.elements.filter((q) => {
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
      expect(response).toEqual(formData.get(key));
    }
  });

  test("Rehydrate values", () => {
    const formData = buildFormDataObject(TestForm, mockResponses);

    // Mock Formik by extracting values to JSON
    const dehydrated = {};
    for (const [key, value] of formData.entries()) {
      dehydrated[key] = value;
    }

    const rehydrated = rehydrateFormResponses({
      form: TestForm,
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
        formConfig: TestForm,
        language: "en",
        router: mockedRouter,
      },
    });
    expect(mockedAxios.mock.calls[0][0].headers["Content-Language"]).toBe("en");
    expect(mockedAxios.mock.calls[0][0].data).toEqual(buildFormDataObject(TestForm, mockResponses));
    expect(mockedRouter.push)
      .toBeCalledTimes(1)
      .toBeCalledWith(
        expect.objectContaining({
          pathname: "/en/id/1/confirmation",
          query: {
            htmlEmail: null,
          },
        })
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
        formConfig: TestForm,
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
