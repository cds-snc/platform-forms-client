/**
 * @jest-environment node
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createMocks, RequestMethod } from "node-mocks-http";
import report from "pages/api/id/[form]/submission/report";
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { mockClient } from "aws-sdk-client-mock";
import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { prismaMock } from "@jestUtils";
import { Base, mockUserPrivileges } from "__utils__/permissions";
import { logEvent } from "@lib/auditLogs";
jest.mock("@lib/auditLogs");

jest.mock("next-auth/next");
//Needed in the typescript version of the test so types are inferred correctly
const mockGetSession = jest.mocked(getServerSession, { shallow: true });

const ddbMock = mockClient(DynamoDBDocumentClient);

const mockFunc = jest.fn();

jest.mock("@lib/integration/freshdesk", () => ({
  createTicket: jest.fn(() => {
    mockFunc();
  }),
}));

//

const mockedLogEvent = jest.mocked(logEvent, { shallow: true });

describe("Report problem with form submissions (without active session)", () => {
  it("Should not be able to use the API without an active session", async () => {
    const { req, res } = createMocks({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        managerEmail: "manager@cds-snc.ca",
        department: "department",
      },
    });

    await report(req, res);

    expect(res.statusCode).toEqual(401);
  });
});

describe("Report problem with form submissions (with active session)", () => {
  beforeEach(() => {
    const mockSession: Session = {
      expires: "1",
      user: {
        id: "1",
        email: "a@b.com",
        name: "Testing Forms",
        privileges: mockUserPrivileges(Base, { user: { id: "1" } }),
        acceptableUse: true,
        hasSecurityQuestions: true,
      },
    };

    mockGetSession.mockResolvedValue(mockSession);
  });

  afterEach(() => {
    mockGetSession.mockReset();
    ddbMock.reset();
  });

  it.each(["GET", "POST", "DELETE"])(
    "API should reject request if HTTP method is not valid",
    async (httpMethod) => {
      const { req, res } = createMocks({
        method: httpMethod as RequestMethod,
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          managerEmail: "manager@cds-snc.ca",
          department: "department",
        },
      });

      await report(req, res);

      expect(res.statusCode).toEqual(403);
    }
  );

  it("API should reject request if payload object entries is not valid (not an array)", async () => {
    const { req, res } = createMocks({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        entries: {
          key: "value",
        },
      },
    });

    await report(req, res);

    expect(res.statusCode).toEqual(400);
    expect(JSON.parse(res._getData())).toMatchObject({
      error: "JSON Validation Error: instance.entries is not of a type(s) array",
    });
  });

  it("API should reject request if payload is not valid (array of invalid strings)", async () => {
    const { req, res } = createMocks({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: { entries: ["value1", "value2", "value3"] },
    });

    await report(req, res);

    expect(res.statusCode).toEqual(400);
    expect(JSON.parse(res._getData()).error).toContain("does not match pattern");
  });

  it("API should reject request if payload contains more than 20 submission names", async () => {
    const { req, res } = createMocks({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      query: {
        form: 8,
      },
      body: { entries: Array(21).map(() => "06-02-a1b2") },
    });

    await report(req, res);

    expect(res.statusCode).toEqual(400);
    expect(JSON.parse(res._getData()).error).toContain("Too many submission names. Limit is 20.");
  });

  it("API should accept request if payload is valid", async () => {
    const { req, res } = createMocks({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      query: {
        form: 8,
      },
      body: { entries: ["06-02-a1b2"] },
    });

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      users: [
        {
          id: "1",
          name: "test",
        },
      ],
    });

    ddbMock.on(BatchGetCommand).resolves({
      Responses: {
        Vault: [
          {
            Name: "06-02-a1b2",
            Status: "New",
            ConfirmationCode: "c3f1277b-df86-4132-af7c-75bcee90db19",
          },
        ],
      },
    });

    await report(req, res);

    expect(res.statusCode).toEqual(200);
    expect(JSON.parse(res._getData())).toEqual({
      reportedSubmissions: ["06-02-a1b2"],
    });
    expect(mockFunc).toHaveBeenCalled();
    expect(mockedLogEvent).toHaveBeenCalledWith(
      "1",
      { id: "06-02-a1b2", type: "Response" },
      "IdentifyProblemResponse",
      "Identified problem response for form 8"
    );
  });

  it("API should accept request if payload is valid and contains optional language parameter", async () => {
    const { req, res } = createMocks({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      query: {
        form: 8,
      },
      body: { entries: ["06-02-a1b2"], language: "fr" },
    });

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      users: [
        {
          id: "1",
          name: "test",
        },
      ],
    });

    ddbMock.on(BatchGetCommand).resolves({
      Responses: {
        Vault: [
          {
            Name: "06-02-a1b2",
            Status: "New",
            ConfirmationCode: "c3f1277b-df86-4132-af7c-75bcee90db19",
          },
        ],
      },
    });

    await report(req, res);

    expect(res.statusCode).toEqual(200);
    expect(JSON.parse(res._getData())).toEqual({
      reportedSubmissions: ["06-02-a1b2"],
    });
    expect(mockFunc).toHaveBeenCalled();
    expect(mockedLogEvent).toHaveBeenCalledWith(
      "1",
      { id: "06-02-a1b2", type: "Response" },
      "IdentifyProblemResponse",
      "Identified problem response for form 8"
    );
  });

  it("API should skip submission names corresponding to submissions that have already been reported", async () => {
    const { req, res } = createMocks({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      query: {
        form: 8,
      },
      body: { entries: ["06-02-a1b2"] },
    });

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      users: [
        {
          id: "1",
          name: "test",
        },
      ],
    });

    ddbMock.on(BatchGetCommand).resolves({
      Responses: {
        Vault: [
          {
            Name: "06-02-a1b2",
            Status: "Problem",
            ConfirmationCode: "c3f1277b-df86-4132-af7c-75bcee90db19",
          },
        ],
      },
    });

    await report(req, res);

    expect(res.statusCode).toEqual(200);
    expect(JSON.parse(res._getData())).toEqual({
      submissionNamesAlreadyReported: ["06-02-a1b2"],
    });
    expect(ddbMock.commandCalls(TransactWriteCommand)).toStrictEqual([]);
    expect(mockFunc).not.toHaveBeenCalled();
    expect(mockedLogEvent).not.toHaveBeenCalled();
  });

  it("API should skip submission names that are not associated to any submission", async () => {
    const { req, res } = createMocks({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      query: {
        form: 8,
      },
      body: { entries: ["06-02-a1b2"] },
    });

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      users: [
        {
          id: "1",
          name: "test",
        },
      ],
    });

    ddbMock.on(BatchGetCommand).resolves({
      Responses: {
        Vault: [],
      },
    });

    await report(req, res);

    expect(res.statusCode).toEqual(200);
    expect(JSON.parse(res._getData())).toEqual({
      invalidSubmissionNames: ["06-02-a1b2"],
    });
    expect(ddbMock.commandCalls(TransactWriteCommand)).toStrictEqual([]);
    expect(mockFunc).not.toHaveBeenCalled();
    expect(mockedLogEvent).not.toHaveBeenCalled();
  });

  it("API request should fail if update/delete process did not succeed", async () => {
    const { req, res } = createMocks({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      query: {
        form: 8,
      },
      body: { entries: ["06-02-a1b2"] },
    });

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      users: [
        {
          id: "1",
          name: "test",
        },
      ],
    });

    ddbMock.on(BatchGetCommand).resolves({
      Responses: {
        Vault: [
          {
            Name: "06-02-a1b2",
            Status: "New",
            ConfirmationCode: "c3f1277b-df86-4132-af7c-75bcee90db19",
          },
        ],
      },
    });

    ddbMock.on(TransactWriteCommand).rejects({});

    await report(req, res);

    expect(res.statusCode).toEqual(500);
    expect(JSON.parse(res._getData()).error).toContain("Error on server side");
    expect(mockedLogEvent).not.toHaveBeenCalled();
  });
});
