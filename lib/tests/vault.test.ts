/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Redis from "ioredis-mock";
import { mockClient } from "aws-sdk-client-mock";
import { prismaMock } from "@jestUtils";
import { DynamoDBDocumentClient, QueryCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { AccessControlError, createAbility } from "@lib/privileges";
import { Base, mockUserPrivileges } from "__utils__/permissions";
import { Session } from "next-auth";
import { deleteDraftFormResponses, unprocessedSubmissions } from "@lib/vault";
import formConfiguration from "@jestFixtures/cdsIntakeTestForm.json";
import { DeliveryOption } from "@lib/types";
import { TemplateAlreadyPublishedError } from "@lib/templates";
import { getAppSetting } from "@lib/appSettings";

jest.mock("@lib/appSettings");

const mockedGetAppSetting = jest.mocked(getAppSetting, { shallow: true });

const ddbMock = mockClient(DynamoDBDocumentClient);

const redis = new Redis();

jest.mock("@lib/integration/redisConnector", () => ({
  getRedisInstance: jest.fn(() => redis),
}));

describe("Vault `numberOfUnprocessedSubmissions` function", () => {
  beforeEach(() => {
    ddbMock.reset();
    redis.flushall();
  });

  it("Should return 0 if no response are available", async () => {
    const fakeSession = {
      user: {
        id: "1",
        privileges: mockUserPrivileges(Base, { user: { id: "1" } }),
      },
    };

    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
      users: [{ id: "1" }],
    });

    const dynamodbMockedReponses = {
      Items: [],
    };

    ddbMock.on(QueryCommand).resolves(dynamodbMockedReponses);

    const numOfUnprocessedSubmissions = await unprocessedSubmissions(ability, "formtestID");

    expect(numOfUnprocessedSubmissions).toEqual(false);
  });

  it("Should return the correct number of unprocessed submissions", async () => {
    const fakeSession = {
      user: {
        id: "1",
        privileges: mockUserPrivileges(Base, { user: { id: "1" } }),
      },
    };

    mockedGetAppSetting.mockImplementation((key) => {
      if (key === "responseDownloadLimit") {
        return Promise.resolve("500");
      }
      return Promise.resolve(null);
    });

    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
      users: [{ id: "1" }],
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

    const numOfUnprocessedSubmissions = await unprocessedSubmissions(ability, "formtestID");

    expect(numOfUnprocessedSubmissions).toEqual(true);
  });

  it("Submissions should only be fetched once if we call the function multiple times in a row and we do not ignore the cache", async () => {
    const fakeSession = {
      user: {
        id: "1",
        privileges: mockUserPrivileges(Base, { user: { id: "1" } }),
      },
    };

    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
      users: [{ id: "1" }],
    });

    const dynamodbMockedReponses = {
      Items: [
        {
          FormID: "formtestID",
          Status: "New",
        },
      ],
    };

    ddbMock.on(QueryCommand).resolves(dynamodbMockedReponses);

    await unprocessedSubmissions(ability, "formtestID");
    await unprocessedSubmissions(ability, "formtestID");
    await unprocessedSubmissions(ability, "formtestID");
    await unprocessedSubmissions(ability, "formtestID");

    expect(ddbMock.commandCalls(QueryCommand).length).toBe(2);
  });

  it("Submissions should be fetched on every function call if we decide to ignore the cache", async () => {
    const fakeSession = {
      user: {
        id: "1",
        privileges: mockUserPrivileges(Base, { user: { id: "1" } }),
      },
    };

    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
      users: [{ id: "1" }],
    });

    const dynamodbMockedReponses = {
      Items: [
        {
          FormID: "formtestID",
          Status: "New",
        },
      ],
    };

    ddbMock.on(QueryCommand).resolves(dynamodbMockedReponses);

    await unprocessedSubmissions(ability, "formtestID", true);
    await unprocessedSubmissions(ability, "formtestID", true);
    await unprocessedSubmissions(ability, "formtestID", true);
    await unprocessedSubmissions(ability, "formtestID", true);

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
  beforeEach(() => {
    ddbMock.reset();
    redis.flushall();
  });
  it("Should be able to delete draft responses if the user is owner of the form", async () => {
    const fakeSession = {
      user: {
        id: "1",
        privileges: mockUserPrivileges(Base, { user: { id: "1" } }),
      },
    };
    const ability = createAbility(fakeSession as Session);
    // Mock an unpublished form
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration, false),
      users: [{ id: "1" }],
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

    const response = await deleteDraftFormResponses(ability, "formtestID");

    expect(ddbMock.commandCalls(BatchWriteCommand).length).toBe(1);
    expect(response.responsesDeleted).toBe(4);
  });

  it("Should be able to delete draft responses if the user is not the owner of the form", async () => {
    const fakeSession = {
      user: { id: "1", privileges: mockUserPrivileges(Base, { user: { id: "1" } }) },
    };
    const ability = createAbility(fakeSession as Session);
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration),
      users: [{ id: "2" }],
    });

    await expect(async () => {
      await deleteDraftFormResponses(ability, "formtestID");
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));
  });

  it("Should not be able to delete responses if the form is published", async () => {
    const fakeSession = {
      user: {
        id: "1",
        privileges: mockUserPrivileges(Base, { user: { id: "1" } }),
      },
    };
    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration, true),
      users: [{ id: "1" }],
    });

    await expect(async () => {
      await deleteDraftFormResponses(ability, "formtestID");
    }).rejects.toThrowError(
      new TemplateAlreadyPublishedError("Form is published. Cannot delete draft form responses.")
    );
  });
});
