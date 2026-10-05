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

  it.each([
    "textField",
    "textArea",
    "numberInput",
    "dropdown",
    "radio",
    "checkbox",
    "combobox",
    "fileInput",
    "dynamicRow",
    "richText",
    "attestation",
    "addressComplete",
    "formattedDate",
    "starRating",
  ])("accepts %s with its minimal strict validation", (type) => {
    const element = { id: 1, type, properties: { validation: { required: false } } };

    expect(validateElement(element, 2)).toBe(true);
    expect(validateElement({ ...element, properties: {} }, 2)).toBe(false);
    expect(validateElement({ ...element, properties: { validation: {} } }, 2)).toBe(false);
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
