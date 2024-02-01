/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { jsonValidator } from "@lib/middleware";
import templatesSchema from "../middleware/schemas/templates.schema.json";
import validFormTemplate from "../../__fixtures__/validFormTemplate.json";
import brokenFormTemplate from "../../__fixtures__/brokenFormTemplate.json";
import validFormTemplateWithHTMLInDynamicRow from "../../__fixtures__/validFormTemplateWithHTMLInDynamicRow.json";
import { MiddlewareReturn } from "@lib/types";

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
