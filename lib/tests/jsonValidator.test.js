/**
 * @jest-environment node
 */

import { createMocks } from "node-mocks-http";
import { jsonValidator } from "@lib/middleware";
import templatesSchema from "../middleware/schemas/templates.schema.json";
import validFormTemplate from "../../__fixtures__/validFormTemplate.json";
import brokenFormTemplate from "../../__fixtures__/brokenFormTemplate.json";
import validFormTemplateWithHTMLInDynamicRow from "../../__fixtures__/validFormTemplateWithHTMLInDynamicRow.json";

describe("Test JSON validation scenarios", () => {
  it("Should pass with valid JSON", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        formConfig: validFormTemplate,
      },
    });

    const result = await jsonValidator(templatesSchema, { jsonKey: "formConfig" })(req, res);

    expect(result).toEqual({ next: true });
  });

  it("Should fail with invalid JSON", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        formConfig: brokenFormTemplate,
      },
    });

    await jsonValidator(templatesSchema, { jsonKey: "formConfig" })(req, res);
    expect(JSON.parse(res._getData()).error).toContain(
      'JSON Validation Error: instance requires property "privacyPolicy",instance requires property "confirmation"'
    );
    expect(res.statusCode).toBe(400);
  });

  it("Should fail with invalid Schema", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        formConfig: validFormTemplate,
      }),
    });

    await jsonValidator("", { jsonKey: "formConfig" })(req, res);

    expect(JSON.parse(res._getData()).error).toEqual("Malformed API Request");
    expect(res.statusCode).toBe(500);
  });

  it("Should fail if there is any HTML in string fields", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        formConfig: validFormTemplateWithHTMLInDynamicRow,
      },
    });

    await jsonValidator(templatesSchema, { jsonKey: "formConfig", noHTML: true })(req, res);

    expect(JSON.parse(res._getData()).error).toContain("HTML detected in JSON");
    expect(res.statusCode).toBe(400);
  });
});
