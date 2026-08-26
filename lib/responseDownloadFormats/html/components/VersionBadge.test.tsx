import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VersionBadge } from "./VersionBadge";

describe("VersionBadge", () => {
  it("renders a compact version badge", () => {
    const markup = renderToStaticMarkup(<VersionBadge versionNumber={3} />);

    expect(markup).toContain("Version 3");
  });

  it("renders nothing when no version is available", () => {
    const markup = renderToStaticMarkup(<VersionBadge versionNumber={null} />);

    expect(markup).toBe("");
  });
});
