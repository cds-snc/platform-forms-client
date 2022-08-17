import { createMocks } from "node-mocks-http";
import { validQueryParams } from "@lib/middleware";

describe("validQueryParams", () => {
  it("Should pass if query params are valid", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: {
        foo: "bar",
        answer: 42,
      },
    });
    const params = [
      { name: "foo", isValid: (value: string) => value === "bar" },
      { name: "answer", isValid: (value: number) => value === 42 },
    ];
    const result = await validQueryParams(params)(req, res);
    expect(result).toEqual({ next: true });
    expect(res.statusCode).toBe(200);
  });

  it("Should fail if a query param is not valid", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: {
        foo: null,
      },
    });
    const params = [
      { name: "foo", isValid: (value: string | undefined) => typeof value === "string" },
    ];
    const result = await validQueryParams(params)(req, res);
    expect(result).toEqual({ next: false });
    expect(res.statusCode).toBe(400);
  });
});
