import { unprocessedSubmissions } from "@lib/vault";
import { AuthenticatedAction } from "@lib/actions";

export const checkUnprocessed = AuthenticatedAction(
  async (
    _,
    {
      formId,
    }: {
      formId: string;
    }
  ): Promise<{
    unprocessedSubmissions?: boolean;
    error?: string;
  }> => {
    try {
      if (!formId || typeof formId !== "string") {
        throw new Error("Bad request");
      }

      const result = await unprocessedSubmissions(formId);

      return { unprocessedSubmissions: result };
    } catch (error) {
      return { unprocessedSubmissions: false, error: (error as Error).message };
    }
  }
);
