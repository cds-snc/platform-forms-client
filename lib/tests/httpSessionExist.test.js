import { createMocks } from "node-mocks-http";
import client from "next-auth/client";
import isUserSessionExist from "../middleware/HttpSessionExist";

jest.mock("next-auth/client");

const handler = async (req, res) => {
  res.statusCode = 200;
};

describe("Test a session middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Shouldn't allow a request without an invalid session", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    await isUserSessionExist(handler)(req, res);
    expect(JSON.parse(res._getData()).error).toEqual("Access Denied");
    expect(res.statusCode).toBe(403);
  });

  it("Should reject POST request", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "test@cds.ca", name: "Testing session middleware", image: "null" },
    };
    client.getSession.mockReturnValueOnce(mockSession);
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    await isUserSessionExist(handler)(req, res);
    expect(res.statusCode).toBe(200);
  });
});
