import { safeJSONParse } from "@lib/utils";

describe("safeParse function", () => {
  it("Errors with invalid JSON", () => {
    const invalidJSON = "{";
    const result = safeJSONParse(invalidJSON);
    expect(result).toEqual({ error: "JSON parse error" });
  });
  it("Succeeds with valid JSON", () => {
    const validJSON = '["a", "b"]';
    const result = safeJSONParse(validJSON);
    expect(result).toEqual(["a", "b"]);
  });
});
