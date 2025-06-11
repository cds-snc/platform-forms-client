import { FormElement, PublicFormRecord } from "@gcforms/types";
import { checkVisibilityRecursive } from "@lib/formContext";

describe("Recursive visibility check", () => {
    test("Simple recursive test", async () => {
        const formRecord = {
        "id": "cmao5j1b20001wpd1pwtch9bb",
        "form": {
            "titleEn": "Test",
            "titleFr": "",
            "introduction": {
                "descriptionEn": "",
                "descriptionFr": ""
            },
            "privacyPolicy": {
                "descriptionEn": "Test",
                "descriptionFr": ""
            },
            "confirmation": {
                "descriptionEn": "",
                "descriptionFr": "",
                "referrerUrlEn": "",
                "referrerUrlFr": ""
            },
            "layout": [
                1,
                2,
                6
            ],
            "elements": [
                {
                    "id": 1,
                    "type": "radio",
                    "properties": {
                        "subElements": [],
                        "choices": [
                            {
                                "en": "In Canada",
                                "fr": ""
                            },
                            {
                                "en": "Outside of Canada",
                                "fr": ""
                            }
                        ],
                        "titleEn": "Location",
                        "titleFr": "",
                        "validation": {
                            "required": false
                        },
                        "descriptionEn": "",
                        "descriptionFr": "",
                        "placeholderEn": "",
                        "placeholderFr": "",
                        "conditionalRules": []
                    }
                },
                {
                    "id": 2,
                    "type": "radio",
                    "properties": {
                        "subElements": [],
                        "choices": [
                            {
                                "en": "Ottawa",
                                "fr": ""
                            },
                            {
                                "en": "Montreal",
                                "fr": ""
                            },
                            {
                                "en": "Other",
                                "fr": ""
                            }
                        ],
                        "titleEn": "Location in Canada",
                        "titleFr": "",
                        "validation": {
                            "required": false
                        },
                        "descriptionEn": "",
                        "descriptionFr": "",
                        "placeholderEn": "",
                        "placeholderFr": "",
                        "conditionalRules": [
                            {
                                "choiceId": "1.0"
                            }
                        ]
                    }
                },
                {
                    "id": 6,
                    "type": "combobox",
                    "properties": {
                        "subElements": [],
                        "choices": [
                            {
                                "en": "First location",
                                "fr": ""
                            },
                            {
                                "en": "Second location",
                                "fr": ""
                            },
                            {
                                "en": "Third location",
                                "fr": ""
                            }
                        ],
                        "titleEn": "Location?",
                        "titleFr": "",
                        "validation": {
                            "required": true
                        },
                        "descriptionEn": "Start typing to narrow down the list.",
                        "descriptionFr": "Commencez à taper pour réduire la liste.",
                        "placeholderEn": "",
                        "placeholderFr": "",
                        "conditionalRules": [
                            {
                                "choiceId": "2.2"
                            }
                        ]
                    }
                }
            ],
            "groups": {
                "start": {
                    "name": "Start",
                    "titleEn": "Start page",
                    "titleFr": "Start page",
                    "elements": [
                        "1",
                        "2",
                        "6"
                    ],
                    "nextAction": "review"
                },
                "review": {
                    "name": "Review",
                    "titleEn": "End (Review page and Confirmation)",
                    "titleFr": "End (Review page and Confirmation)",
                    "elements": [],
                    "nextAction": "end"
                },
                "end": {
                    "name": "End",
                    "titleEn": "Confirmation page",
                    "titleFr": "Confirmation page",
                    "elements": []
                }
            },
            "groupsLayout": [],
            "lastGeneratedElementId": 6
        },
        "isPublished": false,
        "securityAttribute": "Protected A"
        } as PublicFormRecord;

        const element = formRecord.form.elements[2];

        const valuesHidden6 = {
        "1": "Outside of Canada",
        "2": "Other",
        "6": "",
        "currentGroup": "start",
        "groupHistory": [
            "start"
        ],
        "matchedIds": [
            "1.1",
            "2.2"
        ]
        };

        const valuesVisible6 = {
        "1": "In Canada",
        "2": "Other",
        "6": "First location",
        "currentGroup": "start",
        "groupHistory": [
            "start"
        ],
        "matchedIds": [
            "1.0",
            "2.2",
            "6.0"
        ]
        }

        const isVisible = checkVisibilityRecursive(formRecord, element, valuesHidden6);
        expect(isVisible).toEqual(false);

        const isVisible2 = checkVisibilityRecursive(formRecord, element, valuesVisible6);
        expect(isVisible2).toEqual(true);
    });

    test("Complex recursive test", async () => {
        const formRecord = {
            "id": "cmapim4bc0001wpigmcpfwviq",
            "form": {
                "titleEn": "This is a complex form",
                "titleFr": "",
                "introduction": {
                    "descriptionEn": "",
                    "descriptionFr": ""
                },
                "privacyPolicy": {
                    "descriptionEn": "",
                    "descriptionFr": ""
                },
                "confirmation": {
                    "descriptionEn": "",
                    "descriptionFr": "",
                    "referrerUrlEn": "",
                    "referrerUrlFr": ""
                },
                "layout": [
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10
                ],
                "elements": [
                    {
                        "id": 1,
                        "type": "radio",
                        "properties": {
                            "choices": [
                                {
                                    "en": "One",
                                    "fr": ""
                                },
                                {
                                    "en": "Two",
                                    "fr": ""
                                },
                                {
                                    "en": "Three",
                                    "fr": ""
                                }
                            ],
                            "titleEn": "Pick your path",
                            "titleFr": "",
                            "validation": {
                                "required": false
                            },
                            "subElements": [],
                            "descriptionEn": "",
                            "descriptionFr": "",
                            "placeholderEn": "",
                            "placeholderFr": "",
                            "conditionalRules": []
                        }
                    },
                    {
                        "id": 2,
                        "type": "textField",
                        "properties": {
                            "choices": [
                                {
                                    "en": "",
                                    "fr": ""
                                }
                            ],
                            "titleEn": "One",
                            "titleFr": "",
                            "validation": {
                                "required": true
                            },
                            "subElements": [],
                            "descriptionEn": "",
                            "descriptionFr": "",
                            "placeholderEn": "",
                            "placeholderFr": "",
                            "conditionalRules": [
                                {
                                    "choiceId": "1.0"
                                }
                            ]
                        }
                    },
                    {
                        "id": 3,
                        "type": "textField",
                        "properties": {
                            "choices": [
                                {
                                    "en": "",
                                    "fr": ""
                                }
                            ],
                            "titleEn": "Two",
                            "titleFr": "",
                            "validation": {
                                "required": true
                            },
                            "subElements": [],
                            "descriptionEn": "",
                            "descriptionFr": "",
                            "placeholderEn": "",
                            "placeholderFr": "",
                            "conditionalRules": [
                                {
                                    "choiceId": "1.1"
                                }
                            ]
                        }
                    },
                    {
                        "id": 4,
                        "type": "radio",
                        "properties": {
                            "choices": [
                                {
                                    "en": "A",
                                    "fr": ""
                                },
                                {
                                    "en": "B",
                                    "fr": ""
                                },
                                {
                                    "en": "C",
                                    "fr": ""
                                }
                            ],
                            "titleEn": "Three",
                            "titleFr": "",
                            "validation": {
                                "required": true
                            },
                            "subElements": [],
                            "descriptionEn": "",
                            "descriptionFr": "",
                            "placeholderEn": "",
                            "placeholderFr": "",
                            "conditionalRules": [
                                {
                                    "choiceId": "1.2"
                                }
                            ]
                        }
                    },
                    {
                        "id": 5,
                        "type": "textField",
                        "properties": {
                            "choices": [
                                {
                                    "en": "",
                                    "fr": ""
                                }
                            ],
                            "titleEn": "A",
                            "titleFr": "",
                            "validation": {
                                "required": true
                            },
                            "subElements": [],
                            "descriptionEn": "",
                            "descriptionFr": "",
                            "placeholderEn": "",
                            "placeholderFr": "",
                            "conditionalRules": [
                                {
                                    "choiceId": "4.0"
                                }
                            ]
                        }
                    },
                    {
                        "id": 6,
                        "type": "textField",
                        "properties": {
                            "choices": [
                                {
                                    "en": "",
                                    "fr": ""
                                }
                            ],
                            "titleEn": "B",
                            "titleFr": "",
                            "validation": {
                                "required": true
                            },
                            "subElements": [],
                            "descriptionEn": "",
                            "descriptionFr": "",
                            "placeholderEn": "",
                            "placeholderFr": "",
                            "conditionalRules": [
                                {
                                    "choiceId": "4.1"
                                }
                            ]
                        }
                    },
                    {
                        "id": 7,
                        "type": "radio",
                        "properties": {
                            "choices": [
                                {
                                    "en": "1",
                                    "fr": ""
                                },
                                {
                                    "en": "2",
                                    "fr": ""
                                },
                                {
                                    "en": "3",
                                    "fr": ""
                                }
                            ],
                            "titleEn": "C",
                            "titleFr": "",
                            "validation": {
                                "required": false
                            },
                            "subElements": [],
                            "descriptionEn": "",
                            "descriptionFr": "",
                            "placeholderEn": "",
                            "placeholderFr": "",
                            "conditionalRules": [
                                {
                                    "choiceId": "4.2"
                                }
                            ]
                        }
                    },
                    {
                        "id": 8,
                        "type": "textField",
                        "properties": {
                            "choices": [
                                {
                                    "en": "",
                                    "fr": ""
                                }
                            ],
                            "titleEn": "1",
                            "titleFr": "",
                            "validation": {
                                "required": true
                            },
                            "subElements": [],
                            "descriptionEn": "",
                            "descriptionFr": "",
                            "placeholderEn": "",
                            "placeholderFr": "",
                            "conditionalRules": [
                                {
                                    "choiceId": "7.0"
                                }
                            ]
                        }
                    },
                    {
                        "id": 9,
                        "type": "textField",
                        "properties": {
                            "choices": [
                                {
                                    "en": "",
                                    "fr": ""
                                }
                            ],
                            "titleEn": "2",
                            "titleFr": "",
                            "validation": {
                                "required": true
                            },
                            "subElements": [],
                            "descriptionEn": "",
                            "descriptionFr": "",
                            "placeholderEn": "",
                            "placeholderFr": "",
                            "conditionalRules": [
                                {
                                    "choiceId": "7.1"
                                }
                            ]
                        }
                    },
                    {
                        "id": 10,
                        "type": "textField",
                        "properties": {
                            "choices": [
                                {
                                    "en": "",
                                    "fr": ""
                                }
                            ],
                            "titleEn": "3",
                            "titleFr": "",
                            "validation": {
                                "required": true
                            },
                            "subElements": [],
                            "descriptionEn": "",
                            "descriptionFr": "",
                            "placeholderEn": "",
                            "placeholderFr": "",
                            "conditionalRules": [
                                {
                                    "choiceId": "7.2"
                                }
                            ]
                        }
                    }
                ],
                "groups": {
                    "end": {
                        "name": "End",
                        "titleEn": "Confirmation page",
                        "titleFr": "Confirmation page",
                        "elements": []
                    },
                    "start": {
                        "name": "Start",
                        "titleEn": "Start page",
                        "titleFr": "Start page",
                        "elements": [
                            "1",
                            "2",
                            "3",
                            "4",
                            "5",
                            "6",
                            "7",
                            "8",
                            "9",
                            "10"
                        ],
                        "nextAction": "review"
                    },
                    "review": {
                        "name": "Review",
                        "titleEn": "End (Review page and Confirmation)",
                        "titleFr": "End (Review page and Confirmation)",
                        "elements": [],
                        "nextAction": "end"
                    }
                },
                "groupsLayout": [],
                "lastGeneratedElementId": 10
            },
            "isPublished": false,
            "securityAttribute": "Protected A"
        } as PublicFormRecord;

        // Helper to get element by id
        const getElement = (id: number) =>
            formRecord.form.elements.find((el: FormElement) => el.id === id) as FormElement;

        // 1. Only "One" selected, should show element 2, not 3 or 4
        const valuesOne = {
            "1": "One",
            "2": "",
            "3": "",
            "4": "",
            "5": "",
            "6": "",
            "7": "",
            "8": "",
            "9": "",
            "10": "",
            "matchedIds": ["1.0"],
            "groupHistory": ["start"],
        };
        expect(checkVisibilityRecursive(formRecord, getElement(2), valuesOne)).toBe(true);
        expect(checkVisibilityRecursive(formRecord, getElement(3), valuesOne)).toBe(false);
        expect(checkVisibilityRecursive(formRecord, getElement(4), valuesOne)).toBe(false);

        // 2. "Three" selected, should show element 4, not 2 or 3
        const valuesThree = {
            "1": "Three",
            "2": "",
            "3": "",
            "4": "",
            "5": "",
            "6": "",
            "7": "",
            "8": "",
            "9": "",
            "10": "",
            "matchedIds": ["1.2"],
            "groupHistory": ["start"],
        };
        expect(checkVisibilityRecursive(formRecord, getElement(4), valuesThree)).toBe(true);
        expect(checkVisibilityRecursive(formRecord, getElement(2), valuesThree)).toBe(false);
        expect(checkVisibilityRecursive(formRecord, getElement(3), valuesThree)).toBe(false);

        // 3. "Three" selected, "A" selected in element 4, should show element 5
        const valuesThreeA = {
            "1": "Three",
            "4": "A",
            "matchedIds": ["1.2", "4.0"],
            "groupHistory": ["start"],
        };
        expect(checkVisibilityRecursive(formRecord, getElement(5), valuesThreeA)).toBe(true);
        expect(checkVisibilityRecursive(formRecord, getElement(6), valuesThreeA)).toBe(false);

        // 4. "Three" selected, "B" selected in element 4, should show element 6
        const valuesThreeB = {
            "1": "Three",
            "4": "B",
            "matchedIds": ["1.2", "4.1"],
            "groupHistory": ["start"],
        };
        expect(checkVisibilityRecursive(formRecord, getElement(6), valuesThreeB)).toBe(true);
        expect(checkVisibilityRecursive(formRecord, getElement(5), valuesThreeB)).toBe(false);

        // 5. "Three" selected, "C" selected in element 4, "2" selected in element 7, should show element 9
        const valuesThreeC2 = {
            "1": "Three",
            "4": "C",
            "7": "2",
            "matchedIds": ["1.2", "4.2", "7.1"],
            "groupHistory": ["start"],
        };
        expect(checkVisibilityRecursive(formRecord, getElement(7), valuesThreeC2)).toBe(true);
        expect(checkVisibilityRecursive(formRecord, getElement(9), valuesThreeC2)).toBe(true);
        expect(checkVisibilityRecursive(formRecord, getElement(8), valuesThreeC2)).toBe(false);
        expect(checkVisibilityRecursive(formRecord, getElement(10), valuesThreeC2)).toBe(false);

        // 6. "Three" selected, "C" selected in element 4, "3" selected in element 7, should show element 10
        const valuesThreeC3 = {
            "1": "Three",
            "4": "C",
            "7": "3",
            "matchedIds": ["1.2", "4.2", "7.2"],
            "groupHistory": ["start"],
        };
        expect(checkVisibilityRecursive(formRecord, getElement(10), valuesThreeC3)).toBe(true);
        expect(checkVisibilityRecursive(formRecord, getElement(8), valuesThreeC3)).toBe(false);
        expect(checkVisibilityRecursive(formRecord, getElement(9), valuesThreeC3)).toBe(false);

        // 7. "Two" selected, should show element 3, not 2 or 4
        const valuesTwo = {
            "1": "Two",
            "matchedIds": ["1.1"],
            "groupHistory": ["start"],
        };
        expect(checkVisibilityRecursive(formRecord, getElement(3), valuesTwo)).toBe(true);
        expect(checkVisibilityRecursive(formRecord, getElement(2), valuesTwo)).toBe(false);
        expect(checkVisibilityRecursive(formRecord, getElement(4), valuesTwo)).toBe(false);

        // 8. "Three" selected, "C" selected in element 4, "1" selected in element 7, should show element 8
        const valuesThreeC1 = {
            "1": "Three",
            "4": "C",
            "7": "1",
            "matchedIds": ["1.2", "4.2", "7.0"],
            "groupHistory": ["start"],
        };
        expect(checkVisibilityRecursive(formRecord, getElement(8), valuesThreeC1)).toBe(true);
        expect(checkVisibilityRecursive(formRecord, getElement(9), valuesThreeC1)).toBe(false);
        expect(checkVisibilityRecursive(formRecord, getElement(10), valuesThreeC1)).toBe(false);
    });
})