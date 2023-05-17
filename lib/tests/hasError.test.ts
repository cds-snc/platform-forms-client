import { hasError } from "@lib/hasError";
import mockedAxios from "axios";

describe("Handles string values", () => {
  test("error single value array", () => {
    const message = "UsernameExistsException: An account with the given email already exists.";
    expect(hasError(["UsernameExistsException"], message)).toBe(true);
  });

  test("no error single value array", () => {
    const message = "CodeMismatchException: Invalid code provided, please try again.";
    expect(hasError(["UsernameExistsException"], message)).toBe(false);
  });

  test("error multiple value array", () => {
    const message = "CodeMismatchException: Invalid code provided, please try again.";
    expect(hasError(["UsernameExistsException", "CodeMismatchException"], message)).toBe(true);
  });

  test("no error multiple value array", () => {
    const message = "InternalServiceException: An error occurred.";
    expect(hasError(["UsernameExistsException", "CodeMismatchException"], message)).toBe(false);
  });

  test("error single string", () => {
    const message = "UsernameExistsException: An account with the given email already exists.";
    expect(hasError("UsernameExistsException", message)).toBe(true);
  });

  test("no error single string", () => {
    const message = "CodeMismatchException: Invalid code provided, please try again.";
    expect(hasError("UsernameExistsException", message)).toBe(false);
  });
});

describe("Handles Error messages", () => {
  test("contains error message", () => {
    const message = new Error(
      "UsernameExistsException: An account with the given email already exists."
    );
    expect(hasError(["UsernameExistsException"], message)).toBe(true);
  });

  test("doesn't contain error message", () => {
    const message = new Error("CodeMismatchException: Invalid code provided, please try again.");
    expect(hasError(["UsernameExistsException"], message)).toBe(false);
  });
});

describe("Handles Axios Error messages", () => {
  test("has axios error", () => {
    const error = {
      config: {},
      level: 50,
      response: {
        status: 400,
        statusText: "Bad Request",
        data: {
          message: "UsernameExistsException: An account with the given email already exists.",
        },
      },
      isAxiosError: true,
      toJSON: () => ({}),
    };

    expect(hasError(["UsernameExistsException"], error)).toBe(true);
  });

  test("doesn't have axios error", () => {
    const error = {
      config: {},
      level: 50,
      response: {
        status: 400,
        statusText: "Bad Request",
        data: {
          message: "CodeMismatchException: Invalid code provided, please try again.",
        },
      },
      isAxiosError: true,
      toJSON: () => ({}),
    };

    expect(hasError(["UsernameExistsException"], error)).toBe(false);
  });
});
