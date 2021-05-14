import mockedAxios from "axios";
import {
  getFormByID,
  getSubmissionByID,
  getFormByStatus,
  submitToAPI,
  extractFormData,
  rehydrateFormResponses,
  buildFormDataObject,
} from "../dataLayer";
import { logMessage } from "../logger";
import testForm from "./testData";

jest.mock("axios");
jest.mock("../../forms/forms", () => ({
  test_form_unpublished: {
    publishingStatus: false,
    submission: {
      email: "no-reply@cds-snc.ca",
    },
    form: {
      id: 1,
      titleEn: "CDS Test Form",
      titleFr: "SNC Formulaire de test",
      layout: [1, 2],
      elements: [],
    },
  },
  test_form_published: {
    publishingStatus: true,
    submission: {
      email: "no-reply@cds-snc.ca",
    },
    form: {
      id: 2,
      titleEn: "CDS Test Form",
      titleFr: "SNC Formulaire de test",
      layout: [1, 2],
      elements: [],
    },
  },
}));

const mockResponses = {
  1: "test response",
  2: "test response 2",
  4: "Manitoba",
  5: "Student",
  6: [],
  7: [
    ["Doe", "John", "CDS", "No"],
    ["Seat", "Love", "CHMC", ["Yes", "Other"]],
  ],
  8: "",
};

describe("Get form functions", () => {
  test("Get Form by ID", () => {
    const form = getFormByID("1");
    expect(form).toMatchObject({
      id: expect.any(Number),
      titleEn: expect.any(String),
      titleFr: expect.any(String),
      layout: expect.any(Array),
      elements: expect.any(Array),
      publishingStatus: expect.any(Boolean),
    });
    const doesNotExist = getFormByID("4");
    expect(doesNotExist).toBe(null);
  });
  test("Get Form by Status", () => {
    const form = getFormByStatus(true);
    expect(form.length).toBe(1);
    expect(form[0]).toBe(2);
  });
  test("Get Submission by ID", () => {
    const submission = getSubmissionByID("1");
    expect(submission).toMatchObject({
      email: expect.any(String),
    });
    const doesNotExist = getSubmissionByID("10");
    expect(doesNotExist).toBe(null);
  });
});
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
    const formData = buildFormDataObject(testForm, mockResponses);
    for (const [key, response] of Object.entries(mockResponses)) {
      if (Array.isArray(response)) {
        let stringifiedResponse = JSON.stringify({ value: response });
        expect(stringifiedResponse).toBe(formData.get(key));
      } else expect(response).toEqual(formData.get(key));
    }
  });
  test("Rehydrate values", () => {
    const formDataObject = buildFormDataObject(testForm, mockResponses);
    // Mock Formik by extracting values to JSON
    const dehydrated = {};
    for (const [key, value] of formDataObject.entries()) {
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
    await submitToAPI(
      mockResponses,
      {
        props: {
          formMetadata: testForm,
          language: "en",
          router: mockedRouter,
        },
      },
      false
    );
    expect(mockedRouter.push)
      .toBeCalledTimes(1)
      .toBeCalledWith(
        expect.objectContaining({
          pathname: "/en/id/1/confirmation",
          query: {
            htmlEmail: undefined,
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
        formMetadata: testForm,
        language: "en",
        router: mockedRouter,
      },
    };
    const mockedLogger = jest.spyOn(logMessage, "error");
    await submitToAPI(mockResponses, mockedFormikBag, false);
    expect(mockedRouter.push).toBeCalledTimes(0);
    expect(mockedLogger).toBeCalledTimes(1);
    expect(mockedFormikBag.setStatus).toBeCalledTimes(1).toBeCalledWith("Error");
  });
});
