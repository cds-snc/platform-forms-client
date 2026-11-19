import { describe, it, expect, vi } from "vitest";
import type { ValidationProperties } from "@gcforms/types";
import { isValidAddress } from "./isValidAddress";

describe("isValidAddress", () => {
  it.each([undefined, null, ""])("handles missing value %s before parsing", (value) => {
    expect(isValidAddress(value, { required: true })).toEqual({ code: "required" });
    expect(isValidAddress(value, { required: false })).toBeNull();
  });

  it("returns per-field errors when any address subfield is empty", () => {
    const validator: ValidationProperties = { required: true };
    const value = JSON.stringify({
      streetAddress: "",
      city: "Ottawa",
      province: "ON",
      postalCode: "K1A0B1",
    });
    const result = isValidAddress(value, validator);
    expect(result).toEqual({
      fields: {
        streetAddress: { code: "required" },
        city: null,
        province: null,
        postalCode: null,
      },
    });
  });

  it("returns null for a valid address object when required is true", () => {
    const validator: ValidationProperties = { required: true };
    const value = JSON.stringify({
      streetAddress: "123 Main St",
      city: "Ottawa",
      province: "ON",
      postalCode: "K1A0B1",
    });
    const result = isValidAddress(value, validator);
    expect(result).toBeNull();
  });

  it("returns null when required is false even if fields are empty", () => {
    const validator: ValidationProperties = { required: false };
    const value = JSON.stringify({
      streetAddress: "",
      city: "",
      province: "",
      postalCode: "",
    });
    const result = isValidAddress(value, validator);
    expect(result).toBeNull();
  });

  it.each<unknown>([
    "not a json string",
    "null",
    "[]",
    "123",
    "true",
    '"address"',
    false,
    0,
    {},
    {
      toString: () => {
        throw new Error("must not coerce");
      },
    },
    '{"streetAddress":123}',
    '{"city":null}',
    '{"province":false}',
    '{"postalCode":[]}',
    '{"country":123}',
    '{"city":{"toString":null}}',
  ])("rejects malformed value %j for required and optional addresses", (value) => {
    expect(isValidAddress(value, { required: true })).toEqual({ code: "mismatched-type" });
    expect(isValidAddress(value, { required: false })).toEqual({ code: "mismatched-type" });
  });

  it("keeps missing and whitespace-only fields as ordinary incomplete answers", () => {
    const value = '{"streetAddress":"  ","city":"Ottawa"}';
    expect(isValidAddress(value, { required: true })).toEqual({
      fields: {
        streetAddress: { code: "required" },
        city: null,
        province: { code: "required" },
        postalCode: { code: "required" },
      },
    });
    expect(isValidAddress(value, { required: false })).toBeNull();
  });

  it("does not suppress unexpected parser failures", () => {
    const error = new Error("unexpected parser failure");
    const parse = vi.spyOn(JSON, "parse").mockImplementation(() => {
      throw error;
    });
    try {
      expect(() => isValidAddress("{}", { required: true })).toThrow(error);
    } finally {
      parse.mockRestore();
    }
  });
});
