import { describe, it, expect } from "vitest";
import { htmlNewline } from "./htmlNewline";

describe("htmlNewline", () => {
  it("should replace \n with <br />", () => {
    const str = "a\nb\nc\nd\n";
    const result = htmlNewline(str);
    expect(result).toBe("a<br />b<br />c<br />d<br />");
  });

  it("should return string without line breaks", () => {
    const str = "abcd";
    const result = htmlNewline(str);
    expect(result).toBe("abcd");
  });

  it("should handle arrays", () => {
    const result = htmlNewline(["a", "b", "c", "d"]);
    expect(result).toBe("a,b,c,d");
  });
});
