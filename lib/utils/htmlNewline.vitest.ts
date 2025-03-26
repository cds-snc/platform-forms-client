import { describe, it, expect } from "vitest";
import { newLineToHtml } from "./newLineToHtml";

describe("htmlNewline", () => {
  it("should replace \n with <br />", () => {
    const str = "a\nb\nc\nd\n";
    const result = newLineToHtml(str);
    expect(result).toBe("a<br />b<br />c<br />d<br />");
  });

  it("should return string without line breaks", () => {
    const str = "abcd";
    const result = newLineToHtml(str);
    expect(result).toBe("abcd");
  });

  it("should handle arrays", () => {
    const result = newLineToHtml(["a", "b", "c", "d"]);
    expect(result).toBe("a,b,c,d");
  });
});
