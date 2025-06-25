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

    test.skip("Visibility with groups", async () => {
        const formRecord = {
            "id": "cmapim4bc0001wpigmcpfwviq",
            "form": {
                "titleEn": "My profile",
                "titleFr": "My profile [FR]",
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
                    3,
                    4,
                    5,
                    12,
                    7,
                    8,
                    9,
                    10,
                    11,
                    13
                ],
                "elements": [
                    {
                        "id": 10,
                        "type": "textArea",
                        "uuid": "df6f14ba-cfc0-4c50-8e4e-1418b7dcd7b9",
                        "properties": {
                            "tags": [],
                            "choices": [
                            {
                                "en": "",
                                "fr": ""
                            }
                            ],
                            "titleEn": "Message",
                            "titleFr": "Message [FR]",
                            "questionId": "",
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
                        "id": 11,
                        "type": "textField",
                        "uuid": "913a92ca-b626-40e4-be39-a0f7a6abbb28",
                        "properties": {
                            "tags": [],
                            "choices": [
                            {
                                "en": "",
                                "fr": ""
                            }
                            ],
                            "titleEn": "Discount code",
                            "titleFr": "Discount code [FR]",
                            "questionId": "",
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
                                "choiceId": "1.0"
                            }
                            ]
                        }
                    },
                    {
                        "id": 13,
                        "type": "textField",
                        "uuid": "12e92ac2-83f0-4830-a7c3-5df2fd0582de",
                        "properties": {
                            "tags": [],
                            "choices": [
                                {
                                    "en": "",
                                    "fr": ""
                                }
                            ],
                            "titleEn": "Who do you want to refer?",
                            "titleFr": "Who do you want to refer? [FR]",
                            "questionId": "",
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
                                    "choiceId": "12.0"
                                }
                            ]
                        }
                    },
                    {
                        "id": 12,
                        "type": "dropdown",
                        "uuid": "9044b1e8-d615-4bff-9c8c-f0a19e0b1195",
                        "properties": {
                            "tags": [],
                            "choices": [
                            {
                                "en": "yes",
                                "fr": "yes [FR]"
                            },
                            {
                                "en": "no",
                                "fr": "no [FR]"
                            }
                            ],
                            "titleEn": "Do you want to refer anyone?",
                            "titleFr": "Do you want to refer anyone? [FR]",
                            "questionId": "",
                            "validation": {
                                "required": false
                            },
                            "subElements": [],
                            "descriptionEn": "",
                            "descriptionFr": "",
                            "placeholderEn": "",
                            "placeholderFr": ""
                        }
                    },
                    {
                        "id": 7,
                        "type": "textField",
                        "properties": {
                            "choices": [
                            {
                                "en": "",
                                "fr": ""
                            }
                            ],
                            "titleEn": "Phone number",
                            "titleFr": "Numéro de téléphone",
                            "validation": {
                                "required": false
                            },
                            "subElements": [],
                            "autoComplete": "tel",
                            "descriptionEn": "For example: 111-222-3333",
                            "descriptionFr": "Par exemple : 111-222-3333",
                            "placeholderEn": "",
                            "placeholderFr": "",
                            "conditionalRules": []
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
                            "titleEn": "Email address",
                            "titleFr": "Adresse courriel",
                            "validation": {
                                "type": "email",
                                "required": false
                            },
                            "subElements": [],
                            "autoComplete": "email",
                            "descriptionEn": "For example: name@example.com",
                            "descriptionFr": "Par exemple : nom@exemple.com",
                            "placeholderEn": "",
                            "placeholderFr": "",
                            "conditionalRules": []
                        }
                    },
                    {
                        "id": 9,
                        "type": "radio",
                        "properties": {
                            "choices": [
                                {
                                    "en": "English",
                                    "fr": "anglais"
                                },
                                {
                                    "en": "French",
                                    "fr": "français"
                                }
                            ],
                            "titleEn": "Preferred language for communication",
                            "titleFr": "Langue de communication préférée",
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
                        "id": 3,
                        "type": "textField",
                        "properties": {
                            "choices": [
                            {
                                "en": "",
                                "fr": ""
                            }
                            ],
                            "titleEn": "Phone number",
                            "titleFr": "Numéro de téléphone",
                            "validation": {
                                "required": false
                            },
                            "subElements": [],
                            "autoComplete": "tel",
                            "descriptionEn": "For example: 111-222-3333",
                            "descriptionFr": "Par exemple : 111-222-3333",
                            "placeholderEn": "",
                            "placeholderFr": "",
                            "conditionalRules": []
                        }
                    },
                    {
                        "id": 4,
                        "type": "textField",
                        "properties": {
                            "choices": [
                                {
                                    "en": "",
                                    "fr": ""
                                }
                            ],
                            "titleEn": "Email address",
                            "titleFr": "Adresse courriel",
                            "validation": {
                                "type": "email",
                                "required": false
                            },
                            "subElements": [],
                            "autoComplete": "email",
                            "descriptionEn": "For example: name@example.com",
                            "descriptionFr": "Par exemple : nom@exemple.com",
                            "placeholderEn": "",
                            "placeholderFr": "",
                            "conditionalRules": []
                        }
                    },
                    {
                        "id": 5,
                        "type": "radio",
                        "properties": {
                            "choices": [
                            {
                                "en": "English",
                                "fr": "anglais"
                            },
                            {
                                "en": "French",
                                "fr": "français"
                            }
                            ],
                            "titleEn": "Preferred language for communication",
                            "titleFr": "Langue de communication préférée",
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
                        "id": 1,
                        "type": "radio",
                        "uuid": "55904651-b515-4e42-81e8-68b308118b5d",
                        "properties": {
                            "tags": [],
                            "choices": [
                                {
                                    "en": "yes",
                                    "fr": "yes [FR]"
                                },
                                {
                                    "en": "no",
                                    "fr": "no [FR]"
                                }
                            ],
                            "titleEn": "Do you have an account?",
                            "titleFr": "Do you have an account? [FR]",
                            "questionId": "",
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
                    }
                ],
                "groups": {
                    "end": {
                        "name": "End",
                        "titleEn": "Confirmation page",
                        "titleFr": "Page de confirmation",
                        "elements": []
                    },
                    "start": {
                        "name": "Start",
                        "titleEn": "Start page",
                        "titleFr": "Page de départ",
                        "autoFlow": false,
                        "elements": [
                            "1"
                        ],
                        "nextAction": [
                            {
                                "groupId": "598121d4-5439-4b58-a3e0-517579aafb0e",
                                "choiceId": "1.0"
                            },
                            {
                                "groupId": "f695c318-73c3-4ba1-8807-6594992ac528",
                                "choiceId": "1.1"
                            }
                        ]
                    },
                    "review": {
                        "name": "Review",
                        "titleEn": "End (Review page and Confirmation)",
                        "titleFr": "Fin (Page récapitulative et confirmation)",
                        "elements": [],
                        "nextAction": "end"
                    },
                    "598121d4-5439-4b58-a3e0-517579aafb0e": {
                        "name": "Has account",
                        "titleEn": "Details",
                        "titleFr": "Details [FR]",
                        "autoFlow": false,
                        "elements": [
                            "3",
                            "4",
                            "5",
                            "12"
                        ],
                        "nextAction": "73db1af9-96e3-4f6e-89d5-45e0afff39d1"
                    },
                    "73db1af9-96e3-4f6e-89d5-45e0afff39d1": {
                        "name": "Wrap up",
                        "titleEn": "Your message",
                        "titleFr": "Your message [FR]",
                        "autoFlow": false,
                        "elements": [
                            "10",
                            "11",
                            "13"
                        ],
                        "nextAction": "review"
                    },
                    "f695c318-73c3-4ba1-8807-6594992ac528": {
                        "name": "No account",
                        "titleEn": "Account sign-up",
                        "titleFr": "Account sign-up [FR]",
                        "autoFlow": false,
                        "elements": [
                            "7",
                            "8",
                            "9"
                        ],
                        "nextAction": "73db1af9-96e3-4f6e-89d5-45e0afff39d1"
                    }
                },
                "groupsLayout": [
                    "598121d4-5439-4b58-a3e0-517579aafb0e",
                    "f695c318-73c3-4ba1-8807-6594992ac528",
                    "73db1af9-96e3-4f6e-89d5-45e0afff39d1"
                ],
                "lastGeneratedElementId": 10
            },
            "isPublished": false,
            "securityAttribute": "Protected A"
        } as PublicFormRecord;

        // Helper to get element by id
        const getElement = (id: number) =>
            formRecord.form.elements.find((el: FormElement) => el.id === id) as FormElement;


        const valuesHasAccountReferYes = {
            "1": "yes",
            "3": "",
            "4": "",
            "5": "",
            "7": "",
            "8": "",
            "9": "",
            "10": "",
            "11": "",
            "12": "yes",
            "13": "",
            "currentGroup": "598121d4-5439-4b58-a3e0-517579aafb0e",
            "groupHistory": [
                "start",
                "598121d4-5439-4b58-a3e0-517579aafb0e",
                "73db1af9-96e3-4f6e-89d5-45e0afff39d1"
            ],
            "matchedIds": [
                "12.0",
                "1.0"
            ]
        };

        // Should show refer field (13), not if refer=no
        expect(checkVisibilityRecursive(formRecord, getElement(13), valuesHasAccountReferYes)).toBe(true);
        // Should show discount code (11) only if "Do you have an account?" is "yes"
        expect(checkVisibilityRecursive(formRecord, getElement(11), valuesHasAccountReferYes)).toBe(true);
        // Should not show refer field if refer=no
        const valuesHasAccountReferNo = { ...valuesHasAccountReferYes, "12": "no", "matchedIds": ["12.1", "1.0"] };
        expect(checkVisibilityRecursive(formRecord, getElement(13), valuesHasAccountReferNo)).toBe(false);


        // --- No account flow ---
        const valuesNoAccount = {
            "1": "no",
            "3": "",
            "4": "",
            "5": "",
            "7": "",
            "8": "",
            "9": "",
            "10": "",
            "11": "",
            "12": "",
            "13": "",
            "currentGroup": "f695c318-73c3-4ba1-8807-6594992ac528",
            "groupHistory": [
                "start",
                "f695c318-73c3-4ba1-8807-6594992ac528",
                "73db1af9-96e3-4f6e-89d5-45e0afff39d1"
            ],
            "matchedIds": [
                "1.1"
            ]
        };
        // Should not show refer field (13) in this flow
        expect(checkVisibilityRecursive(formRecord, getElement(13), valuesNoAccount)).toBe(false);
        // Should not show discount code (11) in this flow
        expect(checkVisibilityRecursive(formRecord, getElement(11), valuesNoAccount)).toBe(false);

        // --- Start group, only element 1 visible ---
        const valuesStart = {
            "1": "",
            "currentGroup": "start",
            "groupHistory": ["start"],
            "matchedIds": []
        };
        expect(checkVisibilityRecursive(formRecord, getElement(1), valuesStart)).toBe(true);
        expect(checkVisibilityRecursive(formRecord, getElement(3), valuesStart)).toBe(false);

        const valuesThree = {
            "1": "no",
            "3": "",
            "4": "",
            "5": "",
            "7": "",
            "8": "",
            "9": "",
            "10": "",
            "11": "",
            "12": "",
            "13": "",
            "currentGroup": "f695c318-73c3-4ba1-8807-6594992ac528",
            "groupHistory": [
                "start",
                "f695c318-73c3-4ba1-8807-6594992ac528",
                "73db1af9-96e3-4f6e-89d5-45e0afff39d1"
            ],
            "matchedIds": [
                "1.1"
            ]
        }

        expect(checkVisibilityRecursive(formRecord, getElement(13), valuesThree)).toBe(false);

        // --- Edge case: missing groupHistory ---
        const valuesMissingHistory = {
            "1": "yes",
            "12": "yes",
            "currentGroup": "598121d4-5439-4b58-a3e0-517579aafb0e",
            "matchedIds": ["12.0", "1.0"]
        };
        expect(checkVisibilityRecursive(formRecord, getElement(13), valuesMissingHistory)).toBe(false);

        // --- Edge case: wrong group, should not show ---
        const valuesWrongGroup = {
            "1": "yes",
            "12": "yes",
            "currentGroup": "start",
            "groupHistory": ["start"],
            "matchedIds": ["12.0", "1.0"]
        };
        expect(checkVisibilityRecursive(formRecord, getElement(13), valuesWrongGroup)).toBe(false);
    })
})