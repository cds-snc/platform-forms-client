import React from "react";
import { render } from "@testing-library/react";
import { Formik } from "formik";
import { FileInput } from "./FileInput";

const inputProps = {
  key: "id",
  id: "id",
  name: "pdf",
  label: "Upload a PDF",
  value: "",
  fileType: ".pdf",
};

describe("FileInput component", () => {
  it("renders without errors", async () => {
    const { queryByTestId } = render(
      <Formik
        initialValues={{
          "input-radio": "",
        }}
        onSubmit={() => {}}
      >
        <FileInput {...inputProps} />
      </Formik>
    );
    expect(queryByTestId("file")).toBeInTheDocument();
  });
});
