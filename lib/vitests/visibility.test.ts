import { describe, it, expect } from "vitest";
import {
  buildElementDependencies,
  collectDependentElements,
  computeAllVisibility,
  recomputeAffectedVisibility,
  getChangedChoiceElementIds,
  initializeVisibilityState,
} from "@gcforms/core";
import { FormElement, PublicFormRecord, FormValues } from "@gcforms/types";

describe("visibility", () => {
  // Helper to create a simple form element
  const createElement = (
    id: number,
    type: string = "textField",
    conditionalRules: Array<{ choiceId: string }> = []
  ): FormElement => {
    return {
      id,
      type,
      properties: {
        titleEn: `Element ${id}`,
        titleFr: `Element ${id}`,
        conditionalRules,
        choices:
          type === "radio"
            ? [
                { en: "Option A", fr: "Option A" },
                { en: "Option B", fr: "Option B" },
              ]
            : undefined,
      },
    } as FormElement;
  };

  describe("buildElementDependencies", () => {
    it("should build element dependencies from conditional rules", () => {
      const elements = [
        createElement(1, "radio"),
        createElement(2, "textField", [{ choiceId: "1.0" }]),
        createElement(3, "textField", [{ choiceId: "1.1" }]),
      ];

      const elementDependencies = buildElementDependencies(elements);

      expect(elementDependencies.has("1")).toBe(true);
      expect(elementDependencies.get("1")).toEqual(new Set(["2", "3"]));
    });

    it("should handle elements with no rules", () => {
      const elements = [createElement(1, "textField"), createElement(2, "textField")];

      const elementDependencies = buildElementDependencies(elements);

      expect(elementDependencies.size).toBe(0);
    });

    it("should handle multiple elements depending on the same parent", () => {
      const elements = [
        createElement(1, "radio"),
        createElement(2, "textField", [{ choiceId: "1.0" }]),
        createElement(3, "textField", [{ choiceId: "1.1" }]),
        createElement(4, "textField", [{ choiceId: "1.0" }]),
      ];

      const elementDependencies = buildElementDependencies(elements);

      expect(elementDependencies.get("1")).toEqual(new Set(["2", "3", "4"]));
    });
  });

  describe("collectDependentElements", () => {
    it("should collect direct dependents", () => {
      const elementDependencies = new Map([["1", new Set(["2", "3"])]]);

      const dependents = collectDependentElements(["1"], elementDependencies);

      expect(dependents).toEqual(new Set(["2", "3"]));
    });

    it("should collect transitive dependents", () => {
      const elementDependencies = new Map([
        ["1", new Set(["2"])],
        ["2", new Set(["3"])],
      ]);

      const dependents = collectDependentElements(["1"], elementDependencies);

      expect(dependents).toEqual(new Set(["2", "3"]));
    });

    it("should handle circular dependencies", () => {
      const elementDependencies = new Map([
        ["1", new Set(["2"])],
        ["2", new Set(["1"])],
      ]);

      const dependents = collectDependentElements(["1"], elementDependencies);

      // Should not infinite loop and should collect both
      expect(dependents).toEqual(new Set(["2", "1"]));
    });

    it("should return empty set when element has no dependents", () => {
      const elementDependencies = new Map([["1", new Set(["2"])]]);

      const dependents = collectDependentElements(["3"], elementDependencies);

      expect(dependents.size).toBe(0);
    });
  });

  describe("computeAllVisibility", () => {
    it("should compute visibility for all elements", () => {
      const formRecord: PublicFormRecord = {
        id: "test",
        form: {
          elements: [
            createElement(1, "radio"),
            createElement(2, "textField", [{ choiceId: "1.0" }]),
            createElement(3, "textField"),
          ],
        },
      } as PublicFormRecord;

      const values: FormValues = { "1": "Option A" };

      const visibilityMap = computeAllVisibility(formRecord, values);

      expect(visibilityMap.get("1")).toBe(true); // Radio is always visible
      expect(visibilityMap.get("2")).toBe(true); // Dependent on 1.0, and 1 has value "Option A"
      expect(visibilityMap.get("3")).toBe(true); // No rules, always visible
    });

    it("should handle elements without rules as visible", () => {
      const formRecord: PublicFormRecord = {
        id: "test",
        form: {
          elements: [createElement(1, "textField"), createElement(2, "textField")],
        },
      } as PublicFormRecord;

      const visibilityMap = computeAllVisibility(formRecord, {});

      expect(visibilityMap.get("1")).toBe(true);
      expect(visibilityMap.get("2")).toBe(true);
    });
  });

  describe("getChangedChoiceElementIds", () => {
    it("should detect changed choice elements", () => {
      const elements = [
        createElement(1, "radio"),
        createElement(2, "textField", [{ choiceId: "1.0" }]),
      ];
      const elementDependencies = buildElementDependencies(elements);

      const oldValues: FormValues = {};
      const newValues: FormValues = { "1": "Option A" };

      const changed = getChangedChoiceElementIds(oldValues, newValues, elements, elementDependencies);

      expect(changed).toEqual(["1"]);
    });

    it("should only return choice elements that have dependents", () => {
      const elements = [
        createElement(1, "radio"),
        createElement(2, "radio"),
        createElement(3, "textField", [{ choiceId: "1.0" }]),
      ];
      const elementDependencies = buildElementDependencies(elements);

      const oldValues: FormValues = {};
      const newValues: FormValues = { "1": "Option A", "2": "Option B" };

      const changed = getChangedChoiceElementIds(oldValues, newValues, elements, elementDependencies);

      // Only element 1 should be returned because only it has dependents
      expect(changed).toEqual(["1"]);
    });

    it("should not return non-choice elements", () => {
      const elements = [
        createElement(1, "textField"),
        createElement(2, "textField", [{ choiceId: "1" }]),
      ];
      const elementDependencies = buildElementDependencies(elements);

      const oldValues: FormValues = {};
      const newValues: FormValues = { "1": "some text" };

      const changed = getChangedChoiceElementIds(oldValues, newValues, elements, elementDependencies);

      expect(changed).toEqual([]);
    });
  });

  describe("recomputeAffectedVisibility", () => {
    it("should only recompute visibility for affected elements", () => {
      const formRecord: PublicFormRecord = {
        id: "test",
        form: {
          elements: [
            createElement(1, "radio"),
            createElement(2, "textField", [{ choiceId: "1.0" }]),
            createElement(3, "textField"),
          ],
        },
      } as PublicFormRecord;

      const elementDependencies = buildElementDependencies(formRecord.form.elements);
      const initialMap = new Map([
        ["1", true],
        ["2", false],
        ["3", true],
      ]);

      const values: FormValues = { "1": "Option A" };

      const updatedMap = recomputeAffectedVisibility(
        formRecord,
        values,
        ["1"],
        elementDependencies,
        initialMap
      );

      // Element 2 should be recomputed to true
      expect(updatedMap.get("2")).toBe(true);
      // Element 3 should remain unchanged
      expect(updatedMap.get("3")).toBe(true);
    });
  });

  describe("initializeVisibilityState", () => {
    it("should initialize visibility state with element dependencies and visibility map", () => {
      const formRecord: PublicFormRecord = {
        id: "test",
        form: {
          elements: [
            createElement(1, "radio"),
            createElement(2, "textField", [{ choiceId: "1.0" }]),
          ],
        },
      } as PublicFormRecord;

      const values: FormValues = {};

      const state = initializeVisibilityState(formRecord, values);

      expect(state.elementDependencies).toBeDefined();
      expect(state.visibilityMap).toBeDefined();
      expect(state.elementDependencies.has("1")).toBe(true);
      expect(state.visibilityMap.get("1")).toBe(true);
    });
  });
});
