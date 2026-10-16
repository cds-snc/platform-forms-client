import { describe, expect, it } from "vitest";
import navigationFocus from "../../../__fixtures__/navigationFocus.json";
import { FormProperties } from "@lib/types";
import { validateTemplate } from "./validate";

describe("validateTemplate", () => {
  it("requires groups and groupsLayout to be provided together", () => {
    const templateWithGroupsOnly = JSON.parse(JSON.stringify(navigationFocus)) as FormProperties;
    delete templateWithGroupsOnly.groupsLayout;

    const templateWithGroupsLayoutOnly = JSON.parse(
      JSON.stringify(navigationFocus)
    ) as FormProperties;
    delete templateWithGroupsLayoutOnly.groups;

    expect(validateTemplate(templateWithGroupsOnly).errors).toContainEqual({
      property: "groupsLayout",
      message: "formMissingProperty",
    });
    expect(validateTemplate(templateWithGroupsLayoutOnly).errors).toContainEqual({
      property: "groups",
      message: "formMissingProperty",
    });
  });

  it("reports full paths for invalid grouped navigation", () => {
    const invalidTemplate = JSON.parse(JSON.stringify(navigationFocus)) as FormProperties;
    delete invalidTemplate.groups?.review.nextAction;
    invalidTemplate.groups!.end.nextAction = "review";

    expect(validateTemplate(invalidTemplate).errors).toEqual([
      { property: "groups.review.nextAction", message: "formMissingProperty" },
      { property: "groups.end.nextAction", message: "formInvalidProperty" },
    ]);
  });

  it("reports each invalid property once", () => {
    const invalidTemplate = JSON.parse(JSON.stringify(navigationFocus)) as FormProperties;
    invalidTemplate.groups!["exit-page"] = {
      name: "Exit page",
      titleEn: "Exit page",
      titleFr: "Page de sortie",
      elements: [],
      nextAction: "exit",
      exitUrlEn: "not-a-url",
      exitUrlFr: "",
    };

    expect(validateTemplate(invalidTemplate).errors).toEqual([
      { property: "groups.exit-page.exitUrlEn", message: "formInvalidProperty" },
      { property: "groups.exit-page.exitUrlFr", message: "formInvalidProperty" },
    ]);
  });

  it("reports navigation cycles", () => {
    const cyclicTemplate = JSON.parse(JSON.stringify(navigationFocus)) as FormProperties;
    const firstPageId = cyclicTemplate.groupsLayout?.[0];
    cyclicTemplate.groups![firstPageId!].nextAction = "start";

    expect(validateTemplate(cyclicTemplate).errors).toContainEqual({
      message: "startErrorNavigationCycle",
    });
  });

  it("reports strict element failures from oneOf schemas", () => {
    const invalidTemplate = JSON.parse(JSON.stringify(navigationFocus)) as FormProperties;
    const elementId = Math.max(...invalidTemplate.elements.map(({ id }) => id)) + 1;
    const elementIndex = invalidTemplate.elements.length;
    invalidTemplate.schemaVersion = 2;
    invalidTemplate.elements.push({
      id: elementId,
      type: "richText",
      properties: {
        questionId: "strict-rich-text",
        validation: { required: false },
        choices: [{ en: "", fr: "" }],
      },
    } as FormProperties["elements"][number]);
    invalidTemplate.layout.push(elementId);
    invalidTemplate.groups!.start.elements.push(String(elementId));

    const result = validateTemplate(invalidTemplate);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      property: `elements.${elementIndex}.properties.choices`,
      message: "formInvalidProperty",
    });
  });
});
