import { afterEach, describe, expect, it, vi } from "vitest";
import { type TemplateStoreState } from "./types";
import { storageOptions } from "./storage";

vi.mock("@lib/logger", () => ({ logMessage: { debug: vi.fn() } }));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("template storage hydration", () => {
  it("migrates a persisted form before it replaces the initialized form", () => {
    vi.stubEnv("NODE_ENV", "production");
    const current = {
      form: { schemaVersion: 2, elements: [] },
    } as unknown as TemplateStoreState;
    const persisted = {
      form: {
        schemaVersion: 1,
        titleEn: "Unsaved title",
        elements: [
          {
            id: 7,
            type: "dynamicRow",
            properties: {
              subElements: [
                {
                  id: 701,
                  type: "textField",
                  properties: {
                    stepCount: null,
                    validation: { type: "number", required: false },
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const merged = storageOptions.merge(persisted, current);

    expect(merged.form.schemaVersion).toBe(2);
    expect(merged.form.titleEn).toBe("Unsaved title");
    expect(merged.form.elements[0].properties.subElements![0].properties).not.toHaveProperty(
      "stepCount"
    );
    expect(persisted.form.elements[0].properties.subElements[0].properties.stepCount).toBeNull();
  });

  it("keeps the initialized form when no persisted form exists", () => {
    vi.stubEnv("NODE_ENV", "production");
    const current = { form: { schemaVersion: 2, elements: [] } } as unknown as TemplateStoreState;

    expect(storageOptions.merge({}, current).form).toBe(current.form);
  });
});
