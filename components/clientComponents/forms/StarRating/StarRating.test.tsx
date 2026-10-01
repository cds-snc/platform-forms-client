/**
 * @vitest-environment jsdom
 */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { Formik } from "formik";
import { GenerateElement } from "@lib/formBuilder";
import type { FormElement } from "@gcforms/types";
import { Language } from "@lib/types/form-builder-types";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StarRating } from "./StarRating";

const starRatingData = {
  id: 1,
  type: "starRating",
  properties: {
    titleEn: "Rating",
    titleFr: "Évaluation",
    descriptionEn: "Choose a rating from one to five stars.",
    descriptionFr: "Choisissez une note de une à cinq étoiles.",
    validation: {
      required: true,
    },
    numberOfStars: 5,
  },
} as const as FormElement;

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

    expect(screen.getByRole("radiogroup", { name: "Rating" })).not.toHaveAttribute("aria-required");
  });

  it("does not include required text in the generated radiogroup name", () => {
    render(
      <Formik onSubmit={vi.fn()} initialValues={{}}>
        <GenerateElement element={starRatingData} language={"en" as Language} isTestMode={true} />
      </Formik>
    );

    const group = screen.getByRole("radiogroup");

    expect(group).toHaveAccessibleName("Rating");
    expect(group).toHaveAttribute("aria-required", "true");
    expect(screen.getByTestId("label").querySelector(".visually-hidden")).not.toBeInTheDocument();
  });

  it("associates the generated hint with the radiogroup", () => {
    render(
      <Formik onSubmit={vi.fn()} initialValues={{}}>
        <GenerateElement element={starRatingData} language={"en" as Language} isTestMode={true} />
      </Formik>
    );

    const group = screen.getByRole("radiogroup");
    const fieldset = screen.getByRole("group");

    expect(group).toHaveAccessibleDescription("Choose a rating from one to five stars.");
    expect(group).toHaveAttribute("aria-describedby", "desc-1");
    expect(fieldset).not.toHaveAttribute("aria-describedby");
  });

  it("associates a validation error with the radiogroup", () => {
    renderStarRating({ error: "Select a rating" });

    const group = screen.getByRole("radiogroup", { name: "Rating" });
    const error = screen.getByTestId("errorMessage");

    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAttribute("aria-describedby", "errorMessage-rating");
    expect(error).toHaveAttribute("id", "errorMessage-rating");
    expect(error).toHaveTextContent("Select a rating");
  });

  it("does not duplicate the validation error on the generated fieldset", () => {
    render(
      <Formik
        initialValues={{ "1": "" }}
        initialErrors={{ "1": "Select a rating" }}
        initialTouched={{ "1": true }}
        onSubmit={vi.fn()}
      >
        <GenerateElement element={starRatingData} language={"en" as Language} isTestMode={true} />
      </Formik>
    );

    expect(screen.getByRole("group")).not.toHaveAttribute("aria-describedby");
  });
});
