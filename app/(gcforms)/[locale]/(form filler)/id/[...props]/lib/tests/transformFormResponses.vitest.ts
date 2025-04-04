import { transformFormResponses } from "../transformFormResponses";
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

describe("transformFormResponses", () => {
  it("should transform responses for storage", () => {
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
      const payload = merge({}, baseSubmission, type.submission);

      const result = transformFormResponses(payload);

      expect(result).toEqual(type.result);
    });
  });
});
