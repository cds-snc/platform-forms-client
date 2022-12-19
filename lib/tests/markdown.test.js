import markdown from "../markdown";

jest.mock("../helpers", () => ({
  extractFormData: jest.fn(() => ["one", "two", "three"]),
  rehydrateFormResponses: jest.fn(() => null),
}));

describe("JSON to markdown", () => {
  const mockForm = {
    form: {
      form: {
        titleEn: "I'm a title",
        titleFr: "Je suis une titre",
      },
    },
    responses: {},
  };
  test("Renders title", () => {
    const response = markdown(mockForm);
    expect(response).toEqual(expect.stringContaining("# I'm a title / Je suis une titre"));
    expect(response).toEqual(expect.stringContaining("one"));
    expect(response).toEqual(expect.stringContaining("two"));
    expect(response).toEqual(expect.stringContaining("three"));
  });
});

describe("Custom email subject - JSON to markdown", () => {
  const mockForm = {
    form: {
      form: {
        titleEn: "I'm a title",
        titleFr: "Je suis une titre",
        emailSubjectEn: "I'm an email subject title",
        emailSubjectFr: "Je suis une couriel sujet titre",
      },
    },
    responses: {},
  };
  test("Renders email subject", () => {
    const response = markdown(mockForm);
    expect(response).toMatch(/# I'm an email subject title \/ Je suis une couriel sujet titre/);
    expect(response).toMatch(/one/);
    expect(response).toMatch(/two/);
    expect(response).toMatch(/three/);
  });
});
