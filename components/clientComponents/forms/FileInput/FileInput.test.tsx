/**
 * @jest-environment jsdom
 */
import React from "react";
import { render } from "@testing-library/react";
import { Formik } from "formik";
import { FileInput } from "@clientComponents/forms";
import { logMessage } from "@lib/logger";

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
});
