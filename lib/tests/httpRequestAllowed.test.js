import { createMocks } from "node-mocks-http";
import isRequestAllowed from "../middleware/httpRequestAllowed";
import client from "next-auth/client";

jest.mock("next-auth/client");

const middlewareHandler = async (req, res) => {
  res.statusCode = 200;
};

describe("Test Request methods with valid session", () => {
  beforeEach(() => {
    const mockSession = {
      expires: "1",
      user: { email: "a@b.com", name: "Testing Forms", image: "null" },
    };

    client.getSession.mockReturnValueOnce(mockSession);
  });
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

    await isRequestAllowed(allowedMethods, middlewareHandler)(req, res);

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

    await isRequestAllowed(allowedMethods, middlewareHandler)(req, res);
    expect(JSON.parse(res._getData()).error).toEqual("Forbidden");
    expect(res.statusCode).toBe(403);
  });
});

describe("Test Request methods without valid session", () => {
  it("Should reject request even though method is valid", async () => {
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

    await isRequestAllowed(allowedMethods, middlewareHandler)(req, res);
    expect(JSON.parse(res._getData()).error).toEqual("Forbidden");
    expect(res.statusCode).toBe(403);
  });
});
