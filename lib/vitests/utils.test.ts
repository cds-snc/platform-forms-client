import { safeParse } from "@lib/utils";

describe("safeParse function", () => {
  it("Errors with invalid JSON", () => {
    const invalidJSON = "{";
    const result = safeParse(invalidJSON);
    expect(result).toEqual({ error: "JSON parse error" });
  });
  it("Succeeds with valid JSON", () => {
    const validJSON = '["a", "b"]';
    const result = safeParse(validJSON);
    expect(result).toEqual(["a", "b"]);
  });
});
