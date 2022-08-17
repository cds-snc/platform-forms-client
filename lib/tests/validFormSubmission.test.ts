import { createMocks } from "node-mocks-http";
import { validFormSubmission } from "@lib/middleware";
import { getFormSubmission } from "@lib/formSubmission";

jest.mock("@lib/formSubmission");
const mockGetFormSubmission = jest.mocked(getFormSubmission, true);

beforeEach(() => {
  jest.resetAllMocks();
});

describe("validFormSubmission", () => {
  it("Should pass if a form submission is found", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: {
        form: "1",
        submission: "2",
      },
    });
    mockGetFormSubmission.mockImplementation(() => Promise.resolve("hello there"));
    const result = await validFormSubmission("form", "submission")(req, res);
    expect(result).toEqual({ next: true, props: { formSubmission: "hello there" } });
    expect(res.statusCode).toBe(200);
  });

  it("Should fail no form submission is found", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: {
        form: "3",
        submission: "4",
      },
    });
    mockGetFormSubmission.mockImplementation(() => Promise.resolve(undefined));
    const result = await validFormSubmission("form", "submission")(req, res);
    expect(result).toEqual({ next: false });
    expect(res.statusCode).toBe(400);
  });
});
