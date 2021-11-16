import { createMocks } from "node-mocks-http";
import client from "next-auth/client";
import { retrieve } from "../pages/api/id/[form]/bearer";
import queryManager from "../lib/integration/queryManager";

jest.mock("../lib/integration/dbConnector", () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return jest.fn(() => mClient);
});

jest.mock("next-auth/client");

describe("Test bearer token retrieve API endpoint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should return an error 'Malformed API Request' 400 No formID was supplied", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "admin@cds.ca", name: "Admin user", image: "null" },
    };

    client.getSession.mockReturnValueOnce(mockSession);

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      query: {
        form: "", //An empty form ID
      },
    });

    await retrieve(req, res);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ error: "Malformed API Request" })
    );
  });

  it("Should return a statusCode 200 and a Null as token's value associated to a given form (11).", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "admin@cds.ca", name: "Admin user", image: "null" },
    };
    client.getSession.mockReturnValueOnce(mockSession);
    const data = [{ bearer_token: null }];
    // Mocking query manager
    jest.spyOn(queryManager, "getResult").mockReturnValue(data);
    jest.spyOn(queryManager, "executeQuery").mockReturnValue({ rows: [], rowCount: 0 });

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
    client.getSession.mockReturnValueOnce(mockSession);
    // Query result
    const data = [{ bearer_token: "toekakdnaodk" }];
    // Mocking query manager
    jest.spyOn(queryManager, "getResult").mockReturnValue(data);
    jest
      .spyOn(queryManager, "executeQuery")
      .mockReturnValue({ rows: [{ bearer_token: "toekakdnaodk" }], rowCount: 1 });

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

  it("Shouldn't allow this request go through withoud a session", async () => {
    client.getSession.mockReturnValueOnce(undefined);

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
    const expectedValue = { error: "Access Denied" };
    expect(JSON.parse(res._getData())).toEqual(expect.objectContaining(expectedValue));
  });

  it("Should return 404 statusCode Not Found if an empty [] value was found", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "admin@cds.ca", name: "Admin user", image: "null" },
    };
    client.getSession.mockReturnValueOnce(mockSession);
    // Mocking query manager
    jest.spyOn(queryManager, "getResult").mockReturnValue([]);
    jest.spyOn(queryManager, "executeQuery").mockReturnValue({ rows: [], rowCount: 0 });

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
    expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Not Found" }));
  });

  it("It Should return 500 statusCode if there an error happens", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "admin@cds.ca", name: "Admin user", image: "null" },
    };
    client.getSession.mockReturnValueOnce(mockSession);
    // Mocking query manager to throw an error
    jest.spyOn(queryManager, "getResult").mockImplementation(() => {
      throw new Error("UnExcepted Error");
    });

    jest.spyOn(queryManager, "executeQuery").mockImplementation(() => {
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
  });
});
