import { describe, expect, it } from "vitest";
import { type FormProperties } from "@gcforms/types";
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
});
