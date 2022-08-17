import { inspect } from "node:util";
import { logMessage } from "@lib/logger";
import { NextApiRequest, NextApiResponse } from "next";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";

/**
 * @description
 * This middleware checks that the provided array of query parameters are valid.
 * @param queryParam - The query parameter array to validate. Each element should include a
 * query parameter name and a validator function that returns a boolean indicating if the
 * parameter is valid.
 * @returns
 */
export const validQueryParams = (
  queryParams: { name: string; isValid: (value: any) => boolean }[] // eslint-disable-line  @typescript-eslint/no-explicit-any
): MiddlewareRequest => {
  return async function (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> {
    try {
      // Check each provided query parameter to see if it is valid
      const invalidParams = queryParams.filter((param) => !param.isValid(req.query[param.name]));
      if (invalidParams.length > 0) {
        throw new Error(`Invalid query parameters: ${inspect(invalidParams)}`);
      }
      return { next: true };
    } catch (error) {
      logMessage.error(`Unable to validate query parameters: ${inspect(error)}`);
      res.status(400).json({ error: "Unable to validate query parameters." });
      return { next: false };
    }
  };
};
