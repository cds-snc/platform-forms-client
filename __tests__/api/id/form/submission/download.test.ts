/**
 * @jest-environment node
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createMocks, RequestMethod } from "node-mocks-http";
import { getServerSession } from "next-auth/next";
import download from "@pages/api/id/[form]/[submission]/download";
import { Session } from "next-auth";
import { Base, getUserPrivileges } from "__utils__/permissions";
import { prismaMock } from "@jestUtils";
import Redis from "ioredis-mock";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { EventEmitter } from "events";
import testFormConfig from "../../../../../__fixtures__/accessibilityTestForm.json";
import initialSettings from "../../../../../flag_initialization/default_flag_settings.json";
import { logMessage } from "@lib/logger";

jest.mock("next-auth/next");

const ddbMock = mockClient(DynamoDBDocumentClient);

// Mock your i18n
jest.mock("next-i18next", () => ({
  appWithTranslation: (component: any) => {
    return component;
  },
}));

const redis = new Redis();

jest.mock("@lib/integration/redisConnector", () => ({
  getRedisInstance: jest.fn(() => redis),
}));

jest.mock("@lib/cache/flags", () => {
  const originalModule = jest.requireActual("@lib/cache/flags");
  return {
    __esModule: true,
    ...originalModule,
    checkOne: jest.fn((flag) => {
      if (flag === "vault") return true;
      return (initialSettings as Record<string, boolean>)[flag];
    }),
  };
});

//Needed in the typescript version of the test so types are inferred correclty
const mockGetSession = jest.mocked(getServerSession, { shallow: true });
const testFormTemplate = {
  id: "testForm",
  form: testFormConfig,
  isPublished: true,
};
const testFormResponse = JSON.stringify({
  2: "Jane Doe",
  3: "English",
  5: "Home Sweet Home",
  6: "",
  7: "Sweet but tangy",
  8: "Driveway",
  9: "",
  10: [
    {
      0: "Sugar",
      1: "2 lbs",
    },
    {
      0: "Lemons",
      1: "4 lbs",
    },
  ],
  12: ["Cups", "Napkins"],
  14: "Yes",
});

describe("/api/id/[form]/[submission]/download", () => {
  describe("Requires a valid session to access API", () => {
    test.each(["GET"])("Shouldn't allow a request without a valid session", async (httpVerb) => {
      const { req, res } = createMocks({
        method: httpVerb as RequestMethod,
        headers: {
          "Content-Type": "application/json",
        },
        query: {
          form: "1",
        },
      });

      await download(req, res);
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res._getData())).toMatchObject({ error: "Unauthorized" });
    });
    test.each(["POST", "DELETE", "PATCH"])(
      "Shouldn't allow an unaccepted method",
      async (httpVerb) => {
        const { req, res } = createMocks({
          method: httpVerb as RequestMethod,
          headers: {
            "Content-Type": "application/json",
          },
          query: {
            form: "1",
          },
        });

        await download(req, res);
        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res._getData())).toMatchObject({ error: "HTTP Method Forbidden" });
      }
    );
  });
  describe("Download form submission as a html file", () => {
    beforeEach(() => {
      const mockSession: Session = {
        expires: "1",
        user: {
          id: "1",
          email: "forms@cds.ca",
          name: "forms user",
          privileges: getUserPrivileges(Base, { user: { id: "1" } }),
        },
      };

      mockGetSession.mockResolvedValue(mockSession);
    });
    afterEach(() => {
      mockGetSession.mockReset();
      ddbMock.reset();
    });
    test.each([
      { form: "a" },
      { submission: "a" },
      {},
      { form: ["a", "b"], submission: "asdf" },
      { form: "asdf", submission: ["a", "b"] },
    ])("Should not allow bad query parameters", async ({ form, submission }) => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        query: {
          form,
          submission,
        },
      });

      await download(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toMatchObject({ error: "Bad Request" });
    });
    test("User can only access form responses that a user is associated to", async () => {
      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: "formTestID",
        jsonConfig: testFormTemplate,
        users: [{ id: "2" }],
      });

      const { req, res } = createMocks({
        method: "GET",
        url: "/api/id/formtestID/123456789",
        query: {
          form: "formTestID",
          submission: "123456789",
        },
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      });
      await download(req, res);

      expect(res.statusCode).toBe(403);
    });
    test("Renders a HTML file", async () => {
      // Data mocks
      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: "formTestID",
        jsonConfig: testFormTemplate,
        users: [{ id: "1" }],
      });

      const dynamodbExpectedResponse = {
        Item: {
          FormID: "formTestID",
          Name: "123-test",
          SubmissionID: "12",
          FormSubmission: testFormResponse,
          SecurityAttribute: "Protected B",
        },
      };
      ddbMock.on(GetCommand).resolves(dynamodbExpectedResponse);
      ddbMock.on(UpdateCommand).resolves;

      const spiedLogMessage = jest.spyOn(logMessage, "info");

      const { req, res } = createMocks(
        {
          method: "GET",
          query: {
            form: "formtestID",
            submission: "12",
          },
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
        },
        {
          eventEmitter: EventEmitter,
        }
      );
      await download(req, res);

      expect(res.statusCode).toBe(200);
      expect(spiedLogMessage).toHaveBeenCalledWith(
        "user:forms@cds.ca retrieved form responses for response name: 123-test, submissionID: 12, form ID: formtestID"
      );
      expect(res._getHeaders()).toMatchObject({
        "content-disposition": "attachment; filename=123-test.html",
      });
    });
  });
});
