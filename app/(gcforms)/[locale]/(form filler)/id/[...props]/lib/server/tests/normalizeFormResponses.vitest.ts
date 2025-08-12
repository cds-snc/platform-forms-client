
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
import {
  submission as missingInputsSubmission,
  result as missingInputsResult,
} from "./fixtures/missingInputs";
import {
  submission as richTextSubmission,
  result as richTextResult,
} from "./fixtures/includingRichText";

import merge from "lodash.merge";
import { FormRecord, Responses } from "@root/lib/types";
import { normalizeFormResponses } from "../normalizeFormResponses";

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
      {
        submission: richTextSubmission,
        result: richTextResult,
      },
      {
        submission: missingInputsSubmission,
        result: missingInputsResult,
      },
    ];

    types.forEach((type) => {
      const payload = merge({}, baseSubmission, type.submission);

      const result = normalizeFormResponses(payload.form, payload.responses);

      expect(result).toEqual(type.result);
    });
  });

  describe("Error handling", () => {
    it("should throw error for invalid form record", () => {
      expect(() => normalizeFormResponses(null as unknown as FormRecord, {})).toThrow(
        "Invalid form record: missing or invalid elements array"
      );

      expect(() => normalizeFormResponses({} as unknown as FormRecord, {})).toThrow(
        "Invalid form record: missing or invalid elements array"
      );

      expect(() =>
        normalizeFormResponses({ form: null } as unknown as FormRecord, {})
      ).toThrow("Invalid form record: missing or invalid elements array");
    });

    it("should throw error for invalid values", () => {
      const validForm = { form: { elements: [] }, id: "test", securityAttribute: "protected" };

      expect(() =>
        normalizeFormResponses(
          validForm as unknown as FormRecord,
          null as unknown as Responses
        )
      ).toThrow("Invalid values: must be a valid object");

      expect(() =>
        normalizeFormResponses(
          validForm as unknown as FormRecord,
          "string" as unknown as Responses
        )
      ).toThrow("Invalid values: must be a valid object");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty form elements array", () => {
      const emptyForm = {
        form: { elements: [] },
        id: "test-form",
        securityAttribute: "protected",
      };

      const result = normalizeFormResponses(emptyForm as unknown as FormRecord, {});

      expect(result).toEqual({});
    });

    it("should handle empty responses", () => {
      const formWithElements = {
        form: {
          elements: [
            { id: "1", type: "textField" },
            { id: "2", type: "checkbox" },
          ],
        },
        id: "test-form",
        securityAttribute: "protected",
      };

      const result = normalizeFormResponses(formWithElements as unknown as FormRecord, {});

      expect(result).not.toHaveProperty("1", "");
      expect(result).not.toHaveProperty("2", []);
    });

    it("should handle responses with unknown field IDs", () => {
      const form = {
        form: { elements: [{ id: "1", type: "textField" }] },
        id: "test-form",
        securityAttribute: "protected",
      };

      const responses = {
        "1": "valid field",
        "999": "unknown field",
        nonexistent: "another unknown",
      };

      const result = normalizeFormResponses(form as unknown as FormRecord, responses);

      expect(result["1"]).toBe("valid field");
      expect(result["999"]).toBe("unknown field");
      expect(result["nonexistent"]).toBe("another unknown");
    });

    it("should handle malformed file input responses", () => {
      const form = {
        form: { elements: [{ id: "1", type: "fileInput" }] },
        id: "test-form",
        securityAttribute: "protected",
      };

      const responses = { "1": "invalid file data" };

      const result = normalizeFormResponses(form as unknown as FormRecord, responses);

      expect(result["1"]).toEqual({
        name: null,
        size: null,
        id: null,
      });
    });

    it("should handle malformed checkbox responses", () => {
      const form = {
        form: { elements: [{ id: "1", type: "checkbox" }] },
        id: "test-form",
        securityAttribute: "protected",
      };

      const responses = { "1": "not an array" };

      const result = normalizeFormResponses(form as unknown as FormRecord, responses);

      expect(result["1"]).toEqual([]);
    });

    it("should handle mixed valid and invalid checkbox array items", () => {
      const form = {
        form: { elements: [{ id: "1", type: "checkbox" }] },
        id: "test-form",
        securityAttribute: "protected",
      };

      const responses = { "1": ["valid", 123, null, "also valid", {}] };

      const result = normalizeFormResponses(
        form as unknown as FormRecord,
        responses as unknown as Responses
      );

      expect(result["1"]).toEqual(["valid", "also valid"]);
    });

    it("should handle elements with missing type property", () => {
      const form = {
        form: { elements: [{ id: "1" }] }, // missing type
        id: "test-form",
        securityAttribute: "protected",
      };

      const responses = { "1": "some value" };

      const result = normalizeFormResponses(form as unknown as FormRecord, responses);

      expect(result["1"]).toBe("some value");
    });

    // it("should exclude richText elements from missing elements processing", () => {
    //   const form = {
    //     form: {
    //       elements: [
    //         { id: "1", type: "textField" },
    //         { id: "2", type: "richText" },
    //         { id: "3", type: "checkbox" },
    //       ],
    //     },
    //     id: "test-form",
    //     securityAttribute: "protected",
    //   };

    //   const result = normalizeFormResponses(form as unknown as FormRecord, {});

    //   expect(result).toHaveProperty("1", "");
    //   expect(result).not.toHaveProperty("2"); // richText should be excluded
    //   expect(result).toHaveProperty("3", []);
    // });

    it("should handle dynamic row with malformed data", () => {
      const form = {
        form: {
          elements: [
            {
              id: "1",
              type: "dynamicRow",
              properties: {
                subElements: [{ type: "textField" }, { type: "checkbox" }],
              },
            },
          ],
        },
        id: "test-form",
        securityAttribute: "protected",
      };

      const responses = { "1": "not an array" };

      const result = normalizeFormResponses(form as unknown as FormRecord, responses);

      expect(result["1"]).toEqual([]);
    });
  });
});
