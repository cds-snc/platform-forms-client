import React from "react";
import { render } from "@testing-library/react";
import Form from "../Form/Form";
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
      <Form>
        <FileInput {...inputProps} />
      </Form>
    );
    expect(queryByTestId("file")).toBeInTheDocument();
  });
});
