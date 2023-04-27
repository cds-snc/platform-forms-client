/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Redis from "ioredis-mock";
import { mockClient } from "aws-sdk-client-mock";
import { prismaMock } from "@jestUtils";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { createAbility } from "@lib/privileges";
import { Base, mockUserPrivileges } from "__utils__/permissions";
import { Session } from "next-auth";
import { numberOfUnprocessedSubmissions } from "@lib/vault";
import formConfiguration from "@jestFixtures/cdsIntakeTestForm.json";

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

    const numOfUnprocessedSubmissions = await numberOfUnprocessedSubmissions(ability, "formtestID");

    expect(numOfUnprocessedSubmissions).toEqual(0);
  });

  it("Should return the correct number of unprocessed submissions", async () => {
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

    const numOfUnprocessedSubmissions = await numberOfUnprocessedSubmissions(ability, "formtestID");

    expect(numOfUnprocessedSubmissions).toEqual(3);
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

    await numberOfUnprocessedSubmissions(ability, "formtestID");
    await numberOfUnprocessedSubmissions(ability, "formtestID");
    await numberOfUnprocessedSubmissions(ability, "formtestID");
    await numberOfUnprocessedSubmissions(ability, "formtestID");

    expect(ddbMock.commandCalls(QueryCommand).length).toBe(1);
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

    await numberOfUnprocessedSubmissions(ability, "formtestID", true);
    await numberOfUnprocessedSubmissions(ability, "formtestID", true);
    await numberOfUnprocessedSubmissions(ability, "formtestID", true);
    await numberOfUnprocessedSubmissions(ability, "formtestID", true);

    expect(ddbMock.commandCalls(QueryCommand).length).toBe(4);
  });
});
