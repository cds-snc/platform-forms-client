import { createMocks } from "node-mocks-http";
import client from "next-auth/client";
import owners from "../../../../pages/api/id/[form]/owners";
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

describe("Test Owners : retrieve list of emails API endpoint", () => {
  it("Shouldn't allow a request without a valid session", async () => {
    client.getSession.mockReturnValue(undefined);

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      query: {
        form: "1",
      },
    });

    await owners(req, res);
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Access Denied" }));
  });

  it("Should return an error 'Malformed API Request'", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "forms@cds.ca", name: "forms user" },
    };

    client.getSession.mockReturnValue(mockSession);
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      query: {
        form: "",
      },
    });

    await owners(req, res);
    expect(JSON.parse(res._getData()).error).toEqual("Malformed API Request FormID not define");
    expect(res.statusCode).toBe(400);
  });

  it("Should return all the emails associated with the form ID.", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "forms@cds.ca", name: "forms user" },
    };
    client.getSession.mockReturnValue(mockSession);
    // Mocking executeQuery to return a list of emails
    executeQuery.mockReturnValue({
      rows: [
        { id: "1", email: "test@cds.ca", active: "1" },
        { id: "2", email: "forms@cds.ca", active: "0" },
      ],
      rowCount: 2,
    });
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000/api/id/89/owners",
      },
      query: {
        form: "89",
      },
    });
    await owners(req, res);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining([
        { id: "1", email: "test@cds.ca", active: "1" },
        { id: "2", email: "forms@cds.ca", active: "0" },
      ])
    );
    expect(res.statusCode).toBe(200);
  });

  it("Should return a list that contains only one email", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "forms@cds.ca", name: "forms user" },
    };
    client.getSession.mockReturnValue(mockSession);
    // Mocking executeQuery to return a list with only an email
    executeQuery.mockReturnValue({
      rows: [{ id: "1", email: "oneEmail@cds.ca", active: "1" }],
      rowCount: 1,
    });
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000/api/id/1/owners",
      },
      query: {
        form: "1",
      },
    });
    await owners(req, res);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining([{ id: "1", email: "oneEmail@cds.ca", active: "1" }])
    );
    expect(res.statusCode).toBe(200);
  });

  it("Should return 404 form ID can't be found or a form has no emails associated", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "forms@cds.ca", name: "forms user" },
    };
    client.getSession.mockReturnValue(mockSession);
    // Mocking executeQuery to return an empty list
    executeQuery.mockReturnValue({ rows: [], rowCount: 0 });

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      query: {
        form: "99",
      },
    });

    await owners(req, res);
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ error: "Form Not Found" })
    );
  });

  it("Should return 500 as statusCode if there's db's error", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "forms@cds.ca", name: "forms" },
    };
    client.getSession.mockReturnValue(mockSession);
    // Mocking executeQuery to throw an error
    executeQuery.mockImplementation(() => {
      throw new Error("Error");
    });

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000/api/id/33/owners",
      },
      query: {
        form: "33",
      },
    });

    await owners(req, res);
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res._getData()).error).toEqual("Error on Server Side");
  });
});
