import mockedAxios from "axios";
import {
  buildFormDataObject,
  formatDate,
  getDaysPassed,
  rehydrateFormResponses,
  runPromisesSynchronously,
  submitToAPI,
} from "../clientHelpers";
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

describe("FormatDate tests", () => {
  const unformattedDate = new Date("Wed Mar 29 2023 18:00:43 GMT-0400 (Eastern Daylight Time)");
  const timestamp = 1680128323076;
  expect(formatDate(unformattedDate)).toBe("2023-03-29");
  expect(formatDate(timestamp)).toBe("Unknown");
  expect(formatDate(null)).toBe("Unknown");
  expect(formatDate(undefined)).toBe("Unknown");
  expect(formatDate("")).toBe("Unknown");
  expect(formatDate({})).toBe("Unknown");
  expect(formatDate()).toBe("Unknown");
});

describe("GetDaysPassed tests", () => {
  const date0 = new Date("Thu Mar 30 2023 13:31:00 GMT-0400 (Eastern Daylight Time)");
  const date1 = new Date("Thu Mar 30 2023 13:31:00 GMT-0400 (Eastern Daylight Time)");
  const date2 = new Date("Thu Apr 06 2023 13:31:00 GMT-0400 (Eastern Daylight Time)");
  const timestamp = 1680128323076; //Wed Mar 29 2023 18:18:43 GMT-0400 (Eastern Daylight Time)
  expect(getDaysPassed(date1)).not.toBeLessThan(0);
  expect(getDaysPassed(date1, date0)).toBe(0);
  expect(getDaysPassed(date2, date1)).toBe(7);
  expect(getDaysPassed(timestamp, date2)).toBe(8);
  expect(getDaysPassed(date0, timestamp)).toBe(1);
  expect(getDaysPassed(date0, 1)).toBe(-1);
  expect(getDaysPassed(1, 1)).toBe(-1);
  expect(getDaysPassed(1)).toBe(-1);
  expect(getDaysPassed(0)).toBe(-1);
  expect(getDaysPassed("")).toBe(-1);
  expect(getDaysPassed({})).toBe(-1);
  expect(getDaysPassed()).toBe(-1);
});

describe("runPromisesSynchronously tests", () => {
  it("Execution of promises should be synchronous", async () => {
    const promise1 = () => new Promise((r) => setTimeout(() => r(1), 500));
    const promise2 = () => new Promise((r) => setTimeout(() => r(2), 500));
    const promise3 = () => new Promise((r) => setTimeout(() => r(3), 500));
    const promise4 = () => new Promise((r) => setTimeout(() => r(4), 500));

    const sut = await runPromisesSynchronously([promise1, promise2, promise3, promise4]);

    expect(sut).toStrictEqual([1, 2, 3, 4]);
  });
});
