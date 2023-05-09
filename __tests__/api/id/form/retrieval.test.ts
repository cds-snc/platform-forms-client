/**
 * @jest-environment node
 */

import { createMocks } from "node-mocks-http";
import retrieval from "@pages/api/id/[form]/retrieval";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { prismaMock } from "@jestUtils";
import { logMessage } from "@lib/logger";
import jwt, { Secret } from "jsonwebtoken";

jest.mock("next-auth/next");
jest.mock("@lib/logger");
const mockLogMessage = jest.mocked(logMessage, { shallow: true });

const ddbMock = mockClient(DynamoDBDocumentClient);

// Skipping until API is reactivated.  Currently all methods are blocked from accessing.
describe.skip("/api/retrieval", () => {
  let dateNowSpy: jest.SpyInstance;
  beforeEach(() => {
    dateNowSpy = jest.spyOn(Date, "now");
    ddbMock.reset();
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  beforeAll(() => {
    process.env.TOKEN_SECRET = "gc-form-super-secret-code";
  });

  afterAll(() => {
    delete process.env.TOKEN_SECRET;
  });

  describe("all methods", () => {
    it("Should return 400 status code b/c formID is undefined", async () => {
      const token = jwt.sign(
        {
          email: "test@cds-snc.ca",
          formID: "test0form00000id000asdf11",
        },
        process.env.TOKEN_SECRET as Secret,
        {
          expiresIn: "1y",
        }
      );
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/22/retrieval",
          authorization: `Bearer ${token}`,
        },
        query: {
          form: undefined,
        },
      });
      await retrieval(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Bad Request" }));
    });

    it("Should return a status code 403 Missing or invalid bearer token because no record was found in db", async () => {
      const token = jwt.sign(
        {
          email: "test@cds-snc.ca",
          formID: "test0form00000id000asdf11",
        },
        process.env.TOKEN_SECRET as Secret,
        {
          expiresIn: "1y",
        }
      );

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/22/retrieval",
          authorization: `Bearer ${token}`,
        },
        query: {
          form: "14",
        },
      });

      //Mock bearer token not being found
      prismaMock.template.findUnique.mockResolvedValue(null);
      await retrieval(req, res);
      expect(res.statusCode).toBe(403);
    });
  });

  describe("GET", () => {
    it("Should return a list of form responses with 200 status code", async () => {
      const token = jwt.sign(
        {
          email: "test@cds-snc.ca",
          form: 1,
        },
        process.env.TOKEN_SECRET as Secret,
        {
          expiresIn: "1y",
        }
      );

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/retrieval?numRecords=2",
          authorization: `Bearer ${token}`,
        },
        query: {
          form: "22",
        },
      });
      // Mock good temporary token
      prismaMock.apiUser.findUnique.mockResolvedValue({
        id: "asdf",
        templateId: "22",
        email: "b@d.a",
        active: true,
        temporaryToken: token,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const dynamodbExpectedReponses = {
        Items: [
          {
            FormID: "1",
            SubmissionID: "12",
            FormSubmission: "true",
            SecurityAttribute: "Protected B",
          },
          {
            FormID: "1",
            SubmissionID: "21",
            FormSubmission: "true",
            SecurityAttribute: "Protected B",
          },
        ],
      };
      ddbMock.on(QueryCommand).resolves(dynamodbExpectedReponses);
      await retrieval(req, res);

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({
          responses: [
            {
              fileAttachments: [],
              formID: "1",
              submissionID: "12",
              formSubmission: "true",
              securityAttribute: "Protected B",
            },
            {
              fileAttachments: [],
              formID: "1",
              submissionID: "21",
              formSubmission: "true",
              securityAttribute: "Protected B",
            },
          ],
        })
      );
    });

    it("Should return a list of form responses that have been returned in a paginated way by the AWS DynamoDB SDK", async () => {
      const token = jwt.sign(
        {
          email: "test@cds-snc.ca",
          formID: "test0form00000id000asdf11",
        },
        process.env.TOKEN_SECRET as Secret,
        {
          expiresIn: "1y",
        }
      );

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/retrieval?numRecords=2",
          authorization: `Bearer ${token}`,
        },
        query: {
          form: "22",
        },
      });

      // Mock good temporary token
      prismaMock.apiUser.findUnique.mockResolvedValue({
        id: "asdf",
        templateId: "22",
        email: "b@d.a",
        active: true,
        temporaryToken: token,
        created_at: new Date(),
        updated_at: new Date(),
      });

      ddbMock
        .on(QueryCommand, {
          ExclusiveStartKey: undefined,
        })
        .resolves({
          Items: [
            {
              FormID: "test0form00000id000asdf11",
              SubmissionID: "1",
              FormSubmission: "true",
              SecurityAttribute: "Protected B",
            },
            {
              FormID: "test0form00000id000asdf11",
              SubmissionID: "2",
              FormSubmission: "true",
              SecurityAttribute: "Protected B",
            },
          ],
          LastEvaluatedKey: { submissionId: 1 },
        })
        .on(QueryCommand, {
          ExclusiveStartKey: { submissionId: 1 },
        })
        .resolves({
          Items: [
            {
              FormID: "test0form00000id000asdf11",
              SubmissionID: "3",
              FormSubmission: "true",
              SecurityAttribute: "Protected B",
            },
            {
              FormID: "test0form00000id000asdf11",
              SubmissionID: "4",
              FormSubmission: "true",
              SecurityAttribute: "Protected B",
            },
          ],
          LastEvaluatedKey: undefined,
        });

      await retrieval(req, res);

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({
          responses: [
            {
              fileAttachments: [],
              formID: "test0form00000id000asdf11",
              submissionID: "1",
              formSubmission: "true",
              securityAttribute: "Protected B",
            },
            {
              fileAttachments: [],
              formID: "test0form00000id000asdf11",
              submissionID: "2",
              formSubmission: "true",
              securityAttribute: "Protected B",
            },
            {
              fileAttachments: [],
              formID: "test0form00000id000asdf11",
              submissionID: "3",
              formSubmission: "true",
              securityAttribute: "Protected B",
            },
            {
              fileAttachments: [],
              formID: "test0form00000id000asdf11",
              submissionID: "4",
              formSubmission: "true",
              securityAttribute: "Protected B",
            },
          ],
        })
      );
    });

    it("Should return a list of 10 (max) form responses that have been returned in a paginated way by the AWS DynamoDB SDK", async () => {
      const token = jwt.sign(
        {
          email: "test@cds-snc.ca",
          formID: "test0form00000id000asdf11",
        },
        process.env.TOKEN_SECRET as Secret,
        {
          expiresIn: "1y",
        }
      );

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/retrieval?numRecords=2",
          authorization: `Bearer ${token}`,
        },
        query: {
          form: "22",
        },
      });

      // Mock good temporary token
      prismaMock.apiUser.findUnique.mockResolvedValue({
        id: "asdf",
        templateId: "22",
        email: "b@d.a",
        active: true,
        temporaryToken: token,
        created_at: new Date(),
        updated_at: new Date(),
      });

      ddbMock
        .on(QueryCommand)
        .resolvesOnce({
          Items: [
            {
              FormID: "test0form00000id000asdf11",
              SubmissionID: "1",
              FormSubmission: "true",
              SecurityAttribute: "Protected B",
            },
            {
              FormID: "test0form00000id000asdf11",
              SubmissionID: "2",
              FormSubmission: "true",
              SecurityAttribute: "Protected B",
            },
          ],
          LastEvaluatedKey: { submissionId: 1 },
        })
        .resolvesOnce({
          Items: [
            {
              FormID: "test0form00000id000asdf11",
              SubmissionID: "3",
              FormSubmission: "true",
              SecurityAttribute: "Protected B",
            },
            {
              FormID: "test0form00000id000asdf11",
              SubmissionID: "4",
              FormSubmission: "true",
              SecurityAttribute: "Protected B",
            },
            {
              FormID: "test0form00000id000asdf11",
              SubmissionID: "5",
              FormSubmission: "true",
              SecurityAttribute: "Protected B",
            },
            {
              FormID: "test0form00000id000asdf11",
              SubmissionID: "6",
              FormSubmission: "true",
              SecurityAttribute: "Protected B",
            },
          ],
          LastEvaluatedKey: { submissionId: 2 },
        })
        .resolvesOnce({
          Items: [
            {
              FormID: "test0form00000id000asdf11",
              SubmissionID: "7",
              FormSubmission: "true",
              SecurityAttribute: "Protected B",
            },
            {
              FormID: "test0form00000id000asdf11",
              SubmissionID: "8",
              FormSubmission: "true",
              SecurityAttribute: "Protected B",
            },
            {
              FormID: "test0form00000id000asdf11",
              SubmissionID: "9",
              FormSubmission: "true",
              SecurityAttribute: "Protected B",
            },
          ],
          LastEvaluatedKey: { submissionId: 3 },
        })
        .resolvesOnce({
          Items: [
            {
              FormID: "test0form00000id000asdf11",
              SubmissionID: "10",
              FormSubmission: "true",
              SecurityAttribute: "Protected B",
            },
          ],
          LastEvaluatedKey: { submissionId: 4 },
        })
        .resolves({
          Items: [
            {
              FormID: "test0form00000id000asdf11",
              SubmissionID: "11",
              FormSubmission: "true",
              SecurityAttribute: "Protected B",
            },
            {
              FormID: "test0form00000id000asdf11",
              SubmissionID: "12",
              FormSubmission: "true",
              SecurityAttribute: "Protected B",
            },
            {
              FormID: "test0form00000id000asdf11",
              SubmissionID: "13",
              FormSubmission: "true",
              SecurityAttribute: "Protected B",
            },
          ],
          LastEvaluatedKey: undefined,
        });

      await retrieval(req, res);

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({
          responses: [
            {
              fileAttachments: [],
              formID: "test0form00000id000asdf11",
              submissionID: "1",
              formSubmission: "true",
              securityAttribute: "Protected B",
            },
            {
              fileAttachments: [],
              formID: "test0form00000id000asdf11",
              submissionID: "2",
              formSubmission: "true",
              securityAttribute: "Protected B",
            },
            {
              fileAttachments: [],
              formID: "test0form00000id000asdf11",
              submissionID: "3",
              formSubmission: "true",
              securityAttribute: "Protected B",
            },
            {
              fileAttachments: [],
              formID: "test0form00000id000asdf11",
              submissionID: "4",
              formSubmission: "true",
              securityAttribute: "Protected B",
            },
            {
              fileAttachments: [],
              formID: "test0form00000id000asdf11",
              submissionID: "5",
              formSubmission: "true",
              securityAttribute: "Protected B",
            },
            {
              fileAttachments: [],
              formID: "test0form00000id000asdf11",
              submissionID: "6",
              formSubmission: "true",
              securityAttribute: "Protected B",
            },
            {
              fileAttachments: [],
              formID: "test0form00000id000asdf11",
              submissionID: "7",
              formSubmission: "true",
              securityAttribute: "Protected B",
            },
            {
              fileAttachments: [],
              formID: "test0form00000id000asdf11",
              submissionID: "8",
              formSubmission: "true",
              securityAttribute: "Protected B",
            },
            {
              fileAttachments: [],
              formID: "test0form00000id000asdf11",
              submissionID: "9",
              formSubmission: "true",
              securityAttribute: "Protected B",
            },
            {
              fileAttachments: [],
              formID: "test0form00000id000asdf11",
              submissionID: "10",
              formSubmission: "true",
              securityAttribute: "Protected B",
            },
          ],
        })
      );
    });

    it("Should return 500 status code if it fails to fetch/send command to dynamoDb", async () => {
      const token = jwt.sign(
        {
          formID: "test0form00000id000asdf12",
          email: "test@cds-snc.ca",
        },
        process.env.TOKEN_SECRET as Secret,
        {
          expiresIn: "1y",
        }
      );

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
          authorization: `Bearer ${token}`,
        },
        query: {
          form: "test0form00000id000asdf13",
        },
      });
      // Mock good temporary token
      prismaMock.apiUser.findUnique.mockResolvedValue({
        id: "asdf",
        templateId: "test0form00000id000asdf12",
        email: "b@d.a",
        active: true,
        temporaryToken: token,
        created_at: new Date(),
        updated_at: new Date(),
      });
      ddbMock.on(QueryCommand).rejects("I'm an Error");

      await retrieval(req, res);

      expect(res.statusCode).toBe(500);
    });

    it("Should return 200 status code and an empty list of form's responses", async () => {
      const token = jwt.sign(
        {
          formID: "test0form00000id000asdf13",
        },
        process.env.TOKEN_SECRET as Secret,
        {
          expiresIn: "1y",
        }
      );

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
          authorization: `Bearer ${token}`,
        },
        query: {
          form: "test0form00000id000asdf12",
        },
      });
      // Mock good temporary token
      prismaMock.apiUser.findUnique.mockResolvedValue({
        id: "asdf",
        templateId: "test0form00000id000asdf11",
        email: "b@d.a",
        active: true,
        temporaryToken: token,
        created_at: new Date(),
        updated_at: new Date(),
      });
      const dynamodbExpectedReponses = {
        Items: [],
      };
      ddbMock.on(QueryCommand).resolves(dynamodbExpectedReponses);
      await retrieval(req, res);

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ responses: [] });
    });
  });

  describe("DELETE", () => {
    it("Should delete a list of form responses with 200 status code and return ids deleted", async () => {
      dateNowSpy.mockReturnValue(1);
      const token = jwt.sign(
        {
          email: "test@cds-snc.ca",
          formID: "test0form00000id000asdf11",
        },
        process.env.TOKEN_SECRET as Secret,
        {
          expiresIn: "1y",
        }
      );

      const { req, res } = createMocks({
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/22/retrieval",
          authorization: `Bearer ${token}`,
        },
        body: ["dfhkwehfewhf", "fewfewfewfew"],
        query: {
          form: "22",
        },
      });
      // Mock good temporary token
      prismaMock.apiUser.findUnique.mockResolvedValue({
        id: "asdf",
        templateId: "22",
        email: "test@cds-snc.ca",
        active: true,
        temporaryToken: token,
        created_at: new Date(),
        updated_at: new Date(),
      });
      ddbMock.on(UpdateCommand).resolves;
      mockLogMessage.warn.mockImplementation(jest.fn());
      await retrieval(req, res);

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(["dfhkwehfewhf", "fewfewfewfew"]);
      expect(ddbMock.commandCalls(UpdateCommand).length).toBe(2);
      expect(mockLogMessage.info.mock.calls.length).toBe(1);
      expect(mockLogMessage.info.mock.calls[0][0]).toContain(
        `user:test@cds-snc.ca marked form responses [dfhkwehfewhf,fewfewfewfew] from form ID:22 as retrieved at:1 using token:${token}`
      );
    });

    it("Should return a 400 status code if the body is an empty array", async () => {
      const token = jwt.sign(
        {
          email: "test@cds-snc.ca",
          formID: "test0form00000id000asdf11",
        },
        process.env.TOKEN_SECRET as Secret,
        {
          expiresIn: "1y",
        }
      );

      const { req, res } = createMocks({
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/22/retrieval",
          authorization: `Bearer ${token}`,
        },
        body: [],
        query: {
          form: "22",
        },
      });
      // Mock good temporary token
      prismaMock.apiUser.findUnique.mockResolvedValue({
        id: "asdf",
        templateId: "22",
        email: "b@d.a",
        active: true,
        temporaryToken: token,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await retrieval(req, res);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "JSON Validation Error: instance does not meet minimum length of 1",
      });
    });

    it("Should return a 400 status code if the body is not a string array", async () => {
      const token = jwt.sign(
        {
          email: "test@cds-snc.ca",
          formID: "test0form00000id000asdf11",
        },
        process.env.TOKEN_SECRET as Secret,
        {
          expiresIn: "1y",
        }
      );

      const { req, res } = createMocks({
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/22/retrieval",
          authorization: `Bearer ${token}`,
        },
        body: [1, 2, 3],
        query: {
          form: "22",
        },
      });

      // Mock good temporary token
      prismaMock.apiUser.findUnique.mockResolvedValue({
        id: "asdf",
        templateId: "22",
        email: "b@d.a",
        active: true,
        temporaryToken: token,
        created_at: new Date(),
        updated_at: new Date(),
      });
      await retrieval(req, res);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error:
          "JSON Validation Error: instance[0] is not of a type(s) string,instance[1] is not of a type(s) string,instance[2] is not of a type(s) string",
      });
    });

    it("Should return a 400 status code if the body is not an array", async () => {
      const token = jwt.sign(
        {
          email: "test@cds-snc.ca",
          formID: "test0form00000id000asdf11",
        },
        process.env.TOKEN_SECRET as Secret,
        {
          expiresIn: "1y",
        }
      );

      const { req, res } = createMocks({
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/22/retrieval",
          authorization: `Bearer ${token}`,
        },
        body: {},
        query: {
          form: "22",
        },
      });

      // Mock good temporary token
      prismaMock.apiUser.findUnique.mockResolvedValue({
        id: "asdf",
        templateId: "22",
        email: "b@d.a",
        active: true,
        temporaryToken: token,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await retrieval(req, res);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "JSON Validation Error: instance is not of a type(s) array",
      });
    });

    it("Should return a 500 status code if a DynamoDB error occurs", async () => {
      const token = jwt.sign(
        {
          email: "test@cds-snc.ca",
          formID: "test0form00000id000asdf11",
        },
        process.env.TOKEN_SECRET as Secret,
        {
          expiresIn: "1y",
        }
      );

      const { req, res } = createMocks({
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/22/retrieval",
          authorization: `Bearer ${token}`,
        },
        body: ["dfdsfdsfds", "fsdfdsfsdf"],
        query: {
          form: "22",
        },
      });

      // Mock good temporary token
      prismaMock.apiUser.findUnique.mockResolvedValue({
        id: "asdf",
        templateId: "22",
        email: "b@d.a",
        active: true,
        temporaryToken: token,
        created_at: new Date(),
        updated_at: new Date(),
      });
      ddbMock
        .on(UpdateCommand, {
          Key: {
            SubmissionID: "fsdfdsfsdf",
            FormID: "22",
          },
        })
        .rejects("This is an Error")
        .on(UpdateCommand, {
          TableName: "Vault",
          Key: {
            SubmissionID: "dfdsfdsfds",
            FormID: "22",
          },
        }).resolves;

      mockLogMessage.warn.mockImplementation(jest.fn());
      mockLogMessage.error.mockImplementation(jest.fn());

      await retrieval(req, res);

      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Error on Server Side",
      });
      expect(mockLogMessage.warn.mock.calls.length).toBe(2);
      expect(mockLogMessage.warn.mock.calls[0][0]).toBe(
        "Some submissions were potentially not marked as retrieved"
      );
      expect(mockLogMessage.warn.mock.calls[1][0]).toBe(
        "The following submissions were not marked as retrieved: [fsdfdsfsdf]"
      );
      expect(mockLogMessage.error.mock.calls.length).toBe(1);
      expect(mockLogMessage.error.mock.calls[0][0]).toEqual(new Error("This is an Error"));
    });
  });
});
