import markdown from "../markdown";

jest.mock("../dataLayer.tsx", () => ({
  extractFormData: jest.fn(() => ["one", "two", "three"]),
}));

describe("JSON to markdown", () => {
  const mockForm = {
    form: {
      titleEn: "I'm a title",
      titleFr: "Je suis une titre",
    },
    responses: {},
  };
  test("Renders title", () => {
    const response = markdown(mockForm);
    expect(response)
      .toEqual(expect.stringContaining("# I'm a title / Je suis une titre"))
      .toEqual(expect.stringContaining("one"))
      .toEqual(expect.stringContaining("two"))
      .toEqual(expect.stringContaining("three"));
  });
});
