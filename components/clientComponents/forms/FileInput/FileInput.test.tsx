/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { Formik } from "formik";
import { FileInput } from "@clientComponents/forms";
import { logMessage } from "@lib/logger";
import { describe, it, expect } from "vitest";

const inputProps = {
  id: "pdf",
  name: "pdf",
  label: "Upload a PDF",
  fileType: ".pdf",
};

describe("FileInput component", () => {
  it("renders without errors", async () => {
    const { queryByTestId } = render(
      <Formik
        onSubmit={(values) => {
          logMessage.debug(values);
        }}
        initialValues={{ pdf: { file: "", name: "", src: "" } }}
      >
        <FileInput {...inputProps} />
      </Formik>
    );
    expect(queryByTestId("file")).toBeInTheDocument();
  });

  it("exposes required state without native required validation", () => {
    render(
      <Formik onSubmit={() => {}} initialValues={{ pdf: { file: "", name: "", src: "" } }}>
        <FileInput {...inputProps} required />
      </Formik>
    );

    const fileInput = screen.getByTestId("file").querySelector('input[type="file"]');

    expect(fileInput).not.toHaveAttribute("required");
    expect(fileInput).toHaveAttribute("aria-required", "true");
    expect(fileInput).not.toHaveAttribute("aria-invalid");
  });

  it("associates validation errors with the native file input", () => {
    render(
      <Formik
        onSubmit={() => {}}
        initialValues={{ pdf: { file: "", name: "", src: "" } }}
        initialErrors={{ pdf: "Choose a PDF" }}
        initialTouched={{ pdf: true }}
      >
        <FileInput {...inputProps} required />
      </Formik>
    );

    const fileInput = screen.getByTestId("file").querySelector('input[type="file"]');

    expect(fileInput).toHaveAttribute("aria-required", "true");
    expect(fileInput).toHaveAttribute("aria-invalid", "true");
    expect(fileInput).toHaveAttribute("aria-describedby", "pdf_file_selected errorMessage-pdf");
    expect(screen.getByRole("alert")).toHaveAttribute("id", "errorMessage-pdf");
  });
});
