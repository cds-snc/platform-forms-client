import { hasError } from "@lib/hasError";

describe("Extract Form data", () => {
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
