import mockedAxios from "axios";
import { buildFormDataObject, rehydrateFormResponses, submitToAPI } from "../clientHelpers";
import { logMessage } from "@lib/logger";
import TestForm from "../../__fixtures__/testData.json";
import { getCsrfToken } from "next-auth/react";

jest.mock("axios");
jest.mock("next-auth/react");

const formRecord = {
  id: "test0form00000id000asdf11",
  form: TestForm,
  isPublished: false,
  deliveryOption: {
    emailAddress: "",
    emailSubjectEn: "",
    emailSubjectFr: "",
  },
  securityAttribute: "Unclassified",
};

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
  test("Rehydrate values", () => {
    const formData = buildFormDataObject(formRecord, mockResponses);

    // Mock Formik by extracting values to JSON
    const dehydrated = {};
    for (const [key, value] of Object.entries(formData)) {
      dehydrated[key] = value;
    }

    const rehydrated = rehydrateFormResponses({
      form: formRecord,
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
        formRecord: formRecord,
        language: "en",
        router: mockedRouter,
      },
    });
    expect(mockedAxios.mock.calls.length).toBe(1);
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/submit", method: "POST" })
    );
    expect(mockedAxios.mock.calls[0][0].headers["Content-Language"]).toBe("en");
    expect(mockedAxios.mock.calls[0][0].data).toEqual(
      buildFormDataObject(formRecord, mockResponses)
    );
    expect(mockedRouter.push).toBeCalledTimes(1);
    expect(mockedRouter.push).toBeCalledWith(
      expect.objectContaining({
        pathname: "/en/id/test0form00000id000asdf11/confirmation",
      })
    );
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
        formRecord: formRecord,
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
