import mockedAxios from "axios";
import { createMocks } from "node-mocks-http";
import { submitToAPI } from "../integration/helpers";
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
  test("Should pass with unprotected method GET", async () => {
    const { req, res } = createMocks({
      method: "GET",
    });

    await csrfProtected(["POST", "PUT"])(req, res);
    expect(res.statusCode).toBe(200);
  });

  test("Should fail with protected method POST and a different csrf token", async () => {
    getCsrfToken.mockReturnValueOnce("differentCsrfToken");
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
    getCsrfToken.mockReturnValueOnce(null);
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
    getCsrfToken.mockReturnValueOnce("secretcsrfToken");
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
    getCsrfToken.mockReturnValueOnce("correctCsrfTokenValue");
    mockedAxios.mockResolvedValue({
      status: 200,
      data: { received: true },
    });

    await submitToAPI(mockResponses, {
      props: {
        formRecord: TestForm,
        language: "en",
        router: { push: jest.fn() },
      },
      setStatus: jest.fn(),
    });
    expect(mockedAxios.mock.calls[0][0].headers["X-CSRF-Token"]).toBe("correctCsrfTokenValue");
  });

  test("Should fail to submit with a null or an undefined Csrf token", async () => {
    getCsrfToken.mockReturnValue(null);
    const mockedRouter = {
      push: jest.fn(() => {}),
    };
    const mockedFormik = {
      setStatus: jest.fn(() => {}),
      props: {
        formRecord: TestForm,
        language: "en",
        router: mockedRouter,
      },
    };
    await submitToAPI(mockResponses, mockedFormik);
    expect(mockedFormik.setStatus).toBeCalledTimes(1);
    expect(mockedFormik.setStatus).toBeCalledWith("Error");
  });
});
