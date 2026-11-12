import { describe, expect, it } from "vitest";
import { deduplicateTemplateProblems } from "./deduplicateTemplateProblems";

describe("deduplicateTemplateProblems", () => {
  it("removes repeated problems across path formats without changing order or migration metadata", () => {
    const first = {
      path: "elements[0].properties.choices[1].fr",
      name: "required",
      message: "Missing French label",
      fromVersion: 1,
    };
    const other = { ...first, path: "elements[1].properties.choices[1].fr" };
    const problems = [
      first,
      other,
      { ...first },
      { ...first, path: "elements.0.properties.choices.1.fr" },
      { ...other },
    ];
    const original = structuredClone(problems);

    const result = deduplicateTemplateProblems(problems);
    expect(result).toEqual([first, other]);
    expect(result[0]).toBe(first);
    expect(problems).toEqual(original);
  });

  it("preserves different rules, messages, fields and languages, including form-level problems", () => {
    const first = { path: "elements.0.properties.choices.1.fr", name: "type", message: "Invalid" };
    const problems = [
      first,
      { ...first, name: "required" },
      { ...first, message: "Must be a string" },
      { ...first, path: "elements.0.properties.choices.1.en" },
      { path: "", name: "template", message: "Invalid navigation" },
      { path: "", name: "template", message: "Duplicate question ID" },
    ];
    expect(deduplicateTemplateProblems([...problems, ...problems])).toEqual(problems);
  });
});
