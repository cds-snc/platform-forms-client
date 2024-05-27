import { deepCopy, safeJSONParse, safeJSONStringify } from "@lib/utils";

describe("safeJSONParse function", () => {
  it("Errors with invalid JSON", () => {
    const invalidJSON = "{";
    const result = safeJSONParse(invalidJSON);
    expect(result).toEqual({ error: "JSON parse syntaxt error" });
  });
  it("Succeeds with valid JSON", () => {
    const validJSON = '["a", "b"]';
    const result = safeJSONParse(validJSON);
    expect(result).toEqual(["a", "b"]);
  });
});

describe("safeJSONStringify function", () => {
  it("Errors with an invalid object" , () => {
    const invalidObject= {bigInt:2n};
    const result = safeJSONStringify(invalidObject);
    expect(result).toEqual({ error: "JSON stringify type error" });
  });
  it("Succeeds with a valid object", () => {
    const validObject = ["a", "b"];
    const result = safeJSONStringify(validObject);
    expect(result).toEqual('["a","b"]');
  });
});

describe("deepCopy function", () => {
  it("Errors with an invalid object", () => {
    const invalidObject = {fn: () => {}};
    const result = deepCopy(invalidObject);
    expect(result).toEqual({ error: "deepCopy failed with structured clone error" });
  });
  it("Succeeds with a valid object", () => {
    const validObject = {level1: "one", level2: {two:"two", level3: {three: "three"}}};
    const result = deepCopy(validObject);
    expect(result).toEqual({level1: "one", level2: {two:"two", level3: {three: "three"}}});
    // Lets make sure this isn't a shallow copy where object references are used after level one
    validObject.level2.two = "NOT TWO";
    expect(result).toEqual({level1: "one", level2: {two:"two", level3: {three: "three"}}});
  });
});
