import { Submission } from "@lib/types";
import merge from "lodash.merge";
import { defaultSubmission } from "./defaultSubmission";

export const mockSubmission = (overrides: Partial<Submission> = {}): Submission => {
  const base = defaultSubmission;

  return merge(base, overrides);
};
