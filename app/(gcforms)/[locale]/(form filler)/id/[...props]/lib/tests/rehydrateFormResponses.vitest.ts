import { rehydrateFormResponses } from "../rehydrateFormResponses";
import { defaultSubmission } from "./fixtures/defaultSubmission";
import { defaultSubmissionResult } from "./fixtures/defaultSubmissionResult";
import { kitchenSinkSubmission } from "./fixtures/kitchenSinkSubmission";
import { kitchenSinkSubmissionResult } from "./fixtures/kitchenSinkSubmissionResult";
import { pagedFormSubmission } from "./fixtures/pagedFormSubmission";
import { pagedFormSubmissionResult } from "./fixtures/pagedFormSubmissionResult";

describe("rehydrateFormResponses", () => {
  it("should rehydrate responses 1", () => {
    const payload = defaultSubmission;

    const result = rehydrateFormResponses(payload);

    expect(result).toEqual(defaultSubmissionResult);
  });

  it("should rehydrate responses 2", () => {
    const payload = kitchenSinkSubmission;

    const result = rehydrateFormResponses(payload);

    expect(result).toEqual(kitchenSinkSubmissionResult);
  });

  it("should rehydrate responses 3", () => {
    const payload = pagedFormSubmission;

    const result = rehydrateFormResponses(payload);

    expect(result).toEqual(pagedFormSubmissionResult);
  });
});
