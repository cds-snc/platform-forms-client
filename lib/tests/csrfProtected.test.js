import mockedAxios from "axios";
import { createMocks } from "node-mocks-http";
import { submitToAPI } from "../clientHelpers";
import { getCsrfToken } from "next-auth/react";
import { csrfProtected } from "@lib/middleware/csrfProtected";
import TestForm from "../../__fixtures__/testData.json";
jest.mock("axios");
jest.mock("next-auth/react");

const mockResponses = {
  1: "test response", // TextField
  2: "test response 2", // TextArea
  4: "Manitoba", // DropDown
  5: "Student", // Radio
  6: [], // CheckBox
  7: [
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
  8: "",
};

describe("Csrf Protection middleware", () => {
  test("Should pass with unprotected method GET", async () => {
    const { req, res } = createMocks({
      method: "GET",
    });

    await csrfProtected(["POST", "PUT"])(req, res);
    expect(res.statusCode).toBe(200);
  });

  test("Should fail with protected method POST and a different csrf token", async () => {
    getCsrfToken.mockResolvedValueOnce("differentCsrfToken");
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": "csrfToken",
      },
    });

    await csrfProtected(["POST"])(req, res);
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Access Denied",
    });
  });

  test("Should fail with null csrf token", async () => {
    getCsrfToken.mockResolvedValueOnce(null);
    const { req, res } = createMocks({
      method: "POST",
    });

    await csrfProtected(["POST"])(req, res);
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Access Denied",
    });
  });

  test("Should allow the request with an accepted method and Csrf Token", async () => {
    getCsrfToken.mockResolvedValueOnce("secretcsrfToken");
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": "secretcsrfToken",
      },
    });

    await csrfProtected(["POST"])(req, res);
    expect(res.statusCode).toBe(200);
  });
});

describe("Submit a form with csrf protection enable", () => {
  test("Should submit with the correct csrf token", async () => {
    getCsrfToken.mockResolvedValueOnce("correctCsrfTokenValue");
    mockedAxios.mockResolvedValue({
      status: 200,
      data: { received: true },
    });

    await submitToAPI(mockResponses, {
      props: {
        formRecord: {
          id: "test0form00000id000asdf11",
          form: TestForm,
          isPublished: true,
          deliveryOption: {
            emailAddress: "",
            emailSubjectEn: "",
            emailSubjectFr: "",
          },
          securityAttribute: "Unclassified",
        },
        language: "en",
        router: { push: jest.fn() },
      },
      setStatus: jest.fn(),
    });
    expect(mockedAxios.mock.calls.length).toBe(1);
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/submit", method: "POST" })
    );
    expect(mockedAxios.mock.calls[0][0].headers["X-CSRF-Token"]).toBe("correctCsrfTokenValue");
  });

  test("Should fail to submit with a null or an undefined Csrf token", async () => {
    getCsrfToken.mockResolvedValue(null);
    const mockedRouter = {
      push: jest.fn(() => {}),
    };
    const mockedFormik = {
      setStatus: jest.fn(() => {}),
      props: {
        formRecord: {
          id: "test0form00000id000asdf11",
          form: TestForm,
          isPublished: true,
          deliveryOption: {
            emailAddress: "",
            emailSubjectEn: "",
            emailSubjectFr: "",
          },
          securityAttribute: "Unclassified",
        },
        language: "en",
        router: mockedRouter,
      },
    };
    await submitToAPI(mockResponses, mockedFormik);
    expect(mockedFormik.setStatus).toBeCalledTimes(1);
    expect(mockedFormik.setStatus).toBeCalledWith("Error");
  });
});
