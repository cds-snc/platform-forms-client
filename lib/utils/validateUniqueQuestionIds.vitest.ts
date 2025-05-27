import { describe, it, expect } from "vitest";
import { isUniqueQuestionId, validateUniqueQuestionIds } from "./validateUniqueQuestionIds";
import { FormElement, FormElementTypes } from "@gcforms/types";

const mockElements: FormElement[] = [
    {
        id: 1, 
        properties: {
            questionId: "q1", 
            titleEn: "",
            titleFr: ""
        },
        type: FormElementTypes.textField
    },
    {
        id: 2, 
        properties: {
            questionId: "q2", 
            titleEn: "",
            titleFr: ""
        },
        type: FormElementTypes.textField
    },
    {
        id: 3, 
        properties: {
            questionId: "q3", 
            subElements: [
                {
                    id: 3.1, 
                    properties: {
                        questionId: "q3.1", 
                        titleEn: "",
                        titleFr: ""
                    },
                    type: FormElementTypes.textField
                }
            ],
            titleEn: "",
            titleFr: ""
        },
        type: FormElementTypes.textField
    },
    {
        id: 4, 
        properties: {
            questionId: "q4", 
            titleEn: "",
            titleFr: ""
        },
        type: FormElementTypes.textField
    }
];

describe("isUniqueQuestionId", () => {
    it("should return true if the questionId is unique", () => {
        const result = isUniqueQuestionId(mockElements, "q4", {
            id: 4, 
            properties: {
                questionId: "q4", 
                titleEn: "",
                titleFr: ""
            },
            type: FormElementTypes.textField
        });
        expect(result).toBe(true);
    });

    it("should return false if the questionId is not unique", () => {
        const result = isUniqueQuestionId(mockElements, "q2", {
            id: 4, properties: {
                questionId: "q4", 
                titleEn: "",
                titleFr: ""
            },
            type: FormElementTypes.textField
        });
        expect(result).toBe(false);
    });

    it("should ignore the current item's questionId", () => {
        const result = isUniqueQuestionId(mockElements, "q2", {
            id: 2, 
            properties: {
                questionId: "q2", 
                titleEn: "",
                titleFr: ""
            },
            type: FormElementTypes.textField
        });
        expect(result).toBe(true);
    });
});

describe("validateUniqueQuestionIds", () => {
    it("should return true if all questionIds are unique", () => {
        const result = validateUniqueQuestionIds(mockElements);
        expect(result).toBe(true);
    });

    it("should return false if there are duplicate questionIds", () => {
        const elementsWithDuplicates: FormElement[] = [
            ...mockElements,
            {
                id: 4, 
                properties: {
                    questionId: "q2", 
                    titleEn: "",
                    titleFr: ""
                },
                type: FormElementTypes.textField
            }
        ];
        const result = validateUniqueQuestionIds(elementsWithDuplicates);
        expect(result).toBe(false);
    });
});
