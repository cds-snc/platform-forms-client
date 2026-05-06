/**
 * @vitest-environment jsdom
 */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BaseElementArray } from "./BaseElementArray";

describe("BaseElementArray", () => {
  afterEach(() => cleanup());

  it("renders apostrophes in checkbox review values without exposing HTML entities", () => {
    render(
      <BaseElementArray
        splitValues={true}
        formItem={{
          type: "checkbox",
          label: "J'accepte :",
          values: ["j'accepte", "condition d'aujourd'hui"],
          element: undefined,
        }}
      />
    );

    expect(screen.getByText("j'accepte")).toBeInTheDocument();
    expect(screen.getByText("condition d'aujourd'hui")).toBeInTheDocument();
    expect(screen.queryByText("j&#39;accepte")).not.toBeInTheDocument();
  });

  it("renders user-provided HTML-like content as text instead of markup", () => {
    render(
      <BaseElementArray
        splitValues={true}
        formItem={{
          type: "checkbox",
          label: "Unsafe example",
          values: ["<script>alert('xss')</script>", "a & b"],
          element: undefined,
        }}
      />
    );

    expect(screen.getByText("<script>alert('xss')</script>")).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
    expect(screen.getByText("a & b")).toBeInTheDocument();
  });
});
