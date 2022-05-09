import mockedAxios from "axios";
import { createMocks } from "node-mocks-http";
import { submitToAPI } from "../integration/helpers";
import { logMessage } from "@lib/logger";
import TestForm from "./testData";
import { getCsrfToken } from "next-auth/client";
import { csrfProtected } from "@lib/middleware/csrfProtected";

jest.mock("axios");
jest.mock("next-auth/client");

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
  let mockedConsoleError;
  beforeEach(() => {
    mockedConsoleError = jest.spyOn(logMessage, "error");
    mockedConsoleError.mockImplementation(() => {});
  });
  afterEach(() => {
    mockedConsoleError.mockRestore();
    getCsrfToken.mockRestore();
  });

  test("Should fail with code 405 Method Not Allowed", async () => {
    const { req, res } = createMocks({
      method: "POST",
    });
    jest.spyOn(logMessage, "error");

    await csrfProtected(["GET"])(req, res);
    expect(res.statusCode).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Method Not Allowed",
    });
  });

  test("Should fail with unallowed method GET and a valid csrf token", async () => {
    getCsrfToken.mockReturnValueOnce("csrfToken");
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": "csrfToken",
      },
    });
    jest.spyOn(logMessage, "error");

    await csrfProtected(["GET"])(req, res);
    expect(res.statusCode).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Method Not Allowed",
    });
  });

  test("Should fail with null csrf token", async () => {
    getCsrfToken.mockReturnValueOnce(null);
    const { req, res } = createMocks({
      method: "POST",
    });
    jest.spyOn(logMessage, "error");

    await csrfProtected(["POST"])(req, res);
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Malformed API Request",
    });
  });

  test("Should allow the request with valid method and csrf", async () => {
    getCsrfToken.mockReturnValueOnce("csrfToken");
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": "csrfToken",
      },
    });
    jest.spyOn(logMessage, "error");

    await csrfProtected(["POST"])(req, res);
    expect(res.statusCode).toBe(200);
  });
});

describe("Submit a form with csrf protection enable", () => {
  let mockedConsoleError;
  beforeEach(() => {
    mockedConsoleError = jest.spyOn(logMessage, "error");
    mockedConsoleError.mockImplementation(() => {});
  });
  afterEach(() => {
    mockedConsoleError.mockRestore();
  });

  test("Should submit with the correct csrf token", async () => {
    getCsrfToken.mockReturnValueOnce("correctCsrfTokenValue");
    mockedAxios.mockResolvedValue({
      status: 200,
      data: { received: true },
    });

    await submitToAPI(mockResponses, {
      props: {
        formConfig: TestForm,
        language: "en",
        router: { push: jest.fn() },
      },
      setStatus: jest.fn(),
    });
    expect(mockedAxios.mock.calls[0][0].headers["X-CSRF-Token"]).toBe("correctCsrfTokenValue");
  });

  test("Should fail to submit with an undefined Csrf token", async () => {
    getCsrfToken.mockReturnValue(null);
    const mockedRouter = {
      push: jest.fn(() => {}),
    };
    const mockedFormik = {
      setStatus: jest.fn(() => {}),
      props: {
        formConfig: TestForm,
        language: "en",
        router: mockedRouter,
      },
    };
    await submitToAPI(mockResponses, mockedFormik);
    expect(mockedFormik.setStatus).toBeCalledTimes(1);
    expect(mockedFormik.setStatus).toBeCalledWith("Error");
  });
});
