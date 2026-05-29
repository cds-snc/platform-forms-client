import { lambdaClient } from "@lib/integration/awsServicesConnector";
import { invokeSubmissionLambda } from "./invokeSubmissionLambda";
import type { Responses } from "@lib/types";

vi.mock("@lib/integration/awsServicesConnector", () => ({
  lambdaClient: {
    send: vi.fn(),
  },
}));

vi.mock("@lib/logger", () => ({
  logMessage: {
    info: vi.fn(),
  },
}));

describe("invokeSubmissionLambda", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends the template version id in both supported payload keys", async () => {
    vi.mocked(lambdaClient.send).mockResolvedValue({
      StatusCode: 200,
      Payload: {
        transformToString: () => JSON.stringify({ status: true, submissionId: "submission-1" }),
      },
    } as never);

    await invokeSubmissionLambda(
      "form-1",
      { field1: "answer" } as unknown as Responses,
      "en",
      "Unclassified",
      "template-version-1"
    );

    const command = vi.mocked(lambdaClient.send).mock.calls[0][0] as { input: { Payload: string } };
    const payload = JSON.parse(command.input.Payload);

    expect(payload).toMatchObject({
      formID: "form-1",
      templateVersionId: "template-version-1",
      TemplateVersionId: "template-version-1",
    });
  });
});