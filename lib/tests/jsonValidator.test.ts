import { describe, it, expect } from "vitest";
import { Validator } from "jsonschema";
import { NextRequest } from "next/server";
import { jsonValidator } from "@lib/middleware";
import templatesSchema from "../middleware/schemas/templates.schema.json";
import validFormTemplate from "../../__fixtures__/validFormTemplate.json";
import brokenFormTemplate from "../../__fixtures__/brokenFormTemplate.json";
import validFormTemplateWithHTMLInDynamicRow from "../../__fixtures__/validFormTemplateWithHTMLInDynamicRow.json";
import navigationFocus from "../../__fixtures__/navigationFocus.json";
import { MiddlewareReturn } from "@lib/types";

describe("Version-gated strict element validation", () => {
  const validator = new Validator();
  const template = {
    titleEn: "Title",
    titleFr: "Titre",
    privacyPolicy: {},
    confirmation: {},
    layout: [1],
    groups: {},
    groupsLayout: [],
    elements: [],
  };
  const validateElement = (element: object, schemaVersion?: number) =>
    validator.validate(
      {
        ...template,
        ...(schemaVersion === undefined ? {} : { schemaVersion }),
        elements: [element],
      },
      templatesSchema
    ).valid;

  it.each([undefined, 0, 1, 2, 3])(
    "selects the appropriate element schema at version %s",
    (schemaVersion) => {
      const legacyElement = {
        id: 1,
        type: "textField",
        properties: { validation: { required: false, type: "number" } },
      };

      expect(validateElement(legacyElement, schemaVersion)).toBe((schemaVersion ?? 0) < 2);
    }
  );

  const dynamicRowSettings = {
    rowTitleEn: "Row",
    rowTitleFr: "Ligne",
    addButtonTextEn: "Add",
    removeButtonTextEn: "Remove",
    addButtonTextFr: "Ajouter",
    removeButtonTextFr: "Supprimer",
  };

  it.each([
    ["textField", { validation: { required: false } }],
    ["textArea", { validation: { required: false } }],
    ["numberInput", { validation: { required: false } }],
    ["dropdown", { validation: { required: false }, choices: [{ en: "A", fr: "A" }] }],
    ["radio", { validation: { required: false }, choices: [{ en: "A", fr: "A" }] }],
    ["checkbox", { validation: { required: false }, choices: [{ en: "A", fr: "A" }] }],
    ["combobox", { validation: { required: false }, managedChoices: "departments" }],
    ["fileInput", { validation: { required: false } }],
    [
      "dynamicRow",
      {
        validation: { required: false },
        dynamicRow: dynamicRowSettings,
        subElements: [
          { id: 2, type: "textField", properties: { validation: { required: false } } },
        ],
      },
    ],
    ["richText", { descriptionEn: "Section heading" }],
    ["attestation", { validation: { required: false } }],
    ["addressComplete", { validation: { required: false } }],
    ["formattedDate", { validation: { required: false } }],
    ["starRating", { validation: { required: false } }],
  ] as const)("accepts %s with its minimal strict properties", (type, properties) => {
    const element = { id: 1, type, properties };

    expect(validateElement(element, 2)).toBe(true);
    if (type === "richText") {
      expect(validateElement({ ...element, properties: {} }, 2)).toBe(true);
    } else {
      expect(validateElement({ ...element, properties: {} }, 2)).toBe(false);
      expect(validateElement({ ...element, properties: { validation: {} } }, 2)).toBe(false);
    }
  });

  it.each([
    ["textField", { required: false, minValue: 1 }],
    ["textArea", { required: false, all: true }],
    ["numberInput", { required: false, type: "number" }],
    ["checkbox", { required: true, maxLength: 10 }],
    ["dropdown", { required: false, all: true }],
    ["formattedDate", { required: false, type: "text" }],
  ])("rejects mismatched validation for %s", (type, validation) => {
    expect(validateElement({ id: 1, type, properties: { validation } }, 2)).toBe(false);
  });

  it.each([
    ["textField", { choices: [] }],
    ["dropdown", { choices: [{ en: "A", fr: "A" }], managedChoices: "departments" }],
    ["checkbox", { choices: [{ en: "A", fr: "A" }], strictValue: true }],
    ["richText", { descriptionEn: "Section heading", unknownProperty: true }],
  ])("rejects unknown or incompatible properties on %s", (type, extraProperties) => {
    expect(
      validateElement(
        { id: 1, type, properties: { validation: { required: false }, ...extraProperties } },
        2
      )
    ).toBe(false);
  });

  it("requires valid inline choices or one managed source", () => {
    const radio = {
      id: 1,
      type: "radio",
      properties: { validation: { required: false }, choices: [{ en: "A", fr: "A" }] },
    };
    expect(validateElement(radio, 2)).toBe(true);
    expect(validateElement({ ...radio, properties: { ...radio.properties, choices: [] } }, 2)).toBe(
      false
    );
    expect(
      validateElement(
        {
          ...radio,
          properties: { ...radio.properties, choices: [{ en: "A" }] },
        },
        2
      )
    ).toBe(false);
    expect(
      validateElement(
        {
          ...radio,
          properties: {
            ...radio.properties,
            choices: Array.from({ length: 401 }, () => ({ en: "A", fr: "A" })),
          },
        },
        2
      )
    ).toBe(false);

    const combobox = {
      id: 1,
      type: "combobox",
      properties: { validation: { required: false }, managedChoices: "departments" },
    };
    expect(validateElement(combobox, 2)).toBe(true);
    expect(
      validateElement(
        { ...combobox, properties: { ...combobox.properties, managedChoices: "unknown" } },
        2
      )
    ).toBe(false);
    expect(
      validateElement(
        {
          ...combobox,
          properties: { ...combobox.properties, choices: [{ en: "A", fr: "A" }] },
        },
        2
      )
    ).toBe(false);
  });

  it("requires concrete, unique visibility choice IDs", () => {
    const element = {
      id: 1,
      type: "textField",
      properties: { validation: { required: false }, conditionalRules: [{ choiceId: "2.0" }] },
    };
    expect(validateElement(element, 2)).toBe(true);
    expect(
      validateElement(
        {
          ...element,
          properties: { ...element.properties, conditionalRules: [{ choiceId: "2.catch-all" }] },
        },
        2
      )
    ).toBe(false);
    expect(
      validateElement(
        {
          ...element,
          properties: {
            ...element.properties,
            conditionalRules: [{ choiceId: "2.0" }, { choiceId: "2.0" }],
          },
        },
        2
      )
    ).toBe(false);
  });

  it("enforces dynamic-row labels, children, and row limits", () => {
    const dynamicRow = {
      id: 1,
      type: "dynamicRow",
      properties: {
        validation: { required: false },
        dynamicRow: dynamicRowSettings,
        subElements: [
          { id: 2, type: "textField", properties: { validation: { required: false } } },
        ],
        maxNumberOfRows: 50,
      },
    };
    expect(validateElement(dynamicRow, 2)).toBe(true);
    expect(
      validateElement(
        { ...dynamicRow, properties: { ...dynamicRow.properties, maxNumberOfRows: 51 } },
        2
      )
    ).toBe(false);
    expect(
      validateElement(
        { ...dynamicRow, properties: { ...dynamicRow.properties, subElements: [] } },
        2
      )
    ).toBe(false);
  });

  it("requires group containers on strict templates but permits them to be empty", () => {
    const strictTemplate = { ...template, schemaVersion: 2 };
    expect(validator.validate(strictTemplate, templatesSchema).valid).toBe(true);
    expect(
      validator.validate(
        { ...strictTemplate, groups: undefined, groupsLayout: undefined },
        templatesSchema
      ).valid
    ).toBe(false);
  });

  it("requires positive integer layout IDs and excludes reserved groups from groupsLayout", () => {
    const strictTemplate = { ...template, schemaVersion: 2 };
    expect(validator.validate({ ...strictTemplate, layout: [1.5] }, templatesSchema).valid).toBe(
      false
    );
    expect(validator.validate({ ...strictTemplate, layout: [0] }, templatesSchema).valid).toBe(
      false
    );
    expect(
      validator.validate({ ...strictTemplate, groupsLayout: ["review"] }, templatesSchema).valid
    ).toBe(false);
  });

  it.each(["phone", "tel", "date", "custom"])(
    "accepts the supported text validation type %s without legacy schema interference",
    (type) => {
      expect(
        validateElement(
          { id: 1, type: "textField", properties: { validation: { required: true, type } } },
          2
        )
      ).toBe(true);
    }
  );

  it("applies strict validation recursively to dynamic-row children", () => {
    const element = {
      id: 1,
      type: "dynamicRow",
      properties: {
        validation: { required: false },
        dynamicRow: dynamicRowSettings,
        subElements: [
          {
            id: 2,
            type: "numberInput",
            properties: { validation: { required: false, type: "number" } },
          },
        ],
      },
    };

    expect(validateElement(element, 1)).toBe(true);
    expect(validateElement(element, 2)).toBe(false);
    expect(
      validateElement(
        {
          ...element,
          properties: {
            ...element.properties,
            subElements: [
              { id: 2, type: "numberInput", properties: { validation: { required: false } } },
            ],
          },
        },
        2
      )
    ).toBe(true);

    expect(
      validateElement(
        {
          ...element,
          properties: {
            ...element.properties,
            subElements: [
              {
                id: 2,
                type: "textField",
                properties: {
                  validation: { required: false },
                  conditionalRules: [{ choiceId: "3.0" }],
                },
              },
            ],
          },
        },
        2
      )
    ).toBe(false);
  });

  it("preserves grouped navigation validation for strict templates", () => {
    const strictTemplate = { ...navigationFocus, schemaVersion: 2, elements: [] };
    expect(validator.validate(strictTemplate, templatesSchema).valid).toBe(true);
    expect(
      validator.validate(
        {
          ...strictTemplate,
          groups: {
            ...strictTemplate.groups,
            end: { ...strictTemplate.groups.end, nextAction: "review" },
          },
        },
        templatesSchema
      ).valid
    ).toBe(false);
  });
});

