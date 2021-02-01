import React from "react";
import { render } from "@testing-library/react";

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
  it("renders without errors", () => {
    const { queryByTestId } = render(<FileInput {...inputProps} />);
    expect(queryByTestId("file")).toBeInTheDocument();
  });
});
