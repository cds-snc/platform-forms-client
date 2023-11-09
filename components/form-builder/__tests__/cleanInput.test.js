import { cleanInput } from "../util";

const template = {
  layout: [1],
  brand: {
    name: "cds",
    urlEn: "https://digital.canada.ca",
    urlFr: "https://numerique.canada.ca",
    logoEn: "/img/branding/cds-en.svg",
    logoFr: "/img/branding/cds-fr.svg",
    logoTitleEn: "Canadian Digital Service",
    logoTitleFr: "Service numérique canadien",
  },
};

describe("cleanInput", () => {
  it("adds spaces when angle brackets detected for string", () => {
    const cleaned = cleanInput("<mystring> more text");
    expect(cleaned).toEqual("< mystring > more text");
  });

  it("adds spaces when angle brackets detected for string with a number", () => {
    const cleaned = cleanInput("<123 > more text");
    expect(cleaned).toEqual("< 123 > more text");
  });

  it("adds spaces when angle brackets detected and string contains non alphanum chars", () => {
    const cleaned = cleanInput("<mystr.,*$% ing> more text");
    expect(cleaned).toEqual("< mystr.,*$% ing > more text");
  });

  it("adds spaces when angle brackets detected for boolean", () => {
    const cleaned = cleanInput("<true> more text");
    expect(cleaned).toEqual("< true > more text");
  });

  it("leaves string alone if opening angle bracket has a space after", () => {
    const cleaned = cleanInput("< mystring> more text");
    expect(cleaned).toEqual("< mystring> more text");
  });

  it("leaves the string alone if there's only one bracket", () => {
    const cleaned = cleanInput("<mystring more text");
    expect(cleaned).toEqual("<mystring more text");
  });

  it("adds spaces when angle brackets detected for array of strings", () => {
    const cleaned = cleanInput(["<1>", "<2 >", "< 3>", "<3"]);
    expect(cleaned).toEqual(["< 1 >", "< 2 >", "< 3>", "<3"]);
  });

  it("adds spaces when angle brackets detected for object", () => {
    const cleaned = cleanInput({
      a: "a string",
      b: "<b string>",
      c: "< c string>",
      d: "<d string >",
      e: "< string",
      f: "string >",
    });
    expect(cleaned).toEqual({
      a: "a string",
      b: "< b string >",
      c: "< c string>",
      d: "< d string >",
      e: "< string",
      f: "string >",
    });
  });

  it("handles null", () => {
    const cleaned = cleanInput(null);
    expect(cleaned).toEqual(null);
  });

  it("handles undefined", () => {
    const cleaned = cleanInput(undefined);
    expect(cleaned).toEqual(undefined);
  });

  it("handles boolean", () => {
    const cleaned = cleanInput(true);
    expect(cleaned).toEqual(true);
  });

  it("handles number", () => {
    const cleaned = cleanInput(1);
    expect(cleaned).toEqual(1);
  });

  it("handles template with branding", () => {
    const cleaned = cleanInput(template);
    expect(cleaned).toEqual(template);
  });
});
