import { describe, expect, it } from "vitest";
import { gcFormsAuthorizationParams } from "./gcFormsAuthorizationParams";

describe("gcFormsAuthorizationParams", () => {
  it("requests account selection when starting the gcForms OIDC flow", () => {
    expect(gcFormsAuthorizationParams).toEqual({
      max_age: 0,
      prompt: "select_account",
    });
  });
});
