/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Formik } from "formik";
import { FileInput } from "@clientComponents/forms";
import { logMessage } from "@lib/logger";
import { describe, it, expect, vi } from "vitest";

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

  it("associates the question label with the file input and activates it once", () => {
    render(
      <Formik onSubmit={() => {}} initialValues={{ pdf: { file: "", name: "", src: "" } }}>
        <>
          <label htmlFor="pdf">Upload a PDF</label>
          <FileInput {...inputProps} />
        </>
      </Formik>
    );

    const input = screen.getByTestId("file").querySelector('input[type="file"]');
    const label = screen.getByText("Upload a PDF") as HTMLLabelElement;
    expect(label.control).toBe(input);

    const onClick = vi.fn();
    input?.addEventListener("click", onClick);
    fireEvent.click(label);
    expect(onClick).toHaveBeenCalledOnce();
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
    expect(screen.getByTestId("errorMessage")).toHaveAttribute("id", "errorMessage-pdf");
  });
});
