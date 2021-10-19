import { createMocks } from "node-mocks-http";
import validate from "../middleware/jsonValidator";
import templatesSchema from "../middleware/schemas/templates.schema.json";
import validFormTemplate from "../../tests/validFormTemplate.json";
import brokenFormTemplate from "../../tests/brokenFormTemplate.json";

describe("Test JSON validation scenarios", () => {
  it("Should pass with valid JSON", async () => {
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

    const handler = async (req, res) => {
      res.statusCode = 200;
    };

    await validate(templatesSchema, handler, { jsonKey: "formConfig" })(req, res);

    expect(res.statusCode).toBe(200);
  });

  it("Should fail with invalid JSON", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        formConfig: brokenFormTemplate,
        method: "INSERT",
      }),
    });

    const handler = async (req, res) => {
      res.statusCode = 200;
    };

    await validate(templatesSchema, handler, { jsonKey: "formConfig" })(req, res);

    expect(JSON.parse(res._getData()).error).toEqual('instance requires property "form"');
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

    const handler = async (req, res) => {
      res.statusCode = 200;
    };

    await validate("", handler, { jsonKey: "formConfig" })(req, res);

    expect(JSON.parse(res._getData()).error).toEqual("Malformed API Request");
    expect(res.statusCode).toBe(500);
  });
});
