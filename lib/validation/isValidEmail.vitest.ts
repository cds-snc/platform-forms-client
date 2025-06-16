import { describe, it, expect } from "vitest";
import { isValidEmail } from "./isValidEmail";

describe("isValidEmail", () => {
  it("returns true for valid email addresses", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("user.name+tag+sorting@example.com")).toBe(true);
    expect(isValidEmail("x@x.au")).toBe(true);
    expect(isValidEmail("example-indeed@strange-example.com")).toBe(true);
  });

  it("returns false for invalid email addresses", () => {
    expect(isValidEmail("plainaddress")).toBe(false);
    expect(isValidEmail("@missingusername.com")).toBe(false);
    expect(isValidEmail("username@.com")).toBe(false);
    expect(isValidEmail("username@com")).toBe(false);
    expect(isValidEmail("username@domain..com")).toBe(false);
  });

  it("returns false for empty or undefined input", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
  });
});
