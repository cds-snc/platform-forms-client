import { describe, expect, it, vi } from "vitest";
import publishTestForm from "@root/__fixtures__/publishTestForm.json";
import validFormTemplate from "@root/__fixtures__/validFormTemplate.json";
import { CURRENT_TEMPLATE_VERSION } from "@lib/templates/schemaVersioning/migrations";

vi.mock("@lib/logger", () => ({
  logMessage: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { POST } from "./route";

const makeRequest = (body: string, contentType = "application/json") =>
  new Request("https://forms.example/api/templates/validate", {
    method: "POST",
    headers: { "content-type": contentType },
    body,
  });

describe("template validate route", () => {
  it("migrates and validates a template against the latest schema", async () => {
    const response = await POST(makeRequest(JSON.stringify(publishTestForm)));
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.schemaVersion).toBe(CURRENT_TEMPLATE_VERSION);
    expect(result.migration).toEqual({
      fromVersion: expect.any(Number),
      toVersion: CURRENT_TEMPLATE_VERSION,
      problems: [],
    });
    expect(result.validateTemplate).toEqual({ valid: true, errors: [] });
    expect(result.schema).toEqual({ valid: true, errors: [] });
  });

  it("returns raw schema errors alongside validateTemplate errors", async () => {
    const template = structuredClone(validFormTemplate) as Record<string, unknown>;
    delete template.titleEn;

    const response = await POST(makeRequest(JSON.stringify(template)));
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.validateTemplate.valid).toBe(false);
    expect(result.validateTemplate.errors).toContainEqual({
      property: "titleEn",
      message: "formMissingProperty",
    });
    expect(result.schema.valid).toBe(false);
    expect(result.schema.errors).toContainEqual(
      expect.objectContaining({
        name: "required",
        argument: "titleEn",
        property: "instance",
        path: [],
        message: 'requires property "titleEn"',
      })
    );
  });

  it("reports migration problems and still validates against the latest schema", async () => {
    const response = await POST(
      makeRequest(
        JSON.stringify({
          schemaVersion: 1,
          titleEn: "Title",
          titleFr: "Titre",
          layout: [1],
          elements: [
            {
              id: 1,
              type: "radio",
              properties: {
                titleEn: "Choose",
                titleFr: "Choisir",
                validation: { required: false },
                choices: [
                  { en: "a", fr: "a" },
                  { en: "a", fr: "a" },
                ],
              },
            },
          ],
        })
      )
    );
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.migration.fromVersion).toBe(1);
    expect(result.migration.toVersion).toBe(1);
    expect(result.migration.problems).not.toHaveLength(0);
    expect(result.schemaVersion).toBe(CURRENT_TEMPLATE_VERSION);
    expect(result.schema.valid).toBe(false);
  });

  it("still returns raw schema errors when validateTemplate throws", async () => {
    const response = await POST(
      makeRequest(JSON.stringify({ titleEn: "Title", titleFr: "Titre", elements: ["1"] }))
    );
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.validateTemplate.error).toEqual(expect.objectContaining({ name: "TypeError" }));
    expect(result.schema.valid).toBe(false);
    expect(result.schema.errors.length).toBeGreaterThan(0);
  });

  it.each([
    ["non-JSON content type", makeRequest("{}", "text/plain"), 415],
    ["invalid JSON", makeRequest("{"), 400],
    ["non-template body", makeRequest(JSON.stringify({ titleEn: "x" })), 400],
    ["array body", makeRequest("[]"), 400],
  ])("rejects %s", async (_label, request, status) => {
    const response = await POST(request);
    expect(response.status).toBe(status);
  });
});
