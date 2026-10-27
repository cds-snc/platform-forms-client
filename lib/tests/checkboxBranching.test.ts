import { describe, expect, it } from "vitest";
import type { FormValues, NextActionRule, PublicFormRecord } from "@gcforms/types";
import { getNextAction } from "@lib/formContext";
import { getReviewItems } from "@clientComponents/forms/Review/helpers";
import { getValuesWithMatchedIds, mapIdsToValues } from "../../packages/core/src/helpers";
import {
  checkPageVisibility,
  getVisibleGroupsBasedOnValuesRecursive,
} from "../../packages/core/src/visibility";
import { validate } from "../../packages/core/src/process";

const createRecord = (nextAction: NextActionRule[]): PublicFormRecord => ({
  id: "checkbox-branching",
  isPublished: false,
  securityAttribute: "Unclassified",
  form: {
    titleEn: "Checkbox branching",
    titleFr: "",
    layout: [1, 2],
    elements: [
      {
        id: 1,
        type: "checkbox",
        properties: {
          titleEn: "Select all that apply",
          titleFr: "",
          choices: ["One", "Two", "Three", "Four"].map((en) => ({ en, fr: `${en} FR` })),
        },
      },
      {
        id: 2,
        type: "textField",
        properties: {
          titleEn: "Pilot question",
          titleFr: "",
          validation: { required: true },
        },
      },
    ],
    groups: {
      start: { name: "Start", titleEn: "Start", titleFr: "", elements: ["1"], nextAction },
      pilot: {
        name: "Pilot",
        titleEn: "Pilot",
        titleFr: "",
        elements: ["2"],
        nextAction: "review",
      },
      review: { name: "Review", titleEn: "Review", titleFr: "", elements: [], nextAction: "end" },
      end: { name: "End", titleEn: "End", titleFr: "", elements: [] },
    },
  },
});

describe("checkbox branching consistency", () => {
  const scenarios: { name: string; rules: NextActionRule[]; destination: string }[] = [
    {
      name: "original form: later choices skip the pilot",
      rules: [
        { choiceId: "1.2", groupId: "review" },
        { choiceId: "1.3", groupId: "review" },
        { choiceId: "1.catch-all", groupId: "pilot" },
      ],
      destination: "review",
    },
    {
      name: "replication form: earlier choices visit the pilot",
      rules: [
        { choiceId: "1.0", groupId: "pilot" },
        { choiceId: "1.1", groupId: "pilot" },
        { choiceId: "1.catch-all", groupId: "review" },
      ],
      destination: "pilot",
    },
    {
      name: "conflicting destinations: last explicit rule wins",
      rules: [
        { choiceId: "1.catch-all", groupId: "pilot" },
        { choiceId: "1.3", groupId: "pilot" },
        { choiceId: "1.0", groupId: "review" },
      ],
      destination: "review",
    },
  ];

  for (const { name, rules, destination } of scenarios) {
    it.each([
      ["One", "Two", "Three", "Four"],
      ["Three", "One", "Two", "Four"],
      ["Four FR", "Three FR", "Two FR", "One FR"],
    ])(`${name}, selection order %j`, (...selected) => {
      const record = createRecord(rules);
      const groups = record.form.groups!;
      const values: FormValues = { "1": selected, "2": "" };
      const matched = getValuesWithMatchedIds(record.form.elements, values);
      const path = getVisibleGroupsBasedOnValuesRecursive(record, matched, "start");
      const visitsPilot = destination === "pilot";

      expect(getNextAction(groups, "start", mapIdsToValues(record.form.elements, values))).toBe(
        destination
      );
      expect(path).toEqual(visitsPilot ? ["start", "pilot", "review"] : ["start", "review"]);
      expect(path[path.indexOf("review") - 1]).toBe(visitsPilot ? "pilot" : "start");
      expect(checkPageVisibility(record, record.form.elements[1], values)).toBe(visitsPilot);
      expect(
        validate({ formRecord: record, values: { ...values }, currentGroup: "pilot" })
      ).toEqual(visitsPilot ? { "2": "input-validation.required" } : {});

      // Review and downloadable summaries share this section builder.
      const sections = getReviewItems({
        formRecord: record,
        formValues: values,
        groups,
        groupHistoryIds: path,
        language: "en",
      });
      expect(sections.map((section) => section.id)).toEqual(
        visitsPilot ? ["start", "pilot"] : ["start"]
      );
    });
  }

  it.each([[], ["Two"], ["Unknown choice"]])(
    "uses catch-all when no explicit rule matches %j",
    (...selected) => {
      const record = createRecord([
        { choiceId: "1.2", groupId: "review" },
        { choiceId: "1.catch-all", groupId: "pilot" },
      ]);
      const values: FormValues = { "1": selected };

      expect(
        getVisibleGroupsBasedOnValuesRecursive(
          record,
          getValuesWithMatchedIds(record.form.elements, values),
          "start"
        )
      ).toEqual(["start", "pilot", "review"]);
    }
  );

  it("ignores stale rules from another page even when they are last", () => {
    const record = createRecord([
      { choiceId: "1.0", groupId: "review" },
      { choiceId: "99.0", groupId: "pilot" },
      { choiceId: "1.catch-all", groupId: "pilot" },
    ]);

    expect(
      getVisibleGroupsBasedOnValuesRecursive(record, { "1": ["1.0"], "99": "99.0" }, "start")
    ).toEqual(["start", "review"]);
  });

  it.each(["radio", "dropdown"] as const)("preserves single-choice %s branching", (type) => {
    const record = createRecord([
      { choiceId: "1.2", groupId: "review" },
      { choiceId: "1.catch-all", groupId: "pilot" },
    ]);
    record.form.elements[0].type = type;
    const values: FormValues = { "1": "Three" };

    expect(
      getVisibleGroupsBasedOnValuesRecursive(
        record,
        getValuesWithMatchedIds(record.form.elements, values),
        "start"
      )
    ).toEqual(["start", "review"]);
    expect(
      getNextAction(record.form.groups!, "start", mapIdsToValues(record.form.elements, values))
    ).toBe("review");
  });
});
