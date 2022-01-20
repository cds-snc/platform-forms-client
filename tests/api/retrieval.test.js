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

  it("Should return 400 status code b/c formID is an empty string", async () => {
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
        Origin: "http://localhost:3000",
        authorization: `Bearer ${token}`,
      },
      query: {
        maxRecords: "10",
        formID: "",
      },
    });
    await retrieval(req, res);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Bad Request" }));
  });

  it("Should return 400 status code b/c formID is undefined", async () => {
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
        Origin: "http://localhost:3000",
        authorization: `Bearer ${token}`,
      },
      query: {
        maxRecords: "10",
        formID: undefined,
      },
    });
    await retrieval(req, res);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Bad Request" }));
  });

  it("Should return 400 status code with Invalid paylaod value found maxRecords ", async () => {
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
        maxRecords: "11",
        formID: "22",
      },
    });
    await retrieval(req, res);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ error: "Invalid paylaod value found maxRecords" })
    );
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
        maxRecords: "8",
        formID: "22",
      },
    });
    executeQuery.mockImplementation((client, sql) => {
      if (
        sql.includes(
          "SELECT active FROM form_users WHERE template_id = ($1) and email = ($2) and active = true"
        )
      ) {
        return {
          rows: [{ active: true }],
          rowCount: 1,
        };
      }
    });
    const dynamodbExpectedReponses = {
      Items: [
        { FormID: { S: "1" }, SubmissionID: { S: "12" }, FormSubmission: true },
        { FormID: { S: "2" }, SubmissionID: { S: "21" }, FormSubmission: true },
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
          { FormID: { S: "1" }, SubmissionID: { S: "12" }, FormSubmission: true },
          { FormID: { S: "2" }, SubmissionID: { S: "21" }, FormSubmission: true },
        ],
      })
    );
  });

  it("Should return a status code 403 Missing or invalid bearer token because no record was found in db", async () => {
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
        Origin: "http://localhost:3000",
        authorization: `Bearer ${token}`,
      },
      query: {
        maxRecords: "10",
        formID: "14",
      },
    });

    executeQuery.mockImplementation((client, sql) => {
      if (
        sql.includes(
          "SELECT active FROM form_users WHERE template_id = ($1) and email = ($2) and active = true"
        )
      ) {
        return {
          rows: [{}],
          rowCount: 1,
        };
      }
    });

    await retrieval(req, res);
    expect(res.statusCode).toBe(403);
  });

  it("Should return 500 status code if it fails to fetch/send command to dynamoDb", async () => {
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
        Origin: "http://localhost:3000",
        authorization: `Bearer ${token}`,
      },
      query: {
        maxRecords: "5",
        formID: "23",
      },
    });

    executeQuery.mockImplementation((client, sql) => {
      if (
        sql.includes(
          "SELECT active FROM form_users WHERE template_id = ($1) and email = ($2) and active = true"
        )
      ) {
        return {
          rows: [{ active: true }],
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

  it("Should return 200 status code and an empty list of form's responses", async () => {
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
        Origin: "http://localhost:3000",
        authorization: `Bearer ${token}`,
      },
      query: {
        maxRecords: "10",
        formID: "12",
      },
    });
    executeQuery.mockImplementation((client, sql) => {
      if (
        sql.includes(
          "SELECT active FROM form_users WHERE template_id = ($1) and email = ($2) and active = true"
        )
      ) {
        return {
          rows: [{ active: true }],
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
