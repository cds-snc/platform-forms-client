import { getFormSubmission } from "@lib/formSubmission";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { logMessage } from "@lib/logger";
import { mockClient } from "aws-sdk-client-mock";

jest.mock("@lib/logger");
const mockLogMessage = jest.mocked(logMessage, true);
const mockDynamoDBClient = mockClient(DynamoDBClient);

beforeEach(() => {
  jest.resetAllMocks();
  mockDynamoDBClient.reset();
});

describe("getFormSubmission", () => {
  it("Should return the form submission if it exists", async () => {
    const item = {
      Item: {
        FormSubmission: {
          S: '{"2":"Pat","3":"English","4":"a remarkably dull form submission"}',
        },
      },
    };
    const expectedFormSubmission =
      '{"2":"Pat","3":"English","4":"a remarkably dull form submission"}';
    mockDynamoDBClient.on(GetItemCommand).resolvesOnce(item);
    const formSubmission = await getFormSubmission("formId", "submissionId");
    expect(formSubmission).toEqual(expectedFormSubmission);
  });

  it("Should return undefined if no form submission is found", async () => {
    mockDynamoDBClient.on(GetItemCommand).resolvesOnce({});
    const formSubmission = await getFormSubmission("formId", "submissionId");
    expect(formSubmission).toEqual(undefined);
  });

  it("Should log an error if an exception is caught", async () => {
    mockDynamoDBClient.on(GetItemCommand).rejectsOnce("¯_(ツ)_/¯");
    const formSubmission = await getFormSubmission("123", "456");
    expect(formSubmission).toBe(undefined);
    expect(mockLogMessage.error.mock.calls[0][0]).toContain(
      "456: failed to get form submission with form ID 123: Error: ¯_(ツ)_/¯"
    );
  });
});
