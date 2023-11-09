import { cleanInput } from "../util";

describe("cleanInput", () => {
  it("adds spaces when angle brackets detected for string", () => {
    const cleaned = cleanInput("<mystring> more text");
    expect(cleaned).toEqual("< mystring > more text");
  });

  it("adds spaces when angle brackets detected for string with a number", () => {
    const cleaned = cleanInput("<123> more text");
    expect(cleaned).toEqual("< 123 > more text");
  });

  it("adds spaces when angle brackets detected for boolean", () => {
    const cleaned = cleanInput("<true> more text");
    expect(cleaned).toEqual("< true > more text");
  });

  it("adds spaces when angle brackets detected for array of strings", () => {
    const cleaned = cleanInput(["<1>", "<2 >", "< 3>"]);
    expect(cleaned).toEqual(["< 1 >", "< 2 >", "< 3 >"]);
  });

  it("adds spaces when angle brackets detected for object", () => {
    const cleaned = cleanInput({ a: "a string", b: "<b string>", c: "< c string>" });
    expect(cleaned).toEqual({ a: "a string", b: "< b string >", c: "< c string >" });
  });

  it("handles null", () => {
    const cleaned = cleanInput(null);
    expect(cleaned).toEqual(null);
  });

  it("handles undefined", () => {
    const cleaned = cleanInput(undefined);
    expect(cleaned).toEqual(undefined);
  });
});
