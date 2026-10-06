import { describe, expect, it } from "vitest";
import { type FormProperties } from "@gcforms/types";
import navigationFocus from "@root/__fixtures__/navigationFocus.json";
import { validateTemplate } from "@lib/utils/form-builder/validate";
import { transformFormProperties } from "./transformFormProperties";

describe("transformFormProperties", () => {
  it("removes elements not referenced by groups and keeps layout in sync", () => {
    const form = {
      titleEn: "test",
      titleFr: "test",
      introduction: { descriptionEn: "", descriptionFr: "" },
      privacyPolicy: { descriptionEn: "test", descriptionFr: "test" },
      confirmation: {
        descriptionEn: "test",
        descriptionFr: "test",
        referrerUrlEn: "",
        referrerUrlFr: "",
      },
      layout: [1, 2, 3],
      elements: [
        {
          id: 4,
          type: "textField",
          properties: {
            titleEn: "q4",
            titleFr: "",
            questionId: "",
            validation: { required: false },
            choices: [],
            tags: [],
            subElements: [],
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
          },
        },
        {
          id: 2,
          type: "textField",
          properties: {
            titleEn: "q2",
            titleFr: "test",
            questionId: "",
            validation: { required: false },
            choices: [],
            tags: [],
            subElements: [],
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
          },
        },
        {
          id: 3,
          type: "textField",
          properties: {
            titleEn: "q3",
            titleFr: "test",
            questionId: "",
            validation: { required: false },
            choices: [],
            tags: [],
            subElements: [],
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
          },
        },
        {
          id: 1,
          type: "textField",
          properties: {
            titleEn: "q1",
            titleFr: "test",
            questionId: "",
            validation: { required: false },
            choices: [],
            tags: [],
            subElements: [],
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
          },
        },
      ],
      groups: {
        start: {
          name: "Start",
          titleEn: "Start page",
          titleFr: "Page de depart",
          autoFlow: true,
          elements: ["1"],
          nextAction: "review",
        },
        p2: {
          name: "p2",
          titleEn: "",
          titleFr: "",
          autoFlow: true,
          elements: ["2", "3"],
          nextAction: "end",
        },
        review: {
          name: "Review",
          titleEn: "End (Review page and Confirmation)",
          titleFr: "Fin (Page recapitulative et confirmation)",
          autoFlow: true,
          elements: [],
        },
        end: {
          name: "End",
          titleEn: "Confirmation page",
          titleFr: "Page de confirmation",
          autoFlow: true,
          elements: [],
          nextAction: "start",
        },
      },
      groupsLayout: ["p2"],
      lastGeneratedElementId: 4,
    } as FormProperties;

    const transformed = transformFormProperties(form);

    expect(transformed.elements.map((element) => element.id)).toEqual([2, 3, 1]);
    expect(transformed.layout).toEqual([1, 2, 3]);
    expect(transformed.groupsLayout).toEqual(["p2"]);
  });

  it("applies ensureUUID and updateNumberInputType to dynamicRow subElements", () => {
    const form = {
      titleEn: "test",
      titleFr: "test",
      introduction: { descriptionEn: "", descriptionFr: "" },
      privacyPolicy: { descriptionEn: "test", descriptionFr: "test" },
      confirmation: {
        descriptionEn: "test",
        descriptionFr: "test",
        referrerUrlEn: "",
        referrerUrlFr: "",
      },
      layout: [1],
      elements: [
        {
          id: 1,
          type: "dynamicRow",
          uuid: "parent-uuid",
          properties: {
            titleEn: "row",
            titleFr: "",
            questionId: "",
            validation: { required: false },
            choices: [],
            tags: [],
            subElements: [
              {
                id: 101,
                type: "textField",
                properties: {
                  titleEn: "legacy number",
                  titleFr: "",
                  questionId: "",
                  validation: { required: false, type: "number" },
                  choices: [],
                  tags: [],
                  subElements: [],
                  descriptionEn: "",
                  descriptionFr: "",
                  placeholderEn: "",
                  placeholderFr: "",
                },
              },
            ],
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
          },
        },
      ],
      groups: {
        start: {
          name: "Start",
          titleEn: "Start page",
          titleFr: "Page de depart",
          autoFlow: true,
          elements: ["1"],
          nextAction: "end",
        },
        review: {
          name: "Review",
          titleEn: "End (Review page and Confirmation)",
          titleFr: "Fin (Page recapitulative et confirmation)",
          autoFlow: true,
          elements: [],
        },
        end: {
          name: "End",
          titleEn: "Confirmation page",
          titleFr: "Page de confirmation",
          autoFlow: true,
          elements: [],
          nextAction: "start",
        },
      },
      groupsLayout: [],
      lastGeneratedElementId: 1,
    } as unknown as FormProperties;

    const transformed = transformFormProperties(form);
    const subElement = transformed.elements[0].properties.subElements![0];

    expect(subElement.type).toBe("numberInput");
    expect(subElement.uuid).toBeDefined();
  });

  it("removes empty exit URLs before template validation", () => {
    const form = structuredClone(navigationFocus) as FormProperties;
    form.groups!["exit-page"] = {
      name: "Exit",
      titleEn: "Exit",
      titleFr: "Sortie",
      elements: [],
      nextAction: "exit",
      exitUrlEn: "",
      exitUrlFr: "http://test-en",
    };

    expect(validateTemplate(form).errors).toContainEqual({
      property: "groups.exit-page.exitUrlEn",
      message: "formInvalidProperty",
    });

    const transformed = transformFormProperties(form);
    const errors = validateTemplate(transformed).errors;

    expect(transformed.groups!["exit-page"].exitUrlEn).toBeUndefined();
    expect(transformed.groups!["exit-page"].exitUrlFr).toBe("http://test-en");
    expect(errors).not.toContainEqual({
      property: "groups.exit-page.exitUrlEn",
      message: "formInvalidProperty",
    });
    expect(errors).not.toContainEqual({
      property: "groups.exit-page.exitUrlFr",
      message: "formInvalidProperty",
    });
  });
});
