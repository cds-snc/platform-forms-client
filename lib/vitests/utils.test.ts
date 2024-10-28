import { expect } from 'vitest'
import { safeJSONParse } from "@lib/utils";
import validFormTemplate from "../../__fixtures__/testDataWithGroups.json";

describe("safeParse function", () => {
  it("Errors with invalid JSON", () => {
    const invalidJSON = "{";
    const result = safeJSONParse(invalidJSON);
    expect(result).toEqual(undefined);
  });
  it("Succeeds with valid JSON", () => {
    const validJSON = '["a", "b"]';
    const result = safeJSONParse(validJSON);
    expect(result).toEqual(["a", "b"]);
  });
  it("Succeeds with valid JSON Forms File", () => {
    const jsonString = JSON.stringify(validFormTemplate);
    const result = safeJSONParse(jsonString);
    expect(result).toEqual(validFormTemplate);
  });
});
