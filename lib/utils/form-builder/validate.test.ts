import { describe, expect, it } from "vitest";
import navigationFocus from "../../../__fixtures__/navigationFocus.json";
import { FormProperties } from "@lib/types";
import { validateTemplate } from "./validate";

describe("validateTemplate", () => {
  it("reports full paths for invalid grouped navigation", () => {
    const invalidTemplate = JSON.parse(JSON.stringify(navigationFocus)) as FormProperties;
    delete invalidTemplate.groups?.review.nextAction;
    invalidTemplate.groups!.end.nextAction = "review";

    expect(validateTemplate(invalidTemplate).errors).toEqual([
      { property: "groups.review.nextAction", message: "formMissingProperty" },
      { property: "groups.end.nextAction", message: "formInvalidProperty" },
    ]);
  });
});
