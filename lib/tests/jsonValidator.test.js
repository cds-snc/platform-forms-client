import { createMocks } from "node-mocks-http";
import { jsonValidator } from "@lib/middleware";
import templatesSchema from "../middleware/schemas/templates.schema.json";
import validFormTemplate from "../../tests/data/validFormTemplate.json";
import brokenFormTemplate from "../../tests/data/brokenFormTemplate.json";

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
        method: "INSERT",
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
        method: "INSERT",
      },
    });

    await jsonValidator(templatesSchema, { jsonKey: "formConfig" })(req, res);
    expect(JSON.parse(res._getData()).error).toContain('instance requires property "form"');
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
        method: "INSERT",
      }),
    });

    await jsonValidator("", { jsonKey: "formConfig" })(req, res);

    expect(JSON.parse(res._getData()).error).toEqual("Malformed API Request");
    expect(res.statusCode).toBe(500);
  });
});
