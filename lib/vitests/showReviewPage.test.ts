import { expect } from 'vitest'
import { FormProperties } from "@lib/types";
import { showReviewPage } from "@lib/utils/form-builder/showReviewPage";
import form from "../../__fixtures__/testDataWithGroupsLayout.json";

describe("showReviewPage function", () => {
  it("Handles undefined", () => {
    const form = undefined as unknown as FormProperties;
    expect(showReviewPage(form)).toBe(false);
  });

  it("Handles null", () => {
    const form = null as unknown as FormProperties;
    expect(showReviewPage(form)).toBe(false);
  });

  it("Handles non array", () => {
    const form = {} as FormProperties;
    expect(showReviewPage(form)).toBe(false);
  });

  it("Handles form with empty groupsLayout", () => {
    const emptyGroupsLayout = { groupsLayout: [] as string[] } as FormProperties;
    expect(showReviewPage(emptyGroupsLayout)).toBe(false);
  });

  it("Handles form with Ids in groupsLayout", () => {
    expect(showReviewPage(form as FormProperties)).toBe(true);
  });
});
