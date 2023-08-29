/**
 * @jest-environment node
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createMocks, RequestMethod } from "node-mocks-http";
import { getServerSession } from "next-auth/next";
import download from "pages/api/id/[form]/[submission]/download";
import { Session } from "next-auth";
import { Base, mockUserPrivileges } from "__utils__/permissions";
import { prismaMock } from "@jestUtils";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { EventEmitter } from "events";
import testFormConfig from "../../../../../__fixtures__/accessibilityTestForm.json";
import { logEvent } from "@lib/auditLogs";
import { Readable } from "node:stream";

jest.mock("next-auth/next");
jest.mock("@lib/auditLogs");

const ddbMock = mockClient(DynamoDBDocumentClient);

// Mock your i18n
jest.mock("next-i18next", () => ({
  appWithTranslation: (component: any) => {
    return component;
  },
}));

jest.mock("react-dom/server");

const mockRenderToStaticNodeStream = import("react-dom/server").then((reactDom) =>
  jest.mocked(reactDom.renderToStaticNodeStream, { shallow: true })
);

//Needed in the typescript version of the test so types are inferred correctly
const mockGetSession = jest.mocked(getServerSession, { shallow: true });
const mockLogEvent = jest.mocked(logEvent, { shallow: true });

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
          privileges: mockUserPrivileges(Base, { user: { id: "1" } }),
          acceptableUse: true,
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
      expect(mockLogEvent).toHaveBeenNthCalledWith(
        1,
        "1",
        { id: "formTestID", type: "Form" },
        "AccessDenied",
        "Attemped to read form object"
      );
      expect(mockLogEvent).toHaveBeenNthCalledWith(
        2,
        "1",
        { type: "Response", id: "NAME#123456789" },
        "AccessDenied",
        "Attemped to download response"
      );
    });

    test("Renders a HTML file", async () => {
      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: "formTestID",
        jsonConfig: testFormTemplate,
        users: [{ id: "1" }],
      });

      const mockedRender = await mockRenderToStaticNodeStream;

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

      mockedRender.mockReturnValueOnce(
        new Readable({
          objectMode: true,
          read: function () {
            this.push(null);
          },
        })
      );

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
      expect(mockLogEvent).toHaveBeenNthCalledWith(
        1,
        "1",
        { id: "formtestID", type: "Form" },
        "ReadForm"
      );
      expect(mockLogEvent).toHaveBeenNthCalledWith(
        2,
        "1",
        { id: "123-test", type: "Response" },
        "DownloadResponse",
        "Downloaded form response for submission ID 12"
      );

      expect(res._getHeaders()).toMatchObject({
        "content-disposition": "attachment; filename=123-test.html",
      });
    });

    test("When downloading a response with a status equal to New the API should update that status to Downloaded", async () => {
      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: "formTestID",
        jsonConfig: testFormTemplate,
        users: [{ id: "1" }],
      });
      const mockedRender = await mockRenderToStaticNodeStream;

      const dynamodbExpectedResponse = {
        Item: {
          FormID: "formTestID",
          Name: "123-test",
          SubmissionID: "12",
          FormSubmission: testFormResponse,
          SecurityAttribute: "Protected B",
          Status: "New",
        },
      };

      ddbMock.on(GetCommand).resolves(dynamodbExpectedResponse);
      ddbMock.on(UpdateCommand).resolves;

      mockedRender.mockReturnValueOnce(
        new Readable({
          objectMode: true,
          read: function () {
            this.push(null);
          },
        })
      );

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
      expect(
        ddbMock.commandCalls(UpdateCommand, {
          UpdateExpression:
            "SET LastDownloadedBy = :email, DownloadedAt = :downloadedAt, #status = :statusUpdate",
        }).length
      ).toBe(1);
    });

    test("When downloading a response with a status not equal to New the API should not update that status", async () => {
      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: "formTestID",
        jsonConfig: testFormTemplate,
        users: [{ id: "1" }],
      });
      const mockedRender = await mockRenderToStaticNodeStream;
      const dynamodbExpectedResponse = {
        Item: {
          FormID: "formTestID",
          Name: "123-test",
          SubmissionID: "12",
          FormSubmission: testFormResponse,
          SecurityAttribute: "Protected B",
          Status: "Confirmed",
        },
      };

      ddbMock.on(GetCommand).resolves(dynamodbExpectedResponse);
      ddbMock.on(UpdateCommand).resolves;

      mockedRender.mockReturnValueOnce(
        new Readable({
          objectMode: true,
          read: function () {
            this.push(null);
          },
        })
      );

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
      expect(
        ddbMock.commandCalls(UpdateCommand, {
          UpdateExpression: "SET LastDownloadedBy = :email, DownloadedAt = :downloadedAt",
        }).length
      ).toBe(1);
    });
  });
});
