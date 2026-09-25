/**
 * @vitest-environment jsdom
 */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { Formik } from "formik";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StarRating } from "./StarRating";

const renderStarRating = ({
  required = true,
  error,
}: {
  required?: boolean;
  error?: string;
} = {}) => {
  render(
    <Formik
      initialValues={{ rating: "" }}
      initialErrors={error ? { rating: error } : undefined}
      onSubmit={vi.fn()}
    >
      <>
        <span id="label-rating">Rating</span>
        <StarRating id="rating" name="rating" required={required} />
      </>
    </Formik>
  );
};

describe("StarRating", () => {
  afterEach(() => cleanup());

  it("exposes required state on the radiogroup without native required inputs", () => {
    renderStarRating();

    expect(screen.getByRole("radiogroup", { name: "Rating" })).toHaveAttribute(
      "aria-required",
      "true"
    );

    // Radiogroup should manage aria-required not the radio items
    screen.getAllByRole("radio").forEach((radio) => {
      expect(radio).not.toHaveAttribute("required");
      expect(radio).not.toHaveAttribute("aria-required");
    });
  });

  it("does not expose required state when optional", () => {
    renderStarRating({ required: false });

    expect(screen.getByRole("radiogroup", { name: "Rating" })).not.toHaveAttribute(
      "aria-required"
    );
  });

  it("associates a validation error with the radiogroup", () => {
    renderStarRating({ error: "Select a rating" });

    const group = screen.getByRole("radiogroup", { name: "Rating" });
    const error = screen.getByRole("alert");

    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAttribute("aria-describedby", "errorMessage-rating");
    expect(error).toHaveAttribute("id", "errorMessage-rating");
    expect(error).toHaveTextContent("Select a rating");
  });
});