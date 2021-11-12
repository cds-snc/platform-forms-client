import { createMocks } from "node-mocks-http";
import client from "next-auth/client";
import { retrieve } from "../pages/api/id/[form]/bearer";
import fetchMock from "jest-fetch-mock";

jest.mock("next-auth/client");

describe("Test bearer token retrieve api endpoint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.enableMocks();
  });

  it("Shouldn't allow GET request without a valid form's id", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "admin2@cds.ca", name: "Admin2 user", image: "null" },
    };

    client.getSession.mockReturnValueOnce(mockSession);
    fetchMock.mockResponseOnce(JSON.stringify({ token: "akalkdfljasdlkfdsljasfdskfj" }));

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000/api/id/1/bearer",
        body: JSON.stringify({}),
      },
    });

    await retrieve(req, res);

    expect(res.statusCode).toBe(400);
  });

  it("Shouldn't allow a request without a valid session", async () => {
    client.getSession.mockReturnValueOnce(undefined);
    fetchMock.mockResponseOnce(JSON.stringify({}));

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000/api/id/11/bearer",
        body: JSON.stringify({}),
      },
      query: {
        form: "11",
      },
    });

    await retrieve(req, res);

    expect(res.statusCode).toBe(403);
  });

  it("Should allow a request and return Not found (400) resource", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "admin1@cds.ca", name: "Admin1 user", image: "null" },
    };

    client.getSession.mockReturnValueOnce(mockSession);
    fetchMock.mockResponseOnce(JSON.stringify({ error: "Not Found" }));

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000/api/id/11/bearer",
        body: JSON.stringify({}),
      },
      query: {
        form: "11",
      },
    });
    await retrieve(req, res);
    expect(res.statusCode == 400);
  });

  it("Should return a valid token", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "admin1@cds.ca", name: "Admin1 user", image: "null" },
    };

    client.getSession.mockReturnValueOnce(mockSession);
    fetchMock.mockResponseOnce(JSON.stringify({ token: "ajflajslfjlslajlsfjsldflaf" }));

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000/api/id/11/bearer",
        body: JSON.stringify({}),
      },
      query: {
        form: "11",
      },
      body: {
        token: "ajflajslfjlslajlsfjsldflaf",
      },
    });

    await retrieve(req, res);
    expect(res.body);
  });
});
