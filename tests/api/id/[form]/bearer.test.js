import { createMocks } from "node-mocks-http";
import client from "next-auth/client";
import retrieve from "../../../../pages/api/id/[form]/bearer";
import executeQuery from "../../../../lib/integration/queryManager";

jest.mock("next-auth/client");
jest.mock("../../../../lib/integration/queryManager");

jest.mock("../../../../lib/integration/dbConnector", () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return jest.fn(() => mClient);
});

describe("Test bearer token retrieve API endpoint", () => {
  it("Should return an error 'Malformed API Request' 400 No formID was supplied", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "admin@cds.ca", name: "Admin user", image: "null" },
    };

    client.getSession.mockReturnValue(mockSession);

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000/api/id/8/bearer",
      },
      query: {
        form: "", //An empty form ID
      },
    });

    await retrieve(req, res);
    expect(JSON.parse(res._getData()).error).toEqual("Malformed API Request");
    expect(res.statusCode).toBe(400);
  });

  it("Should return a statusCode 200 and a Null as token's value associated to a given form (11).", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "admin@cds.ca", name: "Admin user", image: "null" },
    };
    client.getSession.mockReturnValue(mockSession);
    // Mocking executeQuery to return null as bearer token value
    executeQuery.mockReturnValue({ rows: [{ bearer_token: null }], rowCount: 1 });

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      query: {
        form: "11",
      },
    });

    await retrieve(req, res);
    expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ token: null }));
    expect(res.statusCode).toBe(200);
  });

  it("Should return a valid token associated to a form id = 12.", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "admin@cds.ca", name: "Admin user", image: "null" },
    };
    client.getSession.mockReturnValue(mockSession);
    // Mocking executeQuery to return a valid bearer token
    executeQuery.mockReturnValue({ rows: [{ bearer_token: "toekakdnaodk" }], rowCount: 1 });

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      query: {
        form: "12",
      },
    });

    await retrieve(req, res);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ token: "toekakdnaodk" }));
  });

  it("Shouldn't allow this request without a valid session", async () => {
    client.getSession.mockReturnValue(undefined);

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      query: {
        form: "45",
      },
    });

    await retrieve(req, res);
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Access Denied" }));
  });

  it("Should return 404 statusCode Not Found if an empty [] value was returned", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "admin@cds.ca", name: "Admin user", image: "null" },
    };
    client.getSession.mockReturnValue(mockSession);
    // Mocking executeQuery to return an empty array
    executeQuery.mockReturnValue({ rows: [], rowCount: 0 });

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      query: {
        form: "23",
      },
    });
    await retrieve(req, res);

    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res._getData()).error).toEqual("Not Found");
  });

  it("Should return 500 statusCode if there's an error", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "admin@cds.ca", name: "Admin user", image: "null" },
    };
    client.getSession.mockReturnValue(mockSession);
    // Mocking executeQuery to throw an error
    executeQuery.mockImplementation(() => {
      throw new Error("UnExcepted Error");
    });

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      query: {
        form: "101",
      },
    });

    await retrieve(req, res);
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res._getData()).error).toEqual("Error on Server Side");
  });
});
