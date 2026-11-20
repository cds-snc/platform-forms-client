import { describe, expect, it } from "vitest";
import { isProductionOrigin } from "@lib/origin";

describe("isProductionOrigin", () => {
  it("recognizes the production origin", () => {
    expect(isProductionOrigin("https://forms-formulaires.alpha.canada.ca")).toBe(true);
  });

  it("does not recognize non-production or missing origins", () => {
    expect(isProductionOrigin("https://forms-pr-8226.cdssandbox.xyz")).toBe(false);
    expect(isProductionOrigin(undefined)).toBe(false);
  });
});