describe("Test JSON validation scenarios", () => {
  it("Should pass with valid JSON", async () => {
    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "POST" }));

    const { next }: MiddlewareReturn = await jsonValidator(templatesSchema, {
      jsonKey: "formConfig",
    })(req, {
      formConfig: validFormTemplate,
    });

    expect(next).toEqual(true);
  });

  it("Should fail with invalid JSON", async () => {
    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "POST" }));
    const { next, response }: MiddlewareReturn = await jsonValidator(templatesSchema, {
      jsonKey: "formConfig",
    })(req, {
      formConfig: brokenFormTemplate,
    });
    expect(next).toEqual(false);
    expect(await response?.json()).toMatchObject({
      error:
        'JSON Validation Error: instance requires property "privacyPolicy",instance requires property "confirmation"',
    });
  });

  it("Should fail with invalid Schema", async () => {
    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "POST" }));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore  - intentionally passing invalid schema
    const { next, response }: MiddlewareReturn = await jsonValidator("", { jsonKey: "formConfig" })(
      req,
      {
        formConfig: validFormTemplate,
      }
    );

    expect(next).toEqual(false);
    expect(await response?.json()).toMatchObject({
      error: "JSON Validation Error: Expected `schema` to be an object or boolean",
    });
  });

  it("Should pass with granular grouped navigation", async () => {
    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "POST" }));
    const { next }: MiddlewareReturn = await jsonValidator(templatesSchema, {
      jsonKey: "formConfig",
    })(req, {
      formConfig: navigationFocus,
    });

    expect(next).toEqual(true);
  });

  it("Should fail with invalid reserved group navigation", async () => {
    const invalidTemplates = [
      {
        ...navigationFocus,
        groups: {
          ...navigationFocus.groups,
          end: {
            ...navigationFocus.groups.end,
            nextAction: "review",
          },
        },
      },
      {
        ...navigationFocus,
        groups: {
          ...navigationFocus.groups,
          review: {
            ...navigationFocus.groups.review,
            nextAction: "start",
          },
        },
      },
      {
        ...navigationFocus,
        groups: Object.fromEntries(
          Object.entries(navigationFocus.groups).filter(([groupId]) => groupId !== "end")
        ),
      },
      {
        ...navigationFocus,
        groups: {
          ...navigationFocus.groups,
          "invalid-group": {
            ...navigationFocus.groups.review,
            unexpectedProperty: true,
          },
        },
      },
    ];

    await Promise.all(
      invalidTemplates.map(async (formConfig) => {
        const req = new NextRequest(
          new Request("http://localhost:3000/api/test", { method: "POST" })
        );
        const { next }: MiddlewareReturn = await jsonValidator(templatesSchema, {
          jsonKey: "formConfig",
        })(req, {
          formConfig,
        });

        expect(next).toEqual(false);
      })
    );
  });

  it("Should omit compound schema errors from validation response", async () => {
    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "POST" }));
    const invalidEndTemplate = {
      ...navigationFocus,
      groups: {
        ...navigationFocus.groups,
        end: {
          ...navigationFocus.groups.end,
          nextAction: "review",
        },
      },
    };
    const { response }: MiddlewareReturn = await jsonValidator(templatesSchema, {
      jsonKey: "formConfig",
    })(req, {
      formConfig: invalidEndTemplate,
    });

    expect(await response?.json()).toMatchObject({
      error: "JSON Validation Error: instance.groups.end is of prohibited type [object Object]",
      details: [
        {
          path: "groups.end.nextAction",
          keyword: "not",
          message: "is of prohibited type [object Object]",
        },
      ],
    });
  });

  it("Should fail when an exit group is missing a localized exit URL", async () => {
    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "POST" }));
    const invalidExitTemplate = {
      ...navigationFocus,
      groups: {
        ...navigationFocus.groups,
        "exit-page": {
          name: "Exit page",
          titleEn: "Exit page",
          titleFr: "Page de sortie",
          elements: [],
          nextAction: "exit",
          exitUrlEn: "https://example.com/en",
        },
      },
    };
    const { next }: MiddlewareReturn = await jsonValidator(templatesSchema, {
      jsonKey: "formConfig",
    })(req, {
      formConfig: invalidExitTemplate,
    });

    expect(next).toEqual(false);
  });

  it("Should fail if there is any HTML in string fields", async () => {
    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "POST" }));
    const { next, response }: MiddlewareReturn = await jsonValidator(templatesSchema, {
      jsonKey: "formConfig",
      noHTML: true,
    })(req, {
      formConfig: validFormTemplateWithHTMLInDynamicRow,
    });
    expect(next).toEqual(false);
    expect(await response?.json()).toMatchObject({
      error: "JSON Validation Error: HTML detected in JSON",
    });
  });
});
