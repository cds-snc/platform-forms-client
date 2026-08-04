import { describe, it, expect } from "vitest";
import type { ValidationProperties } from "@gcforms/types";
import { isValidAddress } from "./isValidAddress";

const t = (k: string) => k;

describe("isValidAddress", () => {
  it("returns required error when value is missing and required is true", () => {
    const validator: ValidationProperties = { required: true };
    const result = isValidAddress(undefined, validator, t);
    expect(result).toBe("input-validation.required");
  });

  it("returns required error when any address subfield is empty", () => {
    const validator: ValidationProperties = { required: true };
    const value = JSON.stringify({
      streetAddress: "",
      city: "Ottawa",
      province: "ON",
      postalCode: "K1A0B1",
    });
    const result = isValidAddress(value, validator, t);
    expect(result).toBe("input-validation.required");
  });

  it("returns null for a valid address object when required is true", () => {
    const validator: ValidationProperties = { required: true };
    const value = JSON.stringify({
      streetAddress: "123 Main St",
      city: "Ottawa",
      province: "ON",
      postalCode: "K1A0B1",
    });
    const result = isValidAddress(value, validator, t);
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
    const result = isValidAddress(value, validator, t);
    expect(result).toBeNull();
  });

  it("tolerates invalid JSON by treating non-empty raw value as present", () => {
    const validator: ValidationProperties = { required: true };
    const value = "not a json string";
    const result = isValidAddress(value, validator, t);
    expect(result).toBeNull();
  });
});
