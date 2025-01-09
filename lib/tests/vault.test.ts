/* eslint-disable @typescript-eslint/no-explicit-any */
import Redis from "ioredis-mock";
import { mockClient } from "aws-sdk-client-mock";
import { prismaMock } from "@jestUtils";
import { DynamoDBDocumentClient, QueryCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { AccessControlError } from "@lib/auth";
import { deleteDraftFormResponses, unprocessedSubmissions } from "@lib/vault";
import formConfiguration from "@jestFixtures/cdsIntakeTestForm.json";
import { DeliveryOption } from "@lib/types";
import { TemplateAlreadyPublishedError } from "@lib/templates";
import { getAppSetting } from "@lib/appSettings";
import { getRedisInstance } from "@lib/integration/redisConnector";
import { mockAuthorizationFail, mockAuthorizationPass } from "__utils__/authorization";

jest.mock("@lib/appSettings");
jest.mock("@lib/privileges");
jest.mock("@lib/auditLogs");

const mockedGetAppSetting = jest.mocked(getAppSetting, { shallow: true });

const ddbMock = mockClient(DynamoDBDocumentClient);

jest.mock("@lib/integration/redisConnector", () => {
  const redis = new Redis();
  return {
    getRedisInstance: jest.fn(async () => redis),
  };
});

const userId = "1";

describe("Vault `numberOfUnprocessedSubmissions` function", () => {
  beforeEach(async () => {
    ddbMock.reset();
    const mockRedis = await getRedisInstance();
    mockRedis.flushall();
    mockAuthorizationPass(userId);
  });

  it("Should return 0 if no response are available", async () => {
    const dynamodbMockedReponses = {
      Items: [],
    };

    ddbMock.on(QueryCommand).resolves(dynamodbMockedReponses);

    const numOfUnprocessedSubmissions = await unprocessedSubmissions("formtestID");

    expect(numOfUnprocessedSubmissions).toEqual(false);
  });

  it("Should return the correct number of unprocessed submissions", async () => {
    mockedGetAppSetting.mockImplementation((key) => {
      if (key === "responseDownloadLimit") {
        return Promise.resolve("500");
      }
      return Promise.resolve(null);
    });

    const dynamodbMockedReponses = {
      Items: [
        {
          FormID: "formtestID",
          Status: "New",
        },
        {
          FormID: "formtestID",
          Status: "Downloaded",
        },
        {
          FormID: "formtestID",
          Status: "Confirmed",
        },
        {
          FormID: "formtestID",
          Status: "Problem",
        },
        {
          FormID: "formtestID",
          Status: "Downloaded",
        },
      ],
    };

    ddbMock.on(QueryCommand).resolves(dynamodbMockedReponses);

    const numOfUnprocessedSubmissions = await unprocessedSubmissions("formtestID");

    expect(numOfUnprocessedSubmissions).toEqual(true);
  });

  it("Submissions should only be fetched once if we call the function multiple times in a row and we do not ignore the cache", async () => {
    const dynamodbMockedReponses = {
      Items: [
        {
          FormID: "formtestID",
          Status: "New",
        },
      ],
    };

    ddbMock.on(QueryCommand).resolves(dynamodbMockedReponses);

    await unprocessedSubmissions("formtestID");
    await unprocessedSubmissions("formtestID");
    await unprocessedSubmissions("formtestID");
    await unprocessedSubmissions("formtestID");

    expect(ddbMock.commandCalls(QueryCommand).length).toBe(2);
  });

  it("Submissions should be fetched on every function call if we decide to ignore the cache", async () => {
    const dynamodbMockedReponses = {
      Items: [
        {
          FormID: "formtestID",
          Status: "New",
        },
      ],
    };

    ddbMock.on(QueryCommand).resolves(dynamodbMockedReponses);

    await unprocessedSubmissions("formtestID", true);
    await unprocessedSubmissions("formtestID", true);
    await unprocessedSubmissions("formtestID", true);
    await unprocessedSubmissions("formtestID", true);

    expect(ddbMock.commandCalls(QueryCommand).length).toBe(8);
  });
});
const buildPrismaResponse = (
  id: string,
  jsonConfig: object,
  isPublished = false,
  deliveryOption?: DeliveryOption,
  securityAttribute = "Unclassified"
) => {
  return {
    id,
    jsonConfig,
    deliveryOption,
    isPublished,
    securityAttribute,
  };
};
describe("Deleting test responses (submissions)", () => {
  beforeEach(async () => {
    ddbMock.reset();
    const mockRedis = await getRedisInstance();
    mockRedis.flushall();
    mockAuthorizationPass(userId);
  });
  it("Should be able to delete draft responses if the user is owner of the form", async () => {
    // Mock an unpublished form
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration, false),
    });

    const dynamodbMockedReponses = {
      Items: [
        { NAME_OR_CONF: "NAME#ASDF" },
        { NAME_OR_CONF: "NAME#ASDF2" },
        { NAME_OR_CONF: "CONF#1342" },
        { NAME_OR_CONF: "CONF#1343" },
      ],
    };

    ddbMock.on(QueryCommand).resolves(dynamodbMockedReponses);
    ddbMock.on(BatchWriteCommand).resolves({});

    const response = await deleteDraftFormResponses("formtestID");

    expect(ddbMock.commandCalls(BatchWriteCommand).length).toBe(1);
    expect(response.responsesDeleted).toBe(4);
  });

  it("Should be able to delete draft responses if the user is not the owner of the form", async () => {
    mockAuthorizationFail(userId);

    await expect(deleteDraftFormResponses("formtestID")).rejects.toThrow(AccessControlError);
  });

  it("Should not be able to delete responses if the form is published", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration, true),
    });

    await expect(async () => {
      await deleteDraftFormResponses("formtestID");
    }).rejects.toThrow(
      new TemplateAlreadyPublishedError("Form is published. Cannot delete draft form responses.")
    );
  });
});
