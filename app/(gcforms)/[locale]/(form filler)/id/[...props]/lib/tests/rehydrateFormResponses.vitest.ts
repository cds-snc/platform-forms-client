import { rehydrateFormResponses } from "../rehydrateFormResponses";
import { submission as baseSubmission } from "./fixtures/base";
import { submission as simpleSubmission, result as simpleResult } from "./fixtures/simple";
import { submission as checkboxSubmission, result as checkboxResult } from "./fixtures/checkbox";
import { submission as dateSubmission, result as dateResult } from "./fixtures/date";
import {
  submission as addressSubmission,
  result as addressResult,
} from "./fixtures/addressComplete";
import {
  submission as repeatingSetSubmission,
  result as repeatingSetResult,
} from "./fixtures/repeatingSet";
import {
  submission as kitchenSinkSubmission,
  result as kitchenSinkSubmissionResult,
} from "./fixtures/kitchenSink";
import {
  submission as pagedFormSubmission,
  result as pagedFormSubmissionResult,
} from "./fixtures/paged";
import merge from "lodash.merge";

describe("rehydrateFormResponses", () => {
  it("should rehydrate responses", () => {
    const types = [
      {
        submission: simpleSubmission,
        result: simpleResult,
      },
      {
        submission: checkboxSubmission,
        result: checkboxResult,
      },
      {
        submission: dateSubmission,
        result: dateResult,
      },
      {
        submission: addressSubmission,
        result: addressResult,
      },
      {
        submission: repeatingSetSubmission,
        result: repeatingSetResult,
      },
      {
        submission: kitchenSinkSubmission,
        result: kitchenSinkSubmissionResult,
      },
    ];

    types.forEach((type) => {
      const payload = merge(baseSubmission, type.submission);

      const result = rehydrateFormResponses(payload);

      expect(result).toEqual(type.result);
    });

    const payload = merge(pagedFormSubmission);

    const result = rehydrateFormResponses(payload);

    expect(result).toEqual(pagedFormSubmissionResult);
  });
});
