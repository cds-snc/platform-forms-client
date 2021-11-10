import { createMocks } from "node-mocks-http";
import client from "next-auth/client";
import { retrieve } from "../pages/api/id/[form]/bearer";

jest.mock("next-auth/client");

describe("Test Request methods with valid session", () => {
  beforeEach(() => {
    const mockSession = {
      expires: "1",
      user: { email: "admin@cds.ca", name: "Admin user", image: "null" },
    };

    client.getSession.mockReturnValueOnce(mockSession);
  });
  it.skip("Should allow GET request", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000/pages/api/id/1/[form]",
      },
      body: JSON.stringify({
        method: "GET",
      }),
    });
    retrieve(req, res);
    expect(res.statusCode).toBe(200);
  });
});
