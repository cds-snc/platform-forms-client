import { createMocks } from "node-mocks-http";
import { cors } from "@lib/middleware";

jest.mock("next-auth/client");
const origin = "*";

describe("Test CORS implementation", () => {
  it("Should set access-control-allow-origin header", async () => {
    const allowedMethods = ["GET", "POST", "PUT", "DELETE"];
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        method: "POST",
      }),
    });

    await cors({ origin, allowedMethods })(req, res);
    expect(res.statusCode).toBe(200);

    expect(res.getHeaders()).toMatchObject({ "access-control-allow-origin": origin });
  });

  it("Should set accpeted methods", async () => {
    const allowedMethods = ["GET, POST, DELETE"];
    const { req, res } = createMocks({
      method: "OPTIONS",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
    });

    await cors({ origin, allowedMethods })(req, res);
    expect(res.statusCode).toBe(204);
    expect(res.getHeaders()).toMatchObject({
      "access-control-allow-methods": allowedMethods.toString(),
    });
  });
});
describe("Test non CORS implementation", () => {
  it("Should allow request method", async () => {
    const allowedMethods = ["GET", "POST", "PUT", "DELETE"];
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: "POST",
      }),
    });

    await cors({ origin, allowedMethods })(req, res);
    expect(res.statusCode).toBe(200);
  });

  it("Should reject non-accepted methods", async () => {
    const allowedMethods = ["GET, POST, DELETE"];
    const { req, res } = createMocks({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    await cors({ origin, allowedMethods })(req, res);
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res._getData()).error).toEqual("HTTP Method Forbidden");
  });
});
