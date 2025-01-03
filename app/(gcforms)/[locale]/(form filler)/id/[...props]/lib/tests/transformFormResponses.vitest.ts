import { transformFormResponses } from "../transformFormResponses";
import { submission as baseSubmission } from "./fixtures/base";
import { simpleSubmission, simpleResult } from "./fixtures/simple";
import { simpleTaggedSubmission, simpleTaggedResult } from "./fixtures/simpleTagged";
import { checkboxSubmission, checkboxResult } from "./fixtures/checkbox";
import { checkboxTaggedSubmission, checkboxTaggedResult } from "./fixtures/checkboxTagged";
import { dateSubmission, dateResult } from "./fixtures/date";
import { dateTaggedSubmission, dateTaggedResult } from "./fixtures/dateTagged";
import { addressSubmission, addressResult } from "./fixtures/addressComplete";
import { addressTaggedSubmission, addressTaggedResult } from "./fixtures/addressCompleteTagged";
import { repeatingSetSubmission, repeatingSetResult } from "./fixtures/repeatingSet";
import {
  repeatingSetTaggedSubmission,
  repeatingSetTaggedResult,
} from "./fixtures/repeatingSetTagged";
import { kitchenSinkSubmission, kitchenSinkResult } from "./fixtures/kitchenSink";
import { kitchenSinkTaggedSubmission, kitchenSinkTaggedResult } from "./fixtures/kitchenSinkTagged";
import { pagedFormSubmission, pagedFormResult } from "./fixtures/paged";
import { pagedFormTaggedSubmission, pagedFormTaggedResult } from "./fixtures/pagedTagged";
import { mixedInputsSubmission, mixedInputsResult } from "./fixtures/mixedInputs";
import merge from "lodash.merge";

describe("transformFormResponses", () => {
  it.skip("should transform normal responses for storage", () => {
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
        result: kitchenSinkResult,
      },
      {
        submission: pagedFormSubmission,
        result: pagedFormResult,
      },
    ];

    types.forEach((type) => {
      const payload = merge({}, baseSubmission, type.submission);

      const result = transformFormResponses(payload);

      expect(result).toEqual(type.result);
    });
  });

  it("should transform tagged responses for storage", () => {
    const types = [
      {
        submission: simpleTaggedSubmission,
        result: simpleTaggedResult,
      },
      {
        submission: checkboxTaggedSubmission,
        result: checkboxTaggedResult,
      },
      {
        submission: dateTaggedSubmission,
        result: dateTaggedResult,
      },
      {
        submission: addressTaggedSubmission,
        result: addressTaggedResult,
      },
      {
        submission: repeatingSetTaggedSubmission,
        result: repeatingSetTaggedResult,
      },
      {
        submission: kitchenSinkTaggedSubmission,
        result: kitchenSinkTaggedResult,
      },
      {
        submission: pagedFormTaggedSubmission,
        result: pagedFormTaggedResult,
      },
    ];

    types.forEach((type) => {
      const payload = merge({}, baseSubmission, type.submission);

      const result = transformFormResponses(payload);

      expect(result).toEqual(type.result);
    });
  });

  it("should transform mixed tagged and untagged responses", () => {
    const payload = merge({}, baseSubmission, mixedInputsSubmission);
    const result = transformFormResponses(payload);
    expect(result).toEqual(mixedInputsResult);
  });
});
