import { describe, expect, it } from "vitest";
import { buildAccountsSearchParams, parseAccountsSearchParams } from "./search";

describe("accounts search params", () => {
  it("sanitizes free-text query params", () => {
    const result = parseAccountsSearchParams({
      query: "  sara\u0000.devillers@tbs-sct.gc.ca   ",
      property: "email",
      page: "2",
    });

    expect(result).toEqual({
      page: 2,
      query: "sara .devillers@tbs-sct.gc.ca",
      property: "email",
      userState: undefined,
      hasFilters: true,
    });
  });

  it("treats id params as sanitized id searches", () => {
    const result = parseAccountsSearchParams({
      id: " cmp1aao3z000hmonbhu53dvcf<script>",
      property: "email",
      page: "-10",
    });

    expect(result).toEqual({
      page: 1,
      query: "cmp1aao3z000hmonbhu53dvcfscript",
      property: "id",
      userState: undefined,
      hasFilters: true,
    });
  });

  it("sanitizes generated params before writing them to the url", () => {
    const params = buildAccountsSearchParams({
      query: "  abc\u0000def  ",
      property: "email",
      page: 3,
      userState: "active",
    });

    expect(params.toString()).toBe("query=abc+def&userState=active&page=3");
  });
});
