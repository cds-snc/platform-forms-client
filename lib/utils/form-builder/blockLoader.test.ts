import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { type FormElement } from "@lib/types";
import { getTemplateSchema } from "@lib/templates/schemas/templates";
import { Validator } from "jsonschema";
import { loadBlockTemplate } from "@formBuilder/actions";
import { blockLoader } from "./blockLoader";

const blockTemplatesDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../public/static/templates"
);

vi.mock("@formBuilder/actions", () => ({
  loadBlockTemplate: vi.fn(),
}));

describe("blockLoader", () => {
  it("normalizes legacy attestation block properties before adding the block", async () => {
    const attestation = {
      type: "checkbox",
      properties: {
        subElements: [],
        choices: [{ en: "Condition 1", fr: "Condition 1" }],
        titleEn: "I agree to:",
        titleFr: "J'accepte :",
        validation: { required: true, all: true },
        descriptionEn: "",
        descriptionFr: "",
        placeholderEn: "",
        placeholderFr: "",
      },
    } as unknown as FormElement;
    vi.mocked(loadBlockTemplate).mockResolvedValue({ data: [attestation] } as never);
    const onData = vi.fn();

    await blockLoader("attestation", 0, onData);

    expect(onData).toHaveBeenCalledOnce();
    const [element, position] = onData.mock.calls[0];
    expect(position).toBe(0);
    expect(element.properties).not.toHaveProperty("subElements");
    expect(element.properties).not.toHaveProperty("placeholderEn");
    expect(element.properties).not.toHaveProperty("placeholderFr");
    expect(element.properties.validation).toEqual({ required: true, all: true });

    const validation = new Validator().validate([{ ...element, id: 1 }], {
      type: "array",
      items: { $ref: "#/definitions/elementStrict" },
      definitions: getTemplateSchema(2).definitions,
    });
    expect(validation.valid, JSON.stringify(validation.errors)).toBe(true);
  });

  it("keeps every built-in block template valid against schema version 2", () => {
    const schema = {
      type: "array",
      items: { $ref: "#/definitions/elementStrict" },
      definitions: getTemplateSchema(2).definitions,
    };
    const validator = new Validator();
    const blockTemplateFiles = readdirSync(blockTemplatesDirectory).filter((fileName) =>
      fileName.endsWith(".json")
    );

    for (const fileName of blockTemplateFiles) {
      const sourceElements = JSON.parse(
        readFileSync(resolve(blockTemplatesDirectory, fileName), "utf8")
      ) as FormElement[];
      const elements = sourceElements.map((element, index) => ({
        ...element,
        id: element.id ?? index + 1,
      }));
      const result = validator.validate(elements, schema);

      expect(result.valid, `${fileName}: ${JSON.stringify(result.errors)}`).toBe(true);
    }
  });
});
