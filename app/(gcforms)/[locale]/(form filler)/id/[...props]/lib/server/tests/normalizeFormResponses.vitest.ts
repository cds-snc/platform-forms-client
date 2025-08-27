
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

      expect(result).toHaveProperty("1", "");
      expect(result).toHaveProperty("2", []);
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

  describe("Dynamic Row Advanced Cases", () => {
    it("should handle dynamic row with missing subElements property", () => {
      const form = {
        form: {
          elements: [
            {
              id: "1",
              type: "dynamicRow",
              properties: {}, // missing subElements
            },
          ],
        },
        id: "test-form",
        securityAttribute: "protected",
      };

      const responses = { "1": [{ "0": "value1" }, { "0": "value2" }] };

      const result = normalizeFormResponses(form as unknown as FormRecord, responses);

      expect(result["1"]).toEqual([{ "0": "value1" }, { "0": "value2" }]);
    });

    it("should handle dynamic row with richText subElements", () => {
      const form = {
        form: {
          elements: [
            {
              id: "1",
              type: "dynamicRow",
              properties: {
                subElements: [
                  { type: "textField" },
                  { type: "richText" },
                  { type: "checkbox" }
                ],
              },
            },
          ],
        },
        id: "test-form",
        securityAttribute: "protected",
      };

      const responses = { 
        "1": [
          { "0": "text value" },
          { "0": "text value", "2": ["option1"] }
        ] 
      };

      const result = normalizeFormResponses(form as unknown as FormRecord, responses);

      expect(result["1"]).toEqual([
        { "0": "text value", "2": [] },
        { "0": "text value", "2": ["option1"] }
      ]);
    });

    it("should handle nested dynamic row processing", () => {
      const form = {
        form: {
          elements: [
            {
              id: "1",
              type: "dynamicRow",
              properties: {
                subElements: [
                  { 
                    type: "dynamicRow",
                    properties: {
                      subElements: [{ type: "textField" }]
                    }
                  }
                ],
              },
            },
          ],
        },
        id: "test-form",
        securityAttribute: "protected",
      };

      const responses = { "1": [{ "0": [{ "0": "nested value" }] }] };

      const result = normalizeFormResponses(form as unknown as FormRecord, responses);

      expect(result["1"]).toEqual([{ "0": [{ "0": "nested value" }] }]);
    });
  });

  describe("File Input Advanced Cases", () => {
    it("should handle valid file input objects", () => {
      const form = {
        form: { elements: [{ id: "1", type: "fileInput" }] },
        id: "test-form",
        securityAttribute: "protected",
      };

      const responses = { 
        "1": { 
          name: "document.pdf", 
          size: 1024, 
          id: "file-123" 
        } 
      };

      const result = normalizeFormResponses(form as unknown as FormRecord, responses);

      expect(result["1"]).toEqual({
        name: "document.pdf",
        size: 1024,
        id: "file-123",
      });
    });

    it("should handle partial file input objects", () => {
      const form = {
        form: { elements: [{ id: "1", type: "fileInput" }] },
        id: "test-form",
        securityAttribute: "protected",
      };

      const responses = { "1": { name: "document.pdf" } }; // missing size and id

      const result = normalizeFormResponses(
        form as unknown as FormRecord,
        responses as unknown as Responses
      );

      expect(result["1"]).toEqual({
        name: null,
        size: null,
        id: null,
      });
    });

    it("should handle null and undefined file input values", () => {
      const form = {
        form: { elements: [{ id: "1", type: "fileInput" }, { id: "2", type: "fileInput" }] },
        id: "test-form",
        securityAttribute: "protected",
      };

      const responses = { "1": null, "2": undefined };

      const result = normalizeFormResponses(
        form as unknown as FormRecord,
        responses as unknown as Responses
      );

      expect(result["1"]).toEqual({ name: null, size: null, id: null });
      expect(result["2"]).toEqual({ name: null, size: null, id: null });
    });
  });

  describe("Data Integrity", () => {
    it("should not mutate original responses object", () => {
      const form = {
        form: {
          elements: [
            { id: "1", type: "checkbox" },
            { id: "2", type: "fileInput" }
          ],
        },
        id: "test-form",
        securityAttribute: "protected",
      };

      const originalResponses = { 
        "1": "not an array",
        "2": "invalid file"
      };
      const responsesCopy = { ...originalResponses };

      normalizeFormResponses(form as unknown as FormRecord, originalResponses);

      expect(originalResponses).toEqual(responsesCopy);
    });

    it("should handle responses with complex nested objects", () => {
      const form = {
        form: {
          elements: [
            { id: "1", type: "textField" },
            { id: "2", type: "dynamicRow", properties: { subElements: [{ type: "textField" }] } }
          ],
        },
        id: "test-form",
        securityAttribute: "protected",
      };

      const responses = {
        "1": { nested: { deep: { value: "test" } } },
        "2": [{ "0": { another: "nested", object: true } }]
      };

      const result = normalizeFormResponses(
        form as unknown as FormRecord,
        responses as unknown as Responses
      );

      expect(result["1"]).toEqual({ nested: { deep: { value: "test" } } });
      expect(result["2"]).toEqual([{ "0": { another: "nested", object: true } }]);
    });
  });

  describe("Error Recovery", () => {
    it("should handle errors in fillData gracefully", () => {
      const form = {
        form: {
          elements: [
            { id: "1", type: "dynamicRow", properties: null }, // will cause error
            { id: "2", type: "textField" }
          ],
        },
        id: "test-form",
        securityAttribute: "protected",
      };

      const responses = { 
        "1": [{ "0": "value" }],
        "2": "normal value"
      };

      const result = normalizeFormResponses(
        form as unknown as FormRecord,
        responses as unknown as Responses
      );

      expect(result["1"]).toEqual([{ "0": "value" }]); // should return original value
      expect(result["2"]).toBe("normal value");
    });
  });

  describe("Performance and Structure", () => {
    it("should handle large form with many elements efficiently", () => {
      const elements = Array.from({ length: 100 }, (_, i) => ({
        id: String(i),
        type: i % 3 === 0 ? "checkbox" : i % 3 === 1 ? "fileInput" : "textField"
      }));

      const form = {
        form: { elements },
        id: "test-form",
        securityAttribute: "protected",
      };

      const responses = Object.fromEntries(
        elements.map((el, i) => [
          String(i),
          el.type === "checkbox" ? ["value"] : el.type === "fileInput" ? { name: "file", size: 100, id: "id" } : "text"
        ])
      );

      const startTime = performance.now();
      const result = normalizeFormResponses(form as unknown as FormRecord, responses);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      expect(Object.keys(result)).toHaveLength(100);
    });

    it("should handle form with duplicate element IDs", () => {
      const form = {
        form: {
          elements: [
            { id: "1", type: "textField" },
            { id: "1", type: "checkbox" }, // duplicate ID
          ],
        },
        id: "test-form",
        securityAttribute: "protected",
      };

      const responses = { "1": "text value" };

      const result = normalizeFormResponses(form as unknown as FormRecord, responses);

      // Should use the last element with that ID (Map behavior)
      expect(result["1"]).toEqual([]);
    });
  });

  describe("Unknown Element Types", () => {
    it("should handle unknown element types gracefully", () => {
      const form = {
        form: {
          elements: [
            { id: "1", type: "unknownType" },
            { id: "2", type: "anotherUnknownType" }
          ],
        },
        id: "test-form",
        securityAttribute: "protected",
      };

      const responses = { 
        "1": "some value",
        "2": { complex: "object" }
      };

      const result = normalizeFormResponses(form as unknown as FormRecord, responses);

      expect(result["1"]).toBe("some value");
      expect(result["2"]).toEqual({ complex: "object" });
    });
  });
});
