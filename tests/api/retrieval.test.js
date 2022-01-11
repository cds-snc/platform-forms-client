import { createMocks } from "node-mocks-http";
import client from "next-auth/client";
import retrieval from "../../pages/api/retrieval";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import executeQuery from "@lib/integration/queryManager";
import jwt from "jsonwebtoken";

jest.mock("next-auth/client");
jest.mock("@aws-sdk/client-dynamodb");
jest.mock("@lib/integration/queryManager");

jest.mock("@lib/integration/dbConnector", () => {
  const mockClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return jest.fn(() => mockClient);
});

const dynamoClient = {
  send: jest.fn(),
};

describe("/api/retrieval", () => {
  beforeAll(() => {
    process.env.TOKEN_SECRET = "gc-form-super-secret-code";
  });
  afterAll(() => {
    delete process.env.TOKEN_SECRET;
  });

  it("Should return 400 status code with a msg missing maxRecords query parameters", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "forms@cds.ca", name: "forms" },
    };
    const token = jwt.sign(
      {
        formID: 1,
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "1y",
      }
    );

    client.getSession.mockReturnValue(mockSession);

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000/api/retrieval?maxRecords=",
        authorization: `Bearer ${token}`,
      },
      query: {
        maxRecords: "",
      },
    });

    executeQuery.mockImplementation((client, sql) => {
      if (sql.includes("SELECT bearer_token as bearerToken FROM templates")) {
        return {
          rows: [{ bearerToken: token }],
          rowCount: 1,
        };
      }
    });
    await retrieval(req, res);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ error: "Invalid paylaod value found maxRecords" })
    );
  });

  it("Should return 400 status code with an invalid formID found ", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "forms@cds.ca", name: "forms" },
    };
    const token = jwt.sign(
      {
        formID: undefined,
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "1y",
      }
    );

    client.getSession.mockReturnValue(mockSession);

    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000/api/retrieval?maxRecords=1",
        authorization: `Bearer ${token}`,
      },
      query: {
        maxRecords: "1",
      },
    });

    executeQuery.mockImplementation((client, sql) => {
      if (sql.includes("SELECT bearer_token as bearerToken FROM templates")) {
        return {
          rows: [{ bearerToken: token }],
          rowCount: 1,
        };
      }
    });

    await retrieval(req, res);
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Bad Request" }));
  });

  it("Should return a list of form responses with 200 status code", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "forms@cds.ca", name: "forms" },
    };
    const token = jwt.sign(
      {
        formID: 1,
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "1y",
      }
    );
    client.getSession.mockReturnValue(mockSession);
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000/api/retrieval?maxRecords=2",
        authorization: `Bearer ${token}`,
      },
      query: {
        maxRecords: "2",
      },
    });

    executeQuery.mockImplementation((client, sql) => {
      if (sql.includes("SELECT bearer_token as bearerToken FROM templates")) {
        return {
          rows: [{ bearerToken: token }],
          rowCount: 1,
        };
      }
    });
    const dynamodbExpectedReponses = {
      Items: [
        { FormID: "1", SubmissionID: "12", FormSubmission: true },
        { FormID: "2", SubmissionID: "21", FormSubmission: true },
      ],
    };
    dynamoClient.send.mockImplementation(() => {
      return dynamodbExpectedReponses;
    });
    DynamoDBClient.mockReturnValue(dynamoClient);
    await retrieval(req, res);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        responses: [
          { FormID: "1", SubmissionID: "12", FormSubmission: true },
          { FormID: "2", SubmissionID: "21", FormSubmission: true },
        ],
      })
    );
  });

  it("Should return 500 status code whenever dynamodb throws an error", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "forms@cds.ca", name: "forms" },
    };
    const token = jwt.sign(
      {
        formID: 2,
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "1y",
      }
    );
    client.getSession.mockReturnValue(mockSession);
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000/api/retrieval?maxRecords=5",
        authorization: `Bearer ${token}`,
      },
      query: {
        maxRecords: "5",
      },
    });
    executeQuery.mockImplementation((client, sql) => {
      if (sql.includes("SELECT bearer_token as bearerToken FROM templates")) {
        return {
          rows: [{ bearerToken: token }],
          rowCount: 1,
        };
      }
    });
    DynamoDBClient.mockReturnValue(dynamoClient);
    dynamoClient.send.mockImplementation(() => {
      throw new Error("Error");
    });
    await retrieval(req, res);
    expect(res.statusCode).toBe(500);
  });

  it("Should return an empty list of form's responses with 200 status code", async () => {
    const mockSession = {
      expires: "1",
      user: { email: "forms@cds.ca", name: "forms" },
    };
    const token = jwt.sign(
      {
        formID: 3,
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "1y",
      }
    );
    client.getSession.mockReturnValue(mockSession);
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000/api/retrieval?maxRecords=10",
        authorization: `Bearer ${token}`,
      },
      query: {
        maxRecords: "10",
      },
    });
    executeQuery.mockImplementation((client, sql) => {
      if (sql.includes("SELECT bearer_token as bearerToken FROM templates")) {
        return {
          rows: [{ bearerToken: token }],
          rowCount: 1,
        };
      }
    });

    dynamoClient.send.mockImplementation(() => {
      return { Items: [] };
    });
    DynamoDBClient.mockReturnValue(dynamoClient);
    await retrieval(req, res);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ responses: [] }));
  });
});
