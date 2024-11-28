import { rehydrateFormResponses } from "../rehydrateFormResponses";
import {
  submission as simpleSubmission,
  result as simpleResult,
} from "./fixtures/submissions/simple";
import {
  submission as checkboxSubmission,
  result as checkboxResult,
} from "./fixtures/submissions/checkbox";
import { submission as dateSubmission, result as dateResult } from "./fixtures/submissions/date";
import {
  submission as addressSubmission,
  result as addressResult,
} from "./fixtures/submissions/addressComplete";
import {
  submission as repeatingSetSubmission,
  result as repeatingSetResult,
} from "./fixtures/submissions/repeatingSet";
import {
  submission as kitchenSinkSubmission,
  result as kitchenSinkSubmissionResult,
} from "./fixtures/submissions/kitchenSink";
import {
  submission as pagedFormSubmission,
  result as pagedFormSubmissionResult,
} from "./fixtures/submissions/paged";

describe("rehydrateFormResponses", () => {
  it("should rehydrate responses 1", () => {
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
      {
        submission: pagedFormSubmission,
        result: pagedFormSubmissionResult,
      },
    ];

    types.forEach((type) => {
      const payload = type.submission;

      const result = rehydrateFormResponses(payload);

      expect(result).toEqual(type.result);
    });
  });
});
