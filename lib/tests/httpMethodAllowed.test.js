import { createMocks } from "node-mocks-http";
import isRequestAllowed from "../middleware/httpMethodAllowed";

jest.mock("next-auth/client");

describe("Test Request methods with valid session", () => {
  it("Should allow POST request", async () => {
    const allowedMethods = ["GET", "POST", "UPDATE", "DELETE"];
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

    await isRequestAllowed(allowedMethods)(req, res);

    expect(res.statusCode).toBe(200);
  });

  it("Should reject POST request", async () => {
    const allowedMethods = ["GET"];
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

    await isRequestAllowed(allowedMethods)(req, res);
    expect(JSON.parse(res._getData()).error).toEqual("HTTP Method Forbidden");
    expect(res.statusCode).toBe(403);
  });
});
